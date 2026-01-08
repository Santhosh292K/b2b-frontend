'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

interface VideoCallRoomProps {
    appId: string;
    channelName: string;
    token: string;
    uid: string;
    onCallEnd: () => void;
}

export default function VideoCallRoom({
    appId,
    channelName,
    token,
    uid,
    onCallEnd,
}: VideoCallRoomProps) {
    const [isJoined, setIsJoined] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState<number[]>([]);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
    const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
    const localVideoRef = useRef<HTMLDivElement>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        let isInitializing = true;

        const init = async () => {
            try {
                // Create Agora client
                const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
                clientRef.current = client;

                // Event handlers
                client.on('user-published', async (user, mediaType) => {
                    if (!isMountedRef.current) return;

                    await client.subscribe(user, mediaType);

                    if (mediaType === 'video') {
                        setRemoteUsers((prev) => {
                            if (!prev.includes(user.uid as number)) {
                                return [...prev, user.uid as number];
                            }
                            return prev;
                        });

                        // Play remote video
                        const remoteVideoTrack = user.videoTrack;
                        const remotePlayerContainer = document.getElementById(
                            `remote-${user.uid}`
                        );
                        if (remoteVideoTrack && remotePlayerContainer) {
                            remoteVideoTrack.play(remotePlayerContainer);
                        }
                    }

                    if (mediaType === 'audio') {
                        const remoteAudioTrack = user.audioTrack;
                        remoteAudioTrack?.play();
                    }
                });

                client.on('user-unpublished', (user, mediaType) => {
                    if (mediaType === 'video') {
                        setRemoteUsers((prev) =>
                            prev.filter((id) => id !== user.uid)
                        );
                    }
                });

                client.on('user-left', (user) => {
                    setRemoteUsers((prev) =>
                        prev.filter((id) => id !== user.uid)
                    );
                });

                // Join channel
                await client.join(appId, channelName, token, uid);

                if (!isMountedRef.current) {
                    await client.leave();
                    return;
                }

                // Create and publish local tracks with fallback
                try {
                    // Try to create both camera and microphone
                    const [audioTrack, videoTrack] =
                        await AgoraRTC.createMicrophoneAndCameraTracks();

                    if (!isMountedRef.current) {
                        audioTrack.close();
                        videoTrack.close();
                        await client.leave();
                        return;
                    }

                    localAudioTrackRef.current = audioTrack;
                    localVideoTrackRef.current = videoTrack;

                    // Play local video
                    if (localVideoRef.current) {
                        videoTrack.play(localVideoRef.current);
                    }

                    // Publish tracks
                    await client.publish([audioTrack, videoTrack]);
                } catch (deviceError: any) {
                    console.warn('Failed to get camera/microphone:', deviceError);

                    // Fallback: Try audio only
                    try {
                        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

                        if (!isMountedRef.current) {
                            audioTrack.close();
                            await client.leave();
                            return;
                        }

                        localAudioTrackRef.current = audioTrack;
                        await client.publish([audioTrack]);
                        console.log('Joined with audio only (no camera available)');
                    } catch (audioError) {
                        console.warn('No audio/video devices available:', audioError);
                        // Join without publishing - can still see/hear remote users
                    }
                }

                if (isMountedRef.current) {
                    setIsJoined(true);
                }

                isInitializing = false;
            } catch (error) {
                console.error('Failed to join channel:', error);
                isInitializing = false;
            }
        };

        init();

        // Cleanup
        return () => {
            isMountedRef.current = false;

            // Only cleanup if initialization is complete
            if (!isInitializing) {
                const cleanup = async () => {
                    try {
                        if (localVideoTrackRef.current) {
                            localVideoTrackRef.current.close();
                        }
                        if (localAudioTrackRef.current) {
                            localAudioTrackRef.current.close();
                        }
                        if (clientRef.current) {
                            await clientRef.current.leave();
                        }
                    } catch (error) {
                        console.error('Cleanup error:', error);
                    }
                };
                cleanup();
            }
        };
    }, [appId, channelName, token, uid]);

    const toggleMute = () => {
        if (localAudioTrackRef.current) {
            localAudioTrackRef.current.setEnabled(isMuted);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localVideoTrackRef.current) {
            localVideoTrackRef.current.setEnabled(isVideoOff);
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = async () => {
        localVideoTrackRef.current?.close();
        localAudioTrackRef.current?.close();
        await clientRef.current?.leave();
        onCallEnd();
    };

    return (
        <div className="fixed inset-0 bg-slate-900 z-50">
            {/* Video Grid */}
            <div className="h-full flex items-center justify-center p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-6xl">
                    {/* Local Video */}
                    <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
                        <div
                            ref={localVideoRef}
                            className="w-full h-full"
                        />
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                            You {isVideoOff && '(Camera Off)'}
                        </div>
                    </div>

                    {/* Remote Video(s) */}
                    {remoteUsers.length > 0 ? (
                        remoteUsers.map((userId) => (
                            <div
                                key={userId}
                                className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video"
                            >
                                <div
                                    id={`remote-${userId}`}
                                    className="w-full h-full"
                                />
                                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                                    Remote User
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                            <div className="text-center text-slate-400">
                                <svg
                                    className="w-16 h-16 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                <p>Waiting for other participant...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                {/* Mute Button */}
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                >
                    {isMuted ? (
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                        </svg>
                    )}
                </button>

                {/* Video Toggle Button */}
                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isVideoOff
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                >
                    {isVideoOff ? (
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3l18 18"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    )}
                </button>

                {/* End Call Button */}
                <button
                    onClick={handleEndCall}
                    className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
                >
                    <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                        />
                    </svg>
                </button>
            </div>

            {/* Status Indicator */}
            {!isJoined && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm">
                    Connecting...
                </div>
            )}
        </div>
    );
}

// Video Call Types

export interface VideoCallToken {
    token: string;
    channelName: string;
    appId: string;
    uid: string;
    videoCallId: string;
}

export interface VideoCall {
    _id: string;
    appointmentId: string;
    doctorId: {
        _id: string;
        name: string;
        email: string;
    };
    patientId: {
        _id: string;
        name: string;
        email: string;
    };
    channelName: string;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    startTime: string | null;
    endTime: string | null;
    duration: number;
    recordingUrl: string | null;
    transcriptionUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface GenerateTokenRequest {
    appointmentId: string;
}

export interface StartCallRequest {
    videoCallId: string;
}

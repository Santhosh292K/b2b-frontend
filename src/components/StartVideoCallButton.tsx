'use client';

import Link from 'next/link';

interface StartVideoCallButtonProps {
    appointmentId: string;
    status: string;
    className?: string;
}

export default function StartVideoCallButton({
    appointmentId,
    status,
    className = '',
}: StartVideoCallButtonProps) {
    if (status !== 'accepted') {
        return null;
    }

    return (
        <Link
            href={`/video-call?appointmentId=${appointmentId}`}
            className={`inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors ${className}`}
        >
            <svg
                className="w-5 h-5"
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
            Start Video Call
        </Link>
    );
}

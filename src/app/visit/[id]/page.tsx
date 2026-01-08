'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { visitApi } from '@/lib/api';
import { Visit } from '@/types/clinical.types';
import Link from 'next/link';

export default function VisitDetailPage() {
    const params = useParams();
    const visitId = params.id as string;

    const [visit, setVisit] = useState<Visit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVisit = async () => {
            try {
                const response = await visitApi.getVisitById(visitId);
                if (response.data.success) {
                    setVisit(response.data.data.visit);
                }
            } catch (err) {
                console.error('Error fetching visit:', err);
                setError('Failed to load visit summary');
            } finally {
                setIsLoading(false);
            }
        };

        if (visitId) {
            fetchVisit();
        }
    }, [visitId]);

    if (isLoading) {
        return (
            <AuthGuard>
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500">Loading visit summary...</p>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    if (error || !visit) {
        return (
            <AuthGuard>
                <div className="min-h-screen bg-slate-50">
                    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                                    {error || 'Visit Not Found'}
                                </h2>
                                <p className="text-slate-500 mb-6">
                                    The visit summary you&apos;re looking for could not be loaded.
                                </p>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-3xl mx-auto">
                        {/* Back Button */}
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>

                        <DisclaimerBanner />

                        {/* Visit Summary Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl">
                                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Visit Summary
                                </h1>
                            </div>

                            {/* Visit Details */}
                            <div className="p-6 space-y-6">
                                {/* Date and Doctor Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Visit Date</p>
                                            <p className="font-semibold text-slate-800">
                                                {new Date(visit.visitDate).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">Doctor</p>
                                            <p className="font-semibold text-slate-800">Dr. {visit.doctorName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Info */}
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Patient</p>
                                        <p className="font-semibold text-slate-800">{visit.patientName}</p>
                                    </div>
                                </div>

                                {/* Summary Text */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
                                        Clinical Summary
                                    </h3>
                                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {visit.summary}
                                        </p>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-400">
                                        Record created: {new Date(visit.createdAt).toLocaleString('en-US')}
                                        {visit.updatedAt !== visit.createdAt && (
                                            <> • Last updated: {new Date(visit.updatedAt).toLocaleString('en-US')}</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

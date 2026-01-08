'use client';

import { useState, useEffect } from 'react';
import { visitApi } from '@/lib/api';
import { Visit } from '@/types/clinical.types';
import Link from 'next/link';

interface VisitListProps {
    patientId?: string;
    showPatientName?: boolean;
}

export default function VisitList({ patientId, showPatientName = false }: VisitListProps) {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const response = patientId
                    ? await visitApi.getPatientVisits(patientId)
                    : await visitApi.getVisits();

                if (response.data.success) {
                    setVisits(response.data.data.visits);
                }
            } catch (err) {
                console.error('Error fetching visits:', err);
                setError('Failed to load visits');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVisits();
    }, [patientId]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Visit History
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {visits.length} visit{visits.length !== 1 ? 's' : ''} recorded
                </p>
            </div>

            <div className="divide-y divide-slate-100">
                {visits.length === 0 ? (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-slate-500">No visits recorded yet</p>
                    </div>
                ) : (
                    visits.map((visit) => (
                        <Link
                            key={visit._id}
                            href={`/visit/${visit._id}`}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">
                                        {new Date(visit.visitDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {showPatientName ? visit.patientName : `Dr. ${visit.doctorName}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                                <span className="text-sm">View Summary</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { visitApi } from '@/lib/api';
import { Patient } from '@/types/clinical.types';
import Link from 'next/link';

interface PatientListProps {
    onPatientSelect?: (patientId: string) => void;
}

export default function PatientList({ onPatientSelect }: PatientListProps) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await visitApi.getPatients();
                if (response.data.success) {
                    setPatients(response.data.data.patients);
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                setError('Failed to load patients');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatients();
    }, []);

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    My Patients
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    {patients.length} patient{patients.length !== 1 ? 's' : ''} attended
                </p>
            </div>

            <div className="divide-y divide-slate-100">
                {patients.length === 0 ? (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <p className="text-slate-500">No patients yet</p>
                    </div>
                ) : (
                    patients.map((patient) => (
                        <Link
                            key={patient._id}
                            href={`/dashboard?patientId=${patient._id}`}
                            onClick={() => onPatientSelect?.(patient._id)}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {patient.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">{patient.name}</p>
                                    <p className="text-sm text-slate-500">{patient.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-600">
                                    {patient.totalVisits} visit{patient.totalVisits !== 1 ? 's' : ''}
                                </p>
                                {patient.lastVisit && (
                                    <p className="text-xs text-slate-400">
                                        Last: {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

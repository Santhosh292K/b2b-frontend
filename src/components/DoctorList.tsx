'use client';

import { useState, useEffect } from 'react';
import { visitApi } from '@/lib/api';

interface Doctor {
    _id: string;
    name: string;
    email: string;
    patientCount: number;
}

interface DoctorListProps {
    onDoctorSelected?: (doctorId: string) => void;
    currentDoctorId?: string | null;
}

export default function DoctorList({ onDoctorSelected, currentDoctorId }: DoctorListProps) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [assigningId, setAssigningId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await visitApi.getDoctors();
                if (response.data.success) {
                    setDoctors(response.data.data.doctors);
                }
            } catch (err) {
                console.error('Error fetching doctors:', err);
                setError('Failed to load doctors');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const handleAssignDoctor = async (doctorId: string) => {
        setAssigningId(doctorId);
        try {
            await visitApi.assignDoctor(doctorId);
            onDoctorSelected?.(doctorId);
            // Refresh the list
            window.location.reload();
        } catch (err) {
            console.error('Error assigning doctor:', err);
            setError('Failed to schedule with doctor');
        } finally {
            setAssigningId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Doctors
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Select a doctor to schedule an appointment
                </p>
            </div>

            <div className="divide-y divide-slate-100">
                {doctors.length === 0 ? (
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-500">No doctors available</p>
                    </div>
                ) : (
                    doctors.map((doctor) => (
                        <div
                            key={doctor._id}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                    {doctor.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">Dr. {doctor.name}</p>
                                    <p className="text-sm text-slate-500">{doctor.email}</p>
                                    <p className="text-xs text-slate-400">{doctor.patientCount} patient{doctor.patientCount !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div>
                                {currentDoctorId === doctor._id ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Your Doctor
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleAssignDoctor(doctor._id)}
                                        disabled={assigningId === doctor._id}
                                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {assigningId === doctor._id ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Scheduling...
                                            </span>
                                        ) : (
                                            'Schedule'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

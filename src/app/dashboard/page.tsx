'use client';

import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import PatientList from '@/components/PatientList';
import VisitList from '@/components/VisitList';
import AISearchBox from '@/components/AISearchBox';
import DoctorList from '@/components/DoctorList';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { visitApi } from '@/lib/api';
import { Visit } from '@/types/clinical.types';

// Doctor Dashboard Component
function DoctorDashboard() {
    const { user } = useAuth();
    const [visits, setVisits] = useState<Visit[]>([]);
    const [isLoadingVisits, setIsLoadingVisits] = useState(true);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const response = await visitApi.getDoctorVisits();
                if (response.data.success) {
                    setVisits(response.data.data.visits);
                }
            } catch (err) {
                console.error('Error fetching visits:', err);
            } finally {
                setIsLoadingVisits(false);
            }
        };

        fetchVisits();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                        Welcome, Dr. {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage your patient visit summaries
                    </p>
                </div>
                <Link
                    href="/create-visit"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Visit Summary
                </Link>
            </div>

            <DisclaimerBanner />

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Role</p>
                            <p className="font-semibold text-slate-800">Doctor</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Summaries</p>
                            <p className="font-semibold text-emerald-600">{visits.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Last Login</p>
                            <p className="font-semibold text-slate-800">
                                {user?.lastLogin
                                    ? new Date(user.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                    : 'Today'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Patients */}
            <PatientList />

            {/* My Visit Summaries */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        My Visit Summaries
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {visits.length} summar{visits.length !== 1 ? 'ies' : 'y'} created
                    </p>
                </div>

                {isLoadingVisits ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : visits.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-slate-500">No visit summaries yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                        {visits.map((visit) => (
                            <Link
                                key={visit._id}
                                href={`/visit/${visit._id}`}
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {visit.patientName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{visit.patientName}</p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(visit.visitDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Search */}
            <AISearchBox />
        </div>
    );
}

// Patient Dashboard Component
function PatientDashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <p className="text-slate-500 mt-1">
                    View your visit history and schedule appointments
                </p>
            </div>

            <DisclaimerBanner />

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Information
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-500 sm:w-40">Full Name</span>
                            <span className="text-slate-800 font-medium mt-1 sm:mt-0">{user?.name}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-500 sm:w-40">Email</span>
                            <span className="text-slate-800 font-medium mt-1 sm:mt-0">{user?.email}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center py-3">
                            <span className="text-sm font-medium text-slate-500 sm:w-40">Role</span>
                            <span className="inline-flex items-center gap-2 mt-1 sm:mt-0">
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                    Patient
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Doctor Selection */}
            <DoctorList />

            {/* Visit History */}
            <VisitList />
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-50">
                <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="max-w-6xl mx-auto">
                        {user?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}

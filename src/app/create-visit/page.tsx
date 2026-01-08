'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import RoleGuard from '@/components/RoleGuard';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import { visitApi } from '@/lib/api';
import { Patient } from '@/types/clinical.types';
import Link from 'next/link';

export default function CreateVisitPage() {
    const router = useRouter();

    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(true);
    const [patientError, setPatientError] = useState<string | null>(null);

    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [summary, setSummary] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Fetch patients on mount
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await visitApi.getPatients();
                if (response.data.success) {
                    setPatients(response.data.data.patients);
                }
            } catch (err) {
                console.error('Error fetching patients:', err);
                setPatientError('Failed to load patients');
            } finally {
                setIsLoadingPatients(false);
            }
        };

        fetchPatients();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!selectedPatientId || !visitDate || !summary.trim()) {
            setSubmitError('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await visitApi.createVisit({
                patientId: selectedPatientId,
                visitDate,
                summary: summary.trim(),
            });

            if (response.data.success) {
                setSubmitSuccess(true);
                // Redirect to the new visit after a short delay
                setTimeout(() => {
                    router.push(`/visit/${response.data.data.visit._id}`);
                }, 1500);
            }
        } catch (err) {
            console.error('Error creating visit:', err);
            setSubmitError('Failed to create visit summary. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get today's date in YYYY-MM-DD format for the date input
    const today = new Date().toISOString().split('T')[0];

    return (
        <AuthGuard>
            <RoleGuard allowedRoles={['doctor']}>
                <div className="min-h-screen bg-slate-50">
                    <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
                        <div className="max-w-2xl mx-auto">
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

                            {/* Form Card */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Create Visit Summary
                                    </h1>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Record a new clinical visit summary for a patient
                                    </p>
                                </div>

                                {/* Success Message */}
                                {submitSuccess && (
                                    <div className="m-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-3">
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">Visit summary created successfully!</p>
                                            <p className="text-sm">Redirecting to view the summary...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Form */}
                                {!submitSuccess && (
                                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                        {/* Patient Selector */}
                                        <div>
                                            <label htmlFor="patient" className="block text-sm font-medium text-slate-700 mb-2">
                                                Select Patient <span className="text-red-500">*</span>
                                            </label>
                                            {isLoadingPatients ? (
                                                <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200">
                                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                    <span className="text-slate-500">Loading patients...</span>
                                                </div>
                                            ) : patientError ? (
                                                <div className="py-3 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                                    {patientError}
                                                </div>
                                            ) : (
                                                <select
                                                    id="patient"
                                                    value={selectedPatientId}
                                                    onChange={(e) => setSelectedPatientId(e.target.value)}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                                >
                                                    <option value="">Choose a patient...</option>
                                                    {patients.map((patient) => (
                                                        <option key={patient._id} value={patient._id}>
                                                            {patient.name} ({patient.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {/* Visit Date */}
                                        <div>
                                            <label htmlFor="visitDate" className="block text-sm font-medium text-slate-700 mb-2">
                                                Visit Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="visitDate"
                                                type="date"
                                                value={visitDate}
                                                onChange={(e) => setVisitDate(e.target.value)}
                                                max={today}
                                                required
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                            />
                                        </div>

                                        {/* Summary Textarea */}
                                        <div>
                                            <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-2">
                                                Clinical Summary <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id="summary"
                                                value={summary}
                                                onChange={(e) => setSummary(e.target.value)}
                                                required
                                                rows={8}
                                                placeholder="Enter the clinical visit summary here. Include relevant findings, diagnoses, recommendations, and follow-up instructions..."
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                                            />
                                            <p className="text-xs text-slate-400 mt-1.5">
                                                {summary.length} characters
                                            </p>
                                        </div>

                                        {/* Error Message */}
                                        {submitError && (
                                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {submitError}
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <div className="flex gap-3 pt-2">
                                            <Link
                                                href="/dashboard"
                                                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-center hover:bg-slate-50 transition-colors"
                                            >
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || isLoadingPatients}
                                                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Creating...
                                                    </span>
                                                ) : (
                                                    'Create Visit Summary'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </RoleGuard>
        </AuthGuard>
    );
}

'use client';

import { useState } from 'react';
import { visitApi } from '@/lib/api';
import { AISearchResult } from '@/types/clinical.types';
import Link from 'next/link';

export default function AISearchBox() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AISearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsSearching(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await visitApi.searchSummaries(query);
            if (response.data.success) {
                setResults(response.data.data.results);
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search visit summaries. Please try again.');
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <svg
                        className="w-5 h-5 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                    AI Search
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Search through past visit summaries using natural language
                </p>
            </div>

            <div className="p-6">
                {/* Search Input */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg
                                className="w-5 h-5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search past visit summaries..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || !query.trim()}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSearching ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Searching
                            </span>
                        ) : (
                            'Search'
                        )}
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Search Results */}
                {hasSearched && !error && (
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-slate-500 mb-3">
                            {results.length > 0
                                ? `Found ${results.length} result${results.length > 1 ? 's' : ''}`
                                : 'No results found'}
                        </h3>

                        {results.length > 0 && (
                            <div className="space-y-3">
                                {results.map((result) => (
                                    <Link
                                        key={result.visitId}
                                        href={`/visit/${result.visitId}`}
                                        className="block p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                            <span className="inline-flex items-center gap-1">
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                {new Date(result.visitDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                            <span>•</span>
                                            <span>Dr. {result.doctorName}</span>
                                            <span>•</span>
                                            <span>{result.patientName}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 line-clamp-2">
                                            &quot;{result.snippet}&quot;
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

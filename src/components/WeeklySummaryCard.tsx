'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SourceStat } from '@/lib/ai-summary';

interface WeeklySummaryCardProps {
  initialStats?: SourceStat[];
}

export function WeeklySummaryCard({ initialStats }: WeeklySummaryCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: initialStats }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate weekly summary');
      }

      setSummary(data.summary);
      setModelUsed(data.modelUsed || 'AI Engine');
      setLastGenerated(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err: any) {
      setError(err?.message || 'An error occurred while generating summary.');
    } finally {
      setIsLoading(false);
    }
  }, [initialStats]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md">
      {/* Header Bar */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-zinc-900">Weekly Performance Summary</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium font-mono text-zinc-700 border border-zinc-200">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                Strategic Insights
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Automated multi-channel marketing attribution digest & executive insights
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {lastGenerated && (
            <span className="hidden md:inline-block text-[11px] font-mono text-zinc-500">
              Updated {lastGenerated}
            </span>
          )}
          <button
            onClick={fetchSummary}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/50 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Generating summary...</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Generate weekly summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="relative mt-4">
        {isLoading ? (
          <div className="space-y-2.5 py-1">
            <div className="h-3.5 w-full rounded bg-zinc-100 animate-pulse" />
            <div className="h-3.5 w-11/12 rounded bg-zinc-100 animate-pulse" />
            <div className="h-3.5 w-4/5 rounded bg-zinc-100 animate-pulse" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-3.5 border border-red-200 text-xs text-red-700">
            <p className="font-semibold">Unable to generate summary</p>
            <p className="mt-0.5 text-red-600">{error}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-zinc-700 font-sans tracking-normal">
              {summary}
            </p>
            {modelUsed && (
              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Model: <span className="text-zinc-800 font-medium">{modelUsed}</span>
                </span>
                <span>On-Demand Generation Active</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

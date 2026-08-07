'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-red-200 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold shadow-xs">
          ⚠️
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Something went wrong</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {error.message || 'An unexpected error occurred while loading your attribution dashboard.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 text-xs font-medium rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 transition-colors shadow-xs"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

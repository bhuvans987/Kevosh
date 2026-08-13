'use client';

import { useState } from 'react';

interface UpgradeButtonProps {
  label?: string;
  className?: string;
  containerClassName?: string;
}

export function UpgradeButton({
  label = 'Upgrade to Pro ($20/mo)',
  className = '',
  containerClassName = '',
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Handle unauthenticated user status or redirects directly
      if (res.status === 401 || res.redirected) {
        window.location.href = '/sign-in';
        return;
      }

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.warn('[Checkout Upgrade Non-JSON Response]:', res.status, text.slice(0, 100));
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Checkout service route not found (404). Please try again.');
          }
          throw new Error(`Server returned status ${res.status}. Please sign in and try again.`);
        }
      }

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to start checkout session.');
      }
    } catch (err: any) {
      console.error('[Checkout Upgrade Error]:', err);
      setError(err.message || 'An error occurred during checkout. Please try again.');
      setLoading(false);
    }
  };

  const defaultBtnClass =
    'px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer';

  return (
    <div className={`relative flex flex-col gap-1.5 ${containerClassName}`}>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className={className || defaultBtnClass}
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Redirecting to Checkout...</span>
          </>
        ) : (
          <>
            <span>{label}</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </>
        )}
      </button>
      {error && (
        <div className="p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-500">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" />
            <line x1="12" y1="16" x2="12.01" />
          </svg>
          <span className="truncate">{error}</span>
        </div>
      )}
    </div>
  );
}

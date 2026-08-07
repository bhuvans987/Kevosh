'use client';

import { useState } from 'react';

interface UpgradeButtonProps {
  label?: string;
  className?: string;
}

export function UpgradeButton({
  label = 'Upgrade to Pro ($20/mo)',
  className = '',
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start upgrade session.');
      }
    } catch (err) {
      console.error('Upgrade Error:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={
        className ||
        'px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer'
      }
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Redirecting to Dodo Checkout...</span>
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
  );
}

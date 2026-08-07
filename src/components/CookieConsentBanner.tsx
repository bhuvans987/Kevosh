'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { setCookieConsent } from '@/lib/attribution';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already decided on cookie consent
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Delay slightly for smooth entrance animation
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    setCookieConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-5 right-5 max-w-sm w-[calc(100vw-2.5rem)] z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-md text-zinc-900 border border-zinc-200/90 p-4 sm:p-5 rounded-2xl shadow-xl shadow-zinc-950/10 space-y-3.5">
        {/* Header Strip */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h4 className="text-xs font-bold text-zinc-950 tracking-tight">
              Cookie Preferences
            </h4>
          </div>
          <span className="text-[10px] font-mono font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
            GDPR Ready
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-600 leading-relaxed font-sans">
          We use lightweight first-party cookies to measure acquisition channels. We never sell your personal data. Read our{' '}
          <Link href="/privacy" className="text-zinc-950 font-semibold underline hover:text-zinc-700">
            Privacy Policy
          </Link>.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-0.5">
          <button
            onClick={handleDecline}
            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}

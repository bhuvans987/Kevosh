'use client';

import React, { useState } from 'react';

export function InteractiveProductShowcase() {
  const [activeTab, setActiveTab] = useState<'feed' | 'roi' | 'ai'>('feed');

  return (
    <div className="w-full max-w-4xl mx-auto attio-card rounded-2xl p-4 sm:p-6 shadow-md border border-zinc-200/90 text-left space-y-4">
      {/* Top Window Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
          <span className="text-xs font-mono text-zinc-400 ml-2">app.attributely.io/live-analytics</span>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 text-xs font-medium">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>Live Revenue Feed</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('roi')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'roi'
                ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span>Channel ROI</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>AI Digest</span>
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="pt-2">
        {activeTab === 'feed' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400 text-[11px] pb-1 border-b border-zinc-100 font-sans">
              <span>REVENUE EVENT</span>
              <span>MARKETING SOURCE</span>
              <span>GATEWAY & AMOUNT</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-white hover:shadow-xs transition-all">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-sans font-semibold text-zinc-900">alex@saaslaunch.com</p>
                  <p className="text-[10px] text-zinc-500">Converted 2 mins ago</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 text-[11px] font-medium font-sans">
                Twitter / X (utm_campaign=launch)
              </span>
              <span className="font-bold text-emerald-600 font-mono">$49.00 / mo (Stripe)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-white hover:shadow-xs transition-all">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-sans font-semibold text-zinc-900">dev@indiehackers.io</p>
                  <p className="text-[10px] text-zinc-500">Converted 14 mins ago</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium font-sans">
                Product Hunt (ref=ph_top10)
              </span>
              <span className="font-bold text-emerald-600 font-mono">$199.00 / yr (Dodo)</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 hover:bg-white hover:shadow-xs transition-all">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-sans font-semibold text-zinc-900">sarah@growthmail.co</p>
                  <p className="text-[10px] text-zinc-500">Converted 45 mins ago</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200 text-[11px] font-medium font-sans">
                YouTube Review Video
              </span>
              <span className="font-bold text-emerald-600 font-mono">$29.00 / mo (Stripe)</span>
            </div>
          </div>
        )}

        {activeTab === 'roi' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <p className="text-[11px] text-zinc-500 font-sans">Twitter / X</p>
                <p className="text-lg font-bold text-zinc-900">14.2% Conv.</p>
                <p className="text-[10px] text-zinc-400">$1,420 MRR</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <p className="text-[11px] text-zinc-500 font-sans">Product Hunt</p>
                <p className="text-lg font-bold text-emerald-600">18.5% Conv.</p>
                <p className="text-[10px] text-zinc-400">$2,180 MRR</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                <p className="text-[11px] text-zinc-500 font-sans">Direct / Referral</p>
                <p className="text-lg font-bold text-zinc-900">6.1% Conv.</p>
                <p className="text-[10px] text-zinc-400">$850 MRR</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 text-center font-sans flex items-center justify-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Product Hunt delivers 3x higher lifetime customer value compared to untracked organic traffic.</span>
            </p>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-2 font-sans">
            <div className="flex items-center gap-2 font-bold text-zinc-900">
              <span className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
              <span>Weekly AI Executive Digest Preview</span>
            </div>
            <p className="leading-relaxed">
              &quot;Your highest-performing acquisition channel this week was <strong>Product Hunt</strong> (18.5% conversion rate to paid Stripe plans). Twitter/X traffic showed strong volume but lower checkout completion. Recommendation: Double down on PH community engagement and add a 10% annual discount code for X followers.&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

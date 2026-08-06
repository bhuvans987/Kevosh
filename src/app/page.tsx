import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton, SignInButton } from '@clerk/nextjs';

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between relative overflow-hidden">
      {/* Background radial glow & subtle grid overlay */}
      <div className="absolute inset-0 bg-attio-grid opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-attio-radial pointer-events-none" />

      {/* Top Banner */}
      <div className="relative z-50 border-b border-white/10 bg-[#0d0e12] px-4 py-2 text-center text-xs font-medium text-zinc-400 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span>Orchestrate multi-channel revenue attribution with Attributely</span>
        <span className="text-zinc-600">|</span>
        <Link href={userId ? "/dashboard" : "/sign-up"} className="text-white hover:underline flex items-center gap-1">
          Explore Dashboard →
        </Link>
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Attio-style Geometric Logo Icon */}
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/15 flex items-center justify-center shadow-inner group-hover:border-white/30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight text-white font-sans">
              Attributely
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
            <a href="#analytics" className="hover:text-white transition-colors">Analytics</a>
            <a href="#docs" className="hover:text-white transition-colors">Docs</a>
          </nav>
        </div>

        <nav className="flex items-center gap-3">
          {!userId ? (
            <>
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="px-4 py-1.5 text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg shadow-sm transition-all"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-1.5 text-sm font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg transition-colors border border-white/10"
              >
                Dashboard
              </Link>
              <UserButton />
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-20 text-center max-w-5xl mx-auto">
        {/* Attio Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-white/10 text-xs text-zinc-300 font-medium mb-8 backdrop-blur-sm shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Attio-Grade Multi-Provider Attribution Engine</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-400 font-mono text-[11px]">v2.4 Live</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6 max-w-3xl">
          The system for revenue teams to attribute every conversion
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed font-normal">
          Unify Stripe & Dodo Payments marketing attribution into one intelligent dashboard.
          Attribute MRR to acquisition channels with zero client-side footprint.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-16">
          {!userId ? (
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 font-medium rounded-lg shadow-sm transition-all text-sm flex items-center justify-center gap-2"
            >
              Start Free Integration
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-950">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 font-medium rounded-lg shadow-sm transition-all text-sm flex items-center justify-center gap-2"
            >
              Open Founder Dashboard
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-950">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}

          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 font-medium rounded-lg border border-white/10 transition-all text-sm flex items-center justify-center"
          >
            Explore Platform Features
          </a>
        </div>

        {/* Dashboard Interface Preview Box (Attio Style Mockup) */}
        <div className="w-full rounded-2xl border border-white/10 bg-[#121318] p-4 sm:p-6 shadow-2xl text-left relative overflow-hidden backdrop-blur-md">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
              <span className="text-xs font-mono text-zinc-500 ml-2">app.attributely.com/dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                ● Live Data Stream
              </span>
            </div>
          </div>

          {/* Metric Bar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5">
              <p className="text-xs text-zinc-400 mb-1">Total Tracked Signups</p>
              <p className="text-2xl font-bold text-white font-mono">1,482</p>
              <p className="text-[11px] text-emerald-400 mt-1 font-mono">+18.4% this week</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5">
              <p className="text-xs text-zinc-400 mb-1">Converted Paying Customers</p>
              <p className="text-2xl font-bold text-white font-mono">349</p>
              <p className="text-[11px] text-indigo-400 mt-1 font-mono">23.5% Conversion Rate</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5">
              <p className="text-xs text-zinc-400 mb-1">Active Gateways</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">Stripe</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">Dodo</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-2 font-mono">Webhook Sync Active</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          <div className="attio-card p-5 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm mb-4">
              S
            </div>
            <h3 className="font-semibold text-zinc-200 text-sm mb-1.5">Stripe Webhooks</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Read-only Stripe charge & invoice listener parsing webhook events directly into unified payments storage.
            </p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
              D
            </div>
            <h3 className="font-semibold text-zinc-200 text-sm mb-1.5">Dodo Payments</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Native signature validation and payment event ingestion tailored for Dodo Payments API architecture.
            </p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">
              A
            </div>
            <h3 className="font-semibold text-zinc-200 text-sm mb-1.5">Multi-Touch Attribution</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Automatically track visitor acquisition sources across UTM parameters, referrers, and campaign origins.
            </p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm mb-4">
              ⚡
            </div>
            <h3 className="font-semibold text-zinc-200 text-sm mb-1.5">Zero Client Footprint</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Lightweight attribution tracking with zero heavy scripts. Works seamlessly across Next.js and Supabase.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">Attributely</span>
            <span>© {new Date().getFullYear()} Attributely Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton, SignInButton } from '@clerk/nextjs';
import { UpgradeButton } from '@/components/UpgradeButton';
import { InteractiveProductShowcase } from '@/components/InteractiveProductShowcase';
import { FaqAccordion } from '@/components/FaqAccordion';

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background radial glow & grid overlay */}
      <div className="absolute inset-0 bg-attio-grid opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-attio-radial pointer-events-none" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xs group-hover:bg-zinc-800 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-900 font-sans">
              Attributely
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-3">
          <a href="#how-it-works" className="text-xs text-zinc-600 hover:text-zinc-900 font-medium transition-colors hidden sm:block mr-2">
            How it works
          </a>
          <a href="#pricing" className="text-xs text-zinc-600 hover:text-zinc-900 font-medium transition-colors hidden sm:block mr-2">
            Pricing
          </a>
          <a href="#faq" className="text-xs text-zinc-600 hover:text-zinc-900 font-medium transition-colors hidden sm:block mr-2">
            FAQ
          </a>
          {!userId ? (
            <>
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href="/sign-up"
                className="px-4 py-1.5 text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg shadow-xs transition-all"
              >
                Get Started Free →
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors shadow-xs"
              >
                Open Dashboard →
              </Link>
              <UserButton />
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-10 sm:pt-14 pb-16 text-center max-w-5xl mx-auto space-y-12 sm:space-y-16">
        {/* Core Pitch Pill & Heading */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {/* Attio Floating Pill Badge with Top Hairline Gradient */}
          <a
            href="#how-it-works"
            className="attio-pill inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-medium text-zinc-800 transition-all group cursor-pointer"
          >
            <span>Revenue Attribution for Modern SaaS Founders</span>
            <span className="text-zinc-400 group-hover:translate-x-1 transition-transform font-mono">→</span>
          </a>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-950 leading-[1.15] max-w-3xl mx-auto">
            Know which marketing efforts turn into paying customers, not just traffic.
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
            A dead-simple attribution engine that unifies Stripe & Dodo Payments webhook data to pinpoint the exact marketing channel driving your monthly recurring revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {!userId ? (
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold rounded-xl shadow-xs transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Start Free Account
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold rounded-xl shadow-xs transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                Go to Dashboard
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
            <a
              href="#pricing"
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-zinc-800 hover:bg-zinc-50 font-medium rounded-xl border border-zinc-200 shadow-xs transition-all text-xs sm:text-sm flex items-center justify-center cursor-pointer"
            >
              View Pricing Tiers
            </a>
          </div>
        </div>

        {/* Interactive Product Showcase Preview */}
        <div className="w-full pt-2">
          <InteractiveProductShowcase />
        </div>

        {/* Founder Social Proof Bar */}
        <div className="w-full py-5 border-y border-zinc-200/80 bg-white/60 backdrop-blur-xs rounded-2xl flex flex-wrap items-center justify-around gap-6 text-center text-xs font-mono text-zinc-600">
          <div>
            <span className="block text-lg font-bold text-zinc-950 font-sans">$2.4M+</span>
            <span>MRR Tracked</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-zinc-200" />
          <div>
            <span className="block text-lg font-bold text-zinc-950 font-sans">100%</span>
            <span>Server-Side Webhook Accuracy</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-zinc-200" />
          <div>
            <span className="block text-lg font-bold text-emerald-600 font-sans">2 Mins</span>
            <span>Zero-Code Setup</span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left">
          <div className="attio-card p-6 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mb-3 shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800">
                <rect x="2" y="5" width="20" height="14" rx="3" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3 className="font-bold text-zinc-900 text-base">Stripe & Dodo Integration</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Read-only webhook listeners ingest payment events automatically from Stripe and Dodo Payments without heavy client scripts.
            </p>
          </div>

          <div className="attio-card p-6 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mb-3 shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
            </div>
            <h3 className="font-bold text-zinc-900 text-base">Direct Conversion Matching</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Match referrer headers, UTM campaigns, and how-heard surveys directly to converted customer payment emails.
            </p>
          </div>

          <div className="attio-card p-6 rounded-2xl space-y-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mb-3 shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <h3 className="font-bold text-zinc-900 text-base">AI Weekly Summaries</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Automated weekly insights highlight your highest ROI acquisition channels and actionable conversion recommendations.
            </p>
          </div>
        </div>

        {/* 3-Step How It Works Section */}
        <div id="how-it-works" className="w-full space-y-6 pt-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold font-mono border border-zinc-200">
              3-Step Workflow
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              How Attributely connects revenue to traffic
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              No complex tag managers or cookie banners required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <div className="attio-card p-6 rounded-2xl space-y-3 relative">
              <span className="text-3xl font-extrabold text-zinc-950 font-mono">01</span>
              <h3 className="font-bold text-zinc-900 text-base">Capture Signups</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                When a visitor registers, our 1KB tracker records referrer headers and UTM campaign sources alongside user ID.
              </p>
            </div>

            <div className="attio-card p-6 rounded-2xl space-y-3 relative">
              <span className="text-3xl font-extrabold text-zinc-950 font-mono">02</span>
              <h3 className="font-bold text-zinc-900 text-base">Listen for Payments</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Webhooks automatically transmit payment confirmation events from Stripe & Dodo Payments whenever a user upgrades.
              </p>
            </div>

            <div className="attio-card p-6 rounded-2xl space-y-3 relative">
              <span className="text-3xl font-extrabold text-zinc-950 font-mono">03</span>
              <h3 className="font-bold text-zinc-900 text-base">Unify Revenue ROI</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                View real conversion rates, calculated MRR per source channel, and automated weekly AI strategic digests.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="w-full space-y-6 pt-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              Start free today and upgrade as your revenue operations scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            {/* Free Tier Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md transition-all relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-900">Free Tier</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/80 text-xs font-mono">Starter</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-950 font-mono">$0</span>
                  <span className="text-xs text-zinc-500">/ forever</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Perfect for testing attribution tracking on a single payment gateway.
                </p>

                <ul className="space-y-2.5 text-xs text-zinc-700 pt-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>1 Connected Payment Source (Stripe OR Dodo)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>30-Day Analytics History</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Real-time Signup Ingestion</span>
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400">
                    <span className="text-zinc-400">✕</span>
                    <span className="line-through">AI Weekly Attribution Summary</span>
                  </li>
                </ul>
              </div>

              {!userId ? (
                <Link
                  href="/sign-up"
                  className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200/80 font-semibold rounded-xl text-xs text-center transition-all block"
                >
                  Get Started Free
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200/80 font-semibold rounded-xl text-xs text-center transition-all block"
                >
                  Current Free Tier
                </Link>
              )}
            </div>

            {/* Pro Plan Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-zinc-900 flex flex-col justify-between space-y-6 shadow-md hover:shadow-lg transition-all relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Recommended
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-950">Pro Founder</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-mono">Full Access</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-zinc-950 font-mono">$20</span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Complete attribution stack with multi-gateway tracking & AI summaries.
                </p>

                <ul className="space-y-2.5 text-xs text-zinc-700 pt-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Unlimited Sources</strong> (Stripe + Dodo simultaneously)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>Full All-Time History</strong> (No 30-day cap)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span><strong>AI Weekly Summaries</strong> & ROI Insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>Export CSV Reports & Priority Support</span>
                  </li>
                </ul>
              </div>

              {userId ? (
                <UpgradeButton label="Upgrade to Pro ($20/mo)" className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center cursor-pointer" />
              ) : (
                <Link
                  href="/sign-up"
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs text-center transition-all shadow-xs block"
                >
                  Sign Up & Upgrade →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div id="faq" className="w-full space-y-6 pt-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
              Everything you need to know about setting up Attributely.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-200/80 bg-white py-8 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900">Attributely</span>
            <span>© {new Date().getFullYear()} Attributely Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-600">
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <a href="#how-it-works" className="hover:text-zinc-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-zinc-900 transition-colors">FAQ</a>
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}



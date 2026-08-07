import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Attributely',
  description: 'Attributely Terms of Service, Acceptable Use Policy, Founder Consent Warranties, and Limitation of Liability.',
};

export default function TermsPage() {
  const lastUpdated = 'August 8, 2026';
  const contactEmail = 'bhuvanbizz987@gmail.com';

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xs group-hover:bg-zinc-800 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900">Attributely</span>
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-xs font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-md">
            Terms of Service
          </span>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1"
        >
          ← Back to Home
        </Link>
      </header>

      {/* Main Document Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="border-b border-zinc-200 pb-6 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-semibold">
              Terms & Conditions
            </span>
            <span className="text-xs text-zinc-500 font-mono">Last Updated: {lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-600 max-w-2xl leading-relaxed">
            These Terms of Service govern your access to and use of Attributely’s revenue attribution platform, APIs, tracking scripts, and dashboard services.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm text-zinc-700 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">1. Acceptance of Terms</h2>
            <p>
              By creating an account, connecting Stripe or Dodo Payments webhooks, or embedding Attributely tracking scripts into your application, you ("Founder" or "Customer") agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company, you represent that you have legal authority to bind that entity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">2. Scope of Service & Subscription Plans</h2>
            <p>
              Attributely provides a multi-channel revenue attribution engine that ingests payment provider webhooks (Stripe and Dodo Payments) and matches them against top-of-funnel marketing sources.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600">
              <li><strong>Free Plan:</strong> Includes 1 active payment provider integration (Stripe) and a rolling 30-day data retention window.</li>
              <li><strong>Pro Plan ($20/mo):</strong> Unlocks multi-provider listeners (Stripe & Dodo Payments), unlimited attribution history window, and AI-generated weekly conversion summaries.</li>
            </ul>
          </section>

          {/* Section 3 Acceptable Use */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">3. Acceptable Use Policy</h2>
            <p>You agree NOT to use Attributely to:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600">
              <li>Transmit fraudulent, illegal, malicious, or deceptive tracking events.</li>
              <li>Attempt to reverse-engineer, decompile, or breach security controls of the service.</li>
              <li>Sublicense, resell, or share API keys with unauthorized third parties.</li>
              <li>Bypass subscription plan features or attempt unauthorized access to other founders' isolated tenant data.</li>
            </ul>
          </section>

          {/* Section 4 Founder Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">4. Founder Responsibility for End-Customer Consent & Compliance</h2>
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-950">
              <p className="font-bold text-xs uppercase font-mono tracking-wider text-amber-900">
                Mandatory Legal Warranty
              </p>
              <p className="leading-relaxed">
                Founders act as the <strong>Data Controller</strong> for all end-customer personal data (including emails, referral URLs, and UTM parameters) transmitted to Attributely.
              </p>
              <p className="leading-relaxed">
                The Founder explicitly warrants that they have obtained all legally required user consents, posted compliant privacy notices on their website/app, and maintained a valid legal basis under GDPR, CCPA, and applicable local privacy laws before capturing or transmitting end-customer data to Attributely.
              </p>
            </div>
          </section>

          {/* Section 5 Billing */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">5. Billing, Payment & Refunds</h2>
            <p className="text-xs text-zinc-600">
              Subscription billing for Attributely Pro ($20/month) is billed in advance on a recurring monthly basis via Dodo Payments. You may cancel your subscription at any time through your dashboard settings. Upon cancellation, your subscription remains active until the end of the current paid billing period.
            </p>
          </section>

          {/* Section 6 Account Termination & Self-Service Data Deletion */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">6. Account Termination & Self-Service Data Deletion</h2>
            <p className="text-xs text-zinc-600">
              Founders may terminate their account at any time by clicking "Delete Account & Data" in dashboard settings. Triggering account deletion immediately and permanently purges all founder credentials, payments records, end-customer signups, and attribution metrics from our database via automated SQL cascade operations.
            </p>
            <p className="text-xs text-zinc-600">
              Attributely reserves the right to suspend or terminate accounts that violate our Acceptable Use Policy or engage in fraudulent activity.
            </p>
          </section>

          {/* Section 7 Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">7. Disclaimer of Warranties & Limitation of Liability</h2>
            <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-2 text-xs text-zinc-600">
              <p>
                <strong>AS-IS Basis:</strong> Attributely is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied.
              </p>
              <p>
                <strong>Liability Cap:</strong> To the maximum extent permitted by applicable law, Attributely and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or revenues. In no event shall our total aggregate liability exceed the amount paid by the Founder to Attributely in the twelve (12) months preceding the claim.
              </p>
            </div>
          </section>

          {/* Section 8 Contact */}
          <section className="space-y-3 pt-4 border-t border-zinc-200">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">8. Governing Law & Contact Information</h2>
            <p className="text-xs text-zinc-600">
              If you have questions regarding these Terms of Service, please contact our legal team:
            </p>
            <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-xl font-mono text-xs text-zinc-800 space-y-1">
              <p className="font-bold text-zinc-950">Attributely Legal Team</p>
              <p>Email: <a href={`mailto:${contactEmail}`} className="text-emerald-700 underline font-semibold">{contactEmail}</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 px-4 text-center text-xs text-zinc-500 font-mono">
        <p>© {new Date().getFullYear()} Attributely. All rights reserved. | <Link href="/privacy" className="underline hover:text-zinc-800">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}

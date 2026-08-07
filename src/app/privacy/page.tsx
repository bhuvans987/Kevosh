import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Attributely',
  description: 'Attributely Data Privacy Policy, GDPR compliance, CCPA disclosures, and Data Processing Agreement (DPA) summary.',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </span>
        </div>

        <Link
          href="/"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1"
        >
          ← Back to Home
        </Link>
      </header>

      {/* Main Legal Document Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Document Header */}
        <div className="border-b border-zinc-200 pb-6 space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-mono font-semibold">
              Legal & Compliance
            </span>
            <span className="text-xs text-zinc-500 font-mono">Last Updated: {lastUpdated}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-600 max-w-2xl leading-relaxed">
            Transparent data handling, minimization practices, GDPR & CCPA disclosures, and Data Processing Agreement (DPA) provisions for Attributely users.
          </p>
        </div>

        {/* Executive Summary Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-900" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Summary at a Glance</h3>
          </div>
          <ul className="space-y-3 text-xs text-zinc-600 font-sans">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
              <span className="leading-relaxed">We <strong>never sell, rent, or trade</strong> personal data to advertisers or third parties under any circumstances.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
              <span className="leading-relaxed">We collect attribution data solely to match top-of-funnel signups with server-verified payment webhooks.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
              <span className="leading-relaxed">Raw webhook diagnostic payloads (<code className="font-mono bg-zinc-100 px-1 py-0.5 rounded border border-zinc-200 text-zinc-800">raw_event</code>) are automatically purged after 30 days.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-1.5 shrink-0" />
              <span className="leading-relaxed">Founders can trigger 1-click self-service account and data deletion at any time in dashboard settings.</span>
            </li>
          </ul>
        </div>

        {/* Legal Sections */}
        <div className="space-y-8 text-sm text-zinc-700 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">1. Information We Collect</h2>
            <p>
              Attributely provides a multi-channel revenue attribution engine for software founders ("Founders"). We process data from two distinct categories of individuals:
            </p>

            <div className="space-y-3 pl-1">
              <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-1.5">
                <h3 className="font-semibold text-zinc-900 text-sm">A. Founder Account Data (Direct Customers)</h3>
                <p className="text-xs text-zinc-600">
                  When a Founder registers for an account, we collect account details (email address and Clerk authentication credentials) and subscription billing information managed via Dodo Payments.
                </p>
              </div>

              <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-1.5">
                <h3 className="font-semibold text-zinc-900 text-sm">B. End-Customer Data (Processed on Behalf of Founders)</h3>
                <p className="text-xs text-zinc-600">
                  When a Founder integrates our tracking API or connects payment provider webhooks (Stripe or Dodo Payments), Attributely ingests end-customer data on the Founder's behalf:
                </p>
                <ul className="list-disc pl-5 text-xs text-zinc-600 space-y-1">
                  <li><strong>Signup Identifiers:</strong> End-customer email addresses, referral domains, UTM parameters (source, medium, campaign), and self-reported survey answers.</li>
                  <li><strong>Payment Confirmation Webhooks:</strong> Transaction status, amount, currency, timestamp, customer email, and provider payment ID.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">2. How We Use Information</h2>
            <p>
              We process data strictly for providing and optimizing our core attribution matching service:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600">
              <li>Matching top-of-funnel signup sources with server-verified Stripe and Dodo Payments events.</li>
              <li>Displaying aggregated conversion metrics and AI-generated performance digests on the Founder dashboard.</li>
              <li>Processing subscription billing for the Founder's Attributely Pro plan.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">3. Data Controller vs. Data Processor Roles</h2>
            <div className="p-4 bg-zinc-900 text-white rounded-xl space-y-2">
              <p className="text-xs font-mono text-zinc-400 font-bold uppercase">Role Allocation Under Global Privacy Laws</p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong>Founder as Data Controller:</strong> The Founder remains the Data Controller for all end-customer data transmitted to Attributely. The Founder is responsible for securing any legally required consents or privacy disclosures from their website visitors and customers.
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                <strong>Attributely as Data Processor:</strong> Attributely acts strictly as a Data Processor, processing end-customer data solely pursuant to the Founder's instructions and contract.
              </p>
            </div>
          </section>

          {/* Section 4 GDPR */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">4. General Data Protection Regulation (GDPR) — EU/UK Disclosures</h2>
            <p>
              If you reside in the European Economic Area (EEA), United Kingdom, or Switzerland, the following provisions apply under the GDPR:
            </p>
            <div className="space-y-2 text-xs text-zinc-600">
              <p><strong>Legal Bases for Processing (Article 6 GDPR):</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Performance of a Contract:</strong> Processing Founder account information to fulfill our Terms of Service.</li>
                <li><strong>Legitimate Interests:</strong> Maintenance of server security, anti-fraud verification, and performance monitoring.</li>
                <li><strong>Consent:</strong> Storing non-essential tracking cookies (`attr_src`) on our landing page only after visitor acceptance.</li>
              </ul>
              <p className="pt-2"><strong>EU / UK Data Subject Rights:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request immediate deletion of your account and associated data.</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate personal data.</li>
                <li><strong>Right to Data Portability:</strong> Request export of your stored attribution data in structured JSON format.</li>
                <li><strong>Right to Lodge a Complaint:</strong> Right to contact your local Data Protection Authority (DPA).</li>
              </ul>
            </div>
          </section>

          {/* Section 5 CCPA */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">5. California Consumer Privacy Act (CCPA / CPRA) Disclosures</h2>
            <p>
              Under the California Consumer Privacy Act as amended by the CPRA, California residents possess specific privacy rights:
            </p>
            <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-2 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-900">Notice of No Sale or Sharing:</p>
              <p>
                <strong>Attributely does NOT sell, rent, or share personal information</strong> with third parties for monetary or cross-context behavioral advertising purposes.
              </p>
              <p className="font-semibold text-zinc-900 pt-1">California Resident Rights:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Right to Know what personal information is collected, disclosed, or retained.</li>
                <li>Right to Delete personal information collected directly from you.</li>
                <li>Right to Correct inaccurate personal information.</li>
                <li>Right to Non-Discrimination for exercising your CCPA privacy rights.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 DPA */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">6. Data Processing Agreement (DPA) Summary</h2>
            <p>
              Because Founders act as Data Controllers for their end-customers' personal data, European and international privacy regulations often require a formal Data Processing Agreement (DPA) incorporating EU Standard Contractual Clauses (SCCs).
            </p>
            <p className="text-xs text-zinc-600">
              This Privacy Policy incorporates our standard DPA terms by reference. If your compliance team requires a signed, standalone DPA with customized vendor disclosures, please contact us at <a href={`mailto:${contactEmail}`} className="text-zinc-950 font-semibold underline hover:text-zinc-700">{contactEmail}</a> and we will provide our standard DPA packet.
            </p>
          </section>

          {/* Section 7 Retention & Security */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">7. Technical Minimization & Data Retention</h2>
            <p>
              We enforce strict technical data minimization policies:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600">
              <li><strong>Payload Minimization:</strong> Raw webhook diagnostic payloads (`raw_event`) are trimmed before database storage to exclude card details, billing addresses, IP addresses, and phone numbers.</li>
              <li><strong>30-Day Auto-Purge:</strong> Any stored `raw_event` JSONB blobs are automatically cleared after 30 days while retaining structured numerical financial metrics (`amount`, `currency`, `status`).</li>
              <li><strong>Tenant Isolation:</strong> Database tables enforce Row-Level Security (RLS) policies scoped strictly per founder.</li>
            </ul>
          </section>

          {/* Section 8 Contact */}
          <section className="space-y-3 pt-4 border-t border-zinc-200">
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">8. Contact Information & Data Requests</h2>
            <p className="text-xs text-zinc-600">
              To submit a data access request, exercise GDPR/CCPA rights, or request account deletion, please email our privacy officer:
            </p>
            <div className="p-4 bg-zinc-100 border border-zinc-200 rounded-xl font-mono text-xs text-zinc-800 space-y-1">
              <p className="font-bold text-zinc-950">Attributely Data Privacy Team</p>
              <p>Email: <a href={`mailto:${contactEmail}`} className="text-zinc-950 underline font-semibold hover:text-zinc-700">{contactEmail}</a></p>
              <p className="text-zinc-500">Response SLA: Within 48 business hours</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 px-4 text-center text-xs text-zinc-500 font-mono">
        <p>© {new Date().getFullYear()} Attributely. All rights reserved. | <Link href="/terms" className="underline hover:text-zinc-800">Terms of Service</Link></p>
      </footer>
    </div>
  );
}

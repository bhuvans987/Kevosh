import Link from 'next/link';

export const metadata = {
  title: 'Setup & Integration Guide - Kevosh',
  description: 'Learn how to integrate Kevosh attribution tracking, connect Stripe and Dodo Payments, and attribute marketing revenue.',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] font-sans flex flex-col">
      {/* Top Nav */}
      <header className="border-b border-zinc-200/80 bg-white px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xs">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900">
              Kevosh
            </span>
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-md">
            Documentation & Integration Guide
          </span>
        </div>

        <Link
          href="/dashboard"
          className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
        >
          ← Back to Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* Title Banner */}
        <div className="space-y-2 border-b border-zinc-200 pb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Complete Step-by-Step Developer Guide
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            How to Integrate Kevosh Attribution Tracking
          </h1>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
            Clear, non-vague code examples showing where to paste the script, where to trigger tracking, and how marketing channels (X/Twitter, Google, Reddit) convert into Stripe & Dodo revenue.
          </p>
        </div>

        {/* High Level Flow Visualizer */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            High-Level Attribution Flow (How it Works)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-emerald-600 font-bold text-sm block">01. Traffic</span>
              <p className="text-zinc-700 font-sans text-xs">User clicks your X/Twitter link with <code className="text-zinc-900 font-bold">?utm_source=twitter</code>.</p>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-emerald-600 font-bold text-sm block">02. Script Tag</span>
              <p className="text-zinc-700 font-sans text-xs"><code className="text-zinc-900 font-bold">&lt;head&gt;</code> script auto-captures source <code className="text-emerald-600">twitter</code> into session.</p>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-emerald-600 font-bold text-sm block">03. User Signup</span>
              <p className="text-zinc-700 font-sans text-xs">Your form calls <code className="text-zinc-900 font-bold">window.kevosh.track(email)</code> when they register.</p>
            </div>

            <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
              <span className="text-emerald-600 font-bold text-sm block">04. Revenue Match</span>
              <p className="text-zinc-700 font-sans text-xs">Stripe/Dodo webhook matches payment email to <code className="text-emerald-600">X / Twitter</code> channel.</p>
            </div>
          </div>
        </div>

        {/* STEP 1: SCRIPT TAG PLACEMENT */}
        <section className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Step 1: Paste Script Tag in your HTML &lt;head&gt;</h2>
              <p className="text-xs text-zinc-500">Auto-detects UTM parameters, X/Twitter, Google Organic, and Referrers</p>
            </div>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Copy the 1-line script tag below and paste it inside the <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900 font-mono font-semibold">&lt;head&gt;</code> section of your web application:
          </p>

          {/* Standalone 1-Line Script Tag */}
          <div className="p-4 bg-zinc-950 text-white rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-zinc-800">
            <div className="text-zinc-400 text-[11px] flex items-center justify-between border-b border-zinc-800 pb-2">
              <span>1-Line HTML Script Embed Tag:</span>
              <span className="text-emerald-400 font-sans font-semibold">✓ Copy & Paste This Line</span>
            </div>
            <code className="text-emerald-400 block font-bold whitespace-pre">
{`<script src="https://your-domain.com/kevosh.js" data-key="YOUR_PUBLIC_API_KEY" defer></script>`}
            </code>
          </div>

          {/* Concrete Code Example of HTML file after pasting */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Example File Placement (How your code looks after pasting)</h3>
            <p className="text-xs text-zinc-500">
              Here is an example of an <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800 font-mono text-[11px]">index.html</code> or <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800 font-mono text-[11px]">app/layout.tsx</code> file after inserting the script:
            </p>
            <div className="p-4 bg-zinc-900 text-zinc-200 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-zinc-800">
              <div className="text-zinc-400 text-[11px] border-b border-zinc-800 pb-2">
                <span>Example File: public/index.html</span>
              </div>
              <code className="text-zinc-300 block whitespace-pre">
{`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My SaaS Product</title>

    <!-- ⚡ KEVOSH ATTRIBUTION SCRIPT (Pasted here) -->
    <script src="https://your-domain.com/kevosh.js" data-key="YOUR_PUBLIC_API_KEY" defer></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`}
              </code>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs space-y-1">
            <p className="font-bold">What happens automatically when you paste this?</p>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              When a visitor opens your website with a marketing URL like <code className="bg-blue-100 px-1 rounded font-mono">https://your-app.com?utm_source=twitter&utm_campaign=launch</code>, Kevosh auto-detects <code className="font-bold font-mono">twitter</code> and stores it silently in the visitor&apos;s browser session.
            </p>
          </div>
        </section>

        {/* STEP 2: WHERE TO EXECUTE TRACK() */}
        <section className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Step 2: Trigger Tracking on User Sign-Up</h2>
              <p className="text-xs text-zinc-500">One-time setup inside your Sign-Up form submit handler function</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">One-Time Developer Setup (Runs 100% Automatically)</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Add the single tracking line below <span className="font-bold text-zinc-950">ONCE</span> inside your Sign-Up form handler function. Once added, Kevosh will <span className="font-bold text-emerald-600">automatically run in the background for every single new user who registers</span> without any manual work!
            </p>
          </div>

          {/* Standalone 1-Line Tracking Call */}
          <div className="p-4 bg-zinc-950 text-white rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-zinc-800">
            <div className="text-zinc-400 text-[11px] flex items-center justify-between border-b border-zinc-800 pb-2">
              <span>1-Line JS Tracking Call:</span>
              <span className="text-emerald-400 font-sans font-semibold">✓ Add this inside your form handler</span>
            </div>
            <code className="text-emerald-400 block font-bold whitespace-pre">
{`window.kevosh?.track(newCustomer.email);`}
            </code>
          </div>

          {/* Concrete Form Handler Example */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Example Code Placement inside your Sign-Up Form Function</h3>
            <div className="p-4 bg-zinc-900 text-zinc-200 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-zinc-800">
              <div className="text-zinc-400 text-[11px] border-b border-zinc-800 pb-2">
                <span>Example Code: src/components/SignUpForm.jsx</span>
              </div>
              <code className="text-zinc-300 block whitespace-pre">
{`// Inside your React/Next.js/JS Sign-Up Component:
async function handleSignUpSubmit(event) {
  event.preventDefault();
  
  // 1. Create user in your authentication system (Supabase / Firebase / Clerk / Auth0)
  const newCustomer = await myAuth.signUp({
    email: userEmailInput,
    password: passwordInput
  });

  // 2. ⚡ KEVOSH TRACKING LINE (Add here after successful signup):
  if (newCustomer && window.kevosh) {
    window.kevosh.track(newCustomer.email);
  }
}`}
              </code>
            </div>
          </div>

          {/* Auto-Normalized Sources List */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3 text-xs">
            <h4 className="font-bold text-zinc-900 text-xs">Supported Traffic Sources & Auto-Normalization Rules:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="bg-white p-2.5 rounded-lg border border-zinc-200 space-y-0.5">
                <span className="font-bold text-zinc-900 block">X / Twitter:</span>
                <span className="text-zinc-500"><code className="text-emerald-600 font-bold">utm_source=twitter</code> or <code className="text-emerald-600 font-bold">x</code></span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-zinc-200 space-y-0.5">
                <span className="font-bold text-zinc-900 block">Reddit:</span>
                <span className="text-zinc-500"><code className="text-emerald-600 font-bold">utm_source=reddit</code> or referrer URL</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-zinc-200 space-y-0.5">
                <span className="font-bold text-zinc-900 block">Product Hunt:</span>
                <span className="text-zinc-500"><code className="text-emerald-600 font-bold">utm_source=producthunt</code></span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-zinc-200 space-y-0.5">
                <span className="font-bold text-zinc-900 block">Google Organic:</span>
                <span className="text-zinc-500">Google search referrers</span>
              </div>
            </div>
          </div>
        </section>

        {/* STEP 3: WEBHOOKS SETUP */}
        <section className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Step 3: Connect Webhooks in Stripe or Dodo</h2>
              <p className="text-xs text-zinc-500">Matches paid customer emails to acquisition channels automatically</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stripe Card */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
              <h3 className="font-bold text-xs text-zinc-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Stripe Webhook Configuration
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                1. Go to Stripe Dashboard ➔ Developers ➔ Webhooks.<br />
                2. Click <strong>Add Endpoint</strong> and paste your route:<br />
              </p>
              <code className="text-xs font-mono bg-zinc-900 text-emerald-400 p-2.5 rounded-lg block truncate">
                https://your-domain.com/api/webhooks/stripe
              </code>
              <p className="text-[11px] text-zinc-500 font-mono">Event: payment_intent.succeeded</p>
            </div>

            {/* Dodo Card */}
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
              <h3 className="font-bold text-xs text-zinc-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Dodo Payments Configuration
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                1. Go to Dodo Payments ➔ Developer ➔ Webhooks.<br />
                2. Register your endpoint route:<br />
              </p>
              <code className="text-xs font-mono bg-zinc-900 text-emerald-400 p-2.5 rounded-lg block truncate">
                https://your-domain.com/api/webhooks/dodo
              </code>
              <p className="text-[11px] text-zinc-500 font-mono">Event: payment.succeeded</p>
            </div>
          </div>
        </section>

        {/* Real World Example Workflow */}
        <div className="p-6 bg-zinc-950 text-white rounded-2xl space-y-3">
          <h3 className="text-base font-bold flex items-center gap-2">
            <span>🎯 Real-World End-to-End Example</span>
          </h3>
          <ol className="space-y-2 text-xs text-zinc-300 font-mono list-decimal pl-4 leading-relaxed">
            <li>You tweet a link: <code className="text-emerald-400">https://myapp.com?utm_source=twitter&utm_campaign=launch</code></li>
            <li>A user clicks your link and lands on your homepage. Your <code className="text-emerald-400">&lt;head&gt;</code> script saves <code className="text-emerald-400">twitter</code>.</li>
            <li>User registers with <code className="text-emerald-400">customer@example.com</code>. Your signup code runs <code className="text-emerald-400">window.kevosh.track(&apos;customer@example.com&apos;)</code>.</li>
            <li>Later, <code className="text-emerald-400">customer@example.com</code> pays $20 via Stripe. Stripe sends a webhook to Kevosh.</li>
            <li>Kevosh matches the email and adds $20 to your <span className="text-emerald-400 font-bold">X / Twitter</span> channel stats!</li>
          </ol>
        </div>

        {/* Bottom Call to Action */}
        <div className="p-6 bg-white border border-zinc-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-zinc-950">Ready to test your integration?</h3>
            <p className="text-xs text-zinc-500">Go to your dashboard and click "⚡ Quick Setup Guide" to send a live test ping.</p>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shrink-0"
          >
            Go to Dashboard →
          </Link>
        </div>

      </main>
    </div>
  );
}

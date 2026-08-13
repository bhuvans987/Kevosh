'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuickStartModalProps {
  apiKey?: string | null;
  appUrl?: string;
}

export function QuickStartModal({ apiKey, appUrl = '' }: QuickStartModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'payments' | 'test'>('script');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [testEmail, setTestEmail] = useState('user@example.com');
  const [testSource, setTestSource] = useState('twitter');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const displayKey = apiKey || 'kev_live_your_api_key';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : appUrl || 'https://your-domain.com';

  const scriptTag = `<script src="${baseUrl}/kevosh.js" data-key="${displayKey}" defer></script>`;
  const jsCallSnippet = `// Call this when a user registers on your site:\nwindow.kevosh?.track('${testEmail}');`;

  const stripeWebhook = `${baseUrl}/api/webhooks/stripe`;
  const dodoWebhook = `${baseUrl}/api/webhooks/dodo`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendTestEvent = async () => {
    setTestStatus('loading');
    setTestMessage('');
    try {
      const res = await fetch('/api/track/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey || 'test_demo_key',
          email: testEmail,
          utm_source: testSource,
          utm_medium: 'cpc',
          utm_campaign: 'onboarding_test'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestStatus('success');
        setTestMessage('Test signup event recorded! Refreshing stats...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setTestStatus('error');
        setTestMessage(data.error || 'Failed to send test event');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err?.message || 'Network error occurred');
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        ⚡ Quick Setup Guide
      </button>

      {/* Modal Overlay Container */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex items-start justify-center pt-10 sm:pt-16 pb-10 animate-in fade-in duration-200">
          
          {/* Main Modal Box */}
          <div className="relative bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh] overflow-hidden my-0">
            
            {/* Pinned Sticky Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-zinc-200/80 bg-zinc-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-950 flex items-center gap-2">
                  <span>⚡ Kevosh 3-Minute Quick Setup</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Follow these 3 steps to connect traffic, track signups, and attribute revenue.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/docs"
                  target="_blank"
                  className="hidden sm:flex px-2.5 py-1 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-medium transition-colors items-center gap-1"
                >
                  Full Docs ↗
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Pinned Sticky Navigation Tabs */}
            <div className="shrink-0 flex border-b border-zinc-200 bg-white px-4 sm:px-5 pt-3 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('script')}
                className={`pb-3 text-xs font-semibold border-b-2 px-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'script'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-zinc-100 border border-zinc-300 text-[10px] flex items-center justify-center font-bold">1</span>
                1-Line Embed Script
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`pb-3 text-xs font-semibold border-b-2 px-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'payments'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-zinc-100 border border-zinc-300 text-[10px] flex items-center justify-center font-bold">2</span>
                Connect Payments
              </button>

              <button
                onClick={() => setActiveTab('test')}
                className={`pb-3 text-xs font-semibold border-b-2 px-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'test'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-zinc-100 border border-zinc-300 text-[10px] flex items-center justify-center font-bold">3</span>
                Test Connection
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

              {/* TAB 1: EMBED SCRIPT */}
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Step 1: Paste Script Tag in your HTML &lt;head&gt;</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Paste this line inside your website&apos;s <code className="bg-zinc-100 px-1 rounded">&lt;head&gt;</code> (e.g. <code className="bg-zinc-100 px-1 rounded font-mono">index.html</code> or <code className="bg-zinc-100 px-1 rounded font-mono">layout.tsx</code>). It automatically captures <code className="bg-zinc-100 px-1 rounded">?utm_source=twitter</code>, X, Google, Reddit.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-950 text-white rounded-xl border border-zinc-800 space-y-2 relative font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-400 text-[11px] border-b border-zinc-800 pb-1.5">
                      <span>HTML File Placement: &lt;head&gt;</span>
                      <button
                        onClick={() => handleCopy(scriptTag, 'scriptTag')}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-[11px] transition-colors cursor-pointer"
                      >
                        {copiedField === 'scriptTag' ? '✓ Copied!' : 'Copy Script Tag'}
                      </button>
                    </div>
                    <code className="text-emerald-400 block whitespace-pre-wrap break-all">
                      {scriptTag}
                    </code>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 mb-1">One-Time Setup: Trigger tracking on Sign-Up</h4>
                    <p className="text-xs text-zinc-500 mb-2">
                      Add <code className="bg-zinc-100 px-1 rounded font-mono font-semibold">window.kevosh.track(email)</code> <span className="font-semibold text-zinc-900">ONCE</span> inside your Sign-Up form handler function. It will then automatically track every new user registration:
                    </p>

                    <div className="p-4 bg-zinc-900 text-white rounded-xl border border-zinc-800 space-y-2 relative font-mono text-xs">
                      <div className="flex items-center justify-between text-zinc-400 text-[11px] border-b border-zinc-800 pb-1.5">
                        <span>Form Handler Function Example:</span>
                        <button
                          onClick={() => handleCopy(`// Inside your Sign-Up Form submit handler:\nif (window.kevosh) {\n  window.kevosh.track(userEmail);\n}`, 'jsCall')}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-[11px] transition-colors cursor-pointer"
                        >
                          {copiedField === 'jsCall' ? '✓ Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      <code className="text-zinc-300 block whitespace-pre">
{`async function handleSignUpSubmit(event) {
  event.preventDefault();
  const newCustomer = await createUserAccount(email);
  
  // ⚡ Execute Kevosh tracking on signup success:
  if (newCustomer && window.kevosh) {
    window.kevosh.track(newCustomer.email);
  }
}`}
                      </code>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs space-y-1">
                    <p className="font-semibold">💡 Your Account Public API Key:</p>
                    <code className="font-mono bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-bold text-[11px]">
                      {displayKey}
                    </code>
                  </div>
                </div>
              )}

              {/* TAB 2: PAYMENTS SETUP */}
              {activeTab === 'payments' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Step 2: Add Webhooks to Stripe or Dodo</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Kevosh listens for payments in read-only mode to match customer email addresses back to their acquisition channel.
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900">Stripe Webhook URL</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">payment_intent.succeeded</span>
                      </div>
                      <button
                        onClick={() => handleCopy(stripeWebhook, 'stripe')}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        {copiedField === 'stripe' ? '✓ Copied' : 'Copy URL'}
                      </button>
                    </div>
                    <code className="text-xs font-mono bg-zinc-100 p-2.5 rounded-lg text-zinc-800 block truncate">
                      {stripeWebhook}
                    </code>
                  </div>

                  <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900">Dodo Payments Webhook URL</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">payment.succeeded</span>
                      </div>
                      <button
                        onClick={() => handleCopy(dodoWebhook, 'dodo')}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        {copiedField === 'dodo' ? '✓ Copied' : 'Copy URL'}
                      </button>
                    </div>
                    <code className="text-xs font-mono bg-zinc-100 p-2.5 rounded-lg text-zinc-800 block truncate">
                      {dodoWebhook}
                    </code>
                  </div>
                </div>
              )}

              {/* TAB 3: TEST CONNECTION */}
              {activeTab === 'test' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">Step 3: Send a Test Event Live</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Test your connection immediately. This will send a simulated signup event to Kevosh and display it on your attribution dashboard.
                    </p>
                  </div>

                  <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Test Customer Email</label>
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Simulated Traffic Source</label>
                      <select
                        value={testSource}
                        onChange={(e) => setTestSource(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-900 font-medium"
                      >
                        <option value="twitter">X / Twitter (utm_source=twitter)</option>
                        <option value="reddit">Reddit (utm_source=reddit)</option>
                        <option value="google">Google Organic</option>
                        <option value="producthunt">Product Hunt</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSendTestEvent}
                      disabled={testStatus === 'loading'}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {testStatus === 'loading' ? (
                        <span>Sending Test Event...</span>
                      ) : (
                        <span>🚀 Send Test Signup Event</span>
                      )}
                    </button>

                    {testMessage && (
                      <div className={`p-3 rounded-lg text-xs font-medium ${
                        testStatus === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
                      }`}>
                        {testMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Sticky Footer */}
            <div className="shrink-0 p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
              <Link href="/docs" target="_blank" className="text-zinc-700 hover:text-zinc-950 font-medium underline">
                View Full Documentation Page ↗
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

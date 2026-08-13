import { auth, currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { SourceAttributionChart } from '@/components/SourceAttributionChart';
import { WeeklySummaryCard } from '@/components/WeeklySummaryCard';
import { UpgradeButton } from '@/components/UpgradeButton';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';

export interface SourceStat {
  source_label: string;
  signups: number;
  converted: number;
  conversion_rate: number;
}

async function getAttributionStats(founderId: string, isFreePlan: boolean): Promise<SourceStat[]> {
  // If free plan, restrict history query to last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  let signupsQuery = supabaseAdmin
    .from('signups')
    .select('id, source_label, end_customer_id, created_at')
    .eq('founder_id', founderId);

  let endCustomerSignupsQuery = supabaseAdmin
    .from('end_customer_signups')
    .select('id, source_label, email, end_customer_id, created_at')
    .eq('founder_id', founderId);

  if (isFreePlan) {
    signupsQuery = signupsQuery.gte('created_at', thirtyDaysAgo);
    endCustomerSignupsQuery = endCustomerSignupsQuery.gte('created_at', thirtyDaysAgo);
  }

  const [signupsRes, endCustomerSignupsRes, paymentsRes, endCustomersRes] = await Promise.all([
    signupsQuery,
    endCustomerSignupsQuery,
    supabaseAdmin
      .from('payments')
      .select('customer_email, status, created_at')
      .eq('user_id', founderId)
      .in('status', ['succeeded', 'paid']),
    supabaseAdmin
      .from('end_customers')
      .select('id, email')
      .eq('founder_id', founderId)
  ]);

  const paidEmails = new Set<string>();
  if (paymentsRes.data) {
    for (const p of paymentsRes.data) {
      if (p.customer_email) {
        paidEmails.add(p.customer_email.trim().toLowerCase());
      }
    }
  }

  const endCustomerEmailMap = new Map<string, string>();
  if (endCustomersRes.data) {
    for (const ec of endCustomersRes.data) {
      if (ec.id && ec.email) {
        endCustomerEmailMap.set(ec.id, ec.email.trim().toLowerCase());
      }
    }
  }

  type SignupItem = {
    source_label: string;
    email?: string | null;
  };

  const allSignups: SignupItem[] = [];

  if (signupsRes.data) {
    for (const s of signupsRes.data) {
      const email = s.end_customer_id ? endCustomerEmailMap.get(s.end_customer_id) : null;
      allSignups.push({
        source_label: s.source_label || 'Direct / Unknown',
        email: email || null,
      });
    }
  }

  if (endCustomerSignupsRes.data) {
    for (const s of endCustomerSignupsRes.data) {
      const email = s.email?.trim().toLowerCase() || (s.end_customer_id ? endCustomerEmailMap.get(s.end_customer_id) : null);
      allSignups.push({
        source_label: s.source_label || 'Direct / Unknown',
        email: email || null,
      });
    }
  }

  if (allSignups.length === 0) {
    return [];
  }

  const statsMap = new Map<string, { signups: number; converted: number }>();

  for (const item of allSignups) {
    const label = item.source_label;
    if (!statsMap.has(label)) {
      statsMap.set(label, { signups: 0, converted: 0 });
    }
    const current = statsMap.get(label)!;
    current.signups += 1;

    if (item.email && paidEmails.has(item.email)) {
      current.converted += 1;
    }
  }

  const result: SourceStat[] = [];
  for (const [source_label, data] of statsMap.entries()) {
    const rate = data.signups > 0 ? data.converted / data.signups : 0;
    result.push({
      source_label,
      signups: data.signups,
      converted: data.converted,
      conversion_rate: rate,
    });
  }

  result.sort((a, b) => b.signups - a.signups);

  return result;
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage(props: {
  searchParams?: Promise<{ subscription?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const searchParams = props.searchParams ? await props.searchParams : {};
  const isSubscriptionActivated =
    searchParams?.subscription === 'activated' ||
    searchParams?.subscription === 'success';

  const user = await currentUser();

  // Look up internal founder record by clerk_user_id
  let founderId: string | null = null;
  let plan = 'free';

  const { data: founder, error: founderQueryErr } = await supabaseAdmin
    .from('founders')
    .select('id, plan')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (founderQueryErr) {
    console.error('[Dashboard Founders Query Error]:', founderQueryErr);
  }

  if (founder) {
    founderId = founder.id;
    plan = founder.plan || 'free';
  }

  // If subscription return URL parameter is present or plan was requested, activate plan
  if (isSubscriptionActivated && plan !== 'paid') {
    const email = user?.emailAddresses?.[0]?.emailAddress || null;
    const { data: updatedFounder } = await supabaseAdmin
      .from('founders')
      .upsert(
        { clerk_user_id: userId, email, plan: 'paid', subscription_status: 'active' },
        { onConflict: 'clerk_user_id' }
      )
      .select('id, plan')
      .maybeSingle();

    if (updatedFounder) {
      founderId = updatedFounder.id;
      plan = updatedFounder.plan || 'paid';
    } else {
      plan = 'paid';
    }
  } else if (!founder) {
    const email = user?.emailAddresses?.[0]?.emailAddress || null;
    const { data: newFounder } = await supabaseAdmin
      .from('founders')
      .upsert(
        { clerk_user_id: userId, email, plan: 'free' },
        { onConflict: 'clerk_user_id' }
      )
      .select('id, plan')
      .maybeSingle();

    if (newFounder) {
      founderId = newFounder.id;
      plan = newFounder.plan || 'free';
    }
  }

  const isFreePlan = plan === 'free';
  const stats = founderId ? await getAttributionStats(founderId, isFreePlan) : [];

  const totalSignups = stats.reduce((acc, curr) => acc + curr.signups, 0);
  const totalConverted = stats.reduce((acc, curr) => acc + curr.converted, 0);
  const overallConversionRate = totalSignups > 0 ? (totalConverted / totalSignups) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#09090b] flex flex-col font-sans">
      {/* Attio Top Header Nav */}
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
            <span className="font-bold text-sm tracking-tight text-zinc-900 hidden sm:inline">
              Kevosh
            </span>
          </Link>
          <span className="text-zinc-300 hidden sm:inline">/</span>
          <span className="text-xs font-medium text-zinc-700 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-md">
            Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Plan Status Badge */}
          {isFreePlan ? (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-mono font-medium">
                Free Plan (30-day Window)
              </span>
              <UpgradeButton label="Upgrade $20/mo" className="hidden sm:flex px-3 py-1 text-xs font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-all items-center gap-1 cursor-pointer" />
            </div>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Pro Plan ($20/mo)
            </span>
          )}

          <div className="flex items-center gap-3 border-l border-zinc-200 pl-3">
            <DeleteAccountModal />
            <div className="text-right hidden lg:block">
              <p className="text-xs font-medium text-zinc-800">{user?.firstName || user?.emailAddresses[0]?.emailAddress}</p>
              <p className="text-[10px] text-zinc-500 font-mono">Plan: {plan.toUpperCase()}</p>
            </div>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-5">
        {/* Streamlined Single Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200/80">
          <div>
            <h1 className="text-xl font-bold text-zinc-950 tracking-tight">
              Welcome back, {user?.firstName || 'Founder'}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Multi-channel revenue attribution engine and conversion analytics
            </p>
          </div>
          {isFreePlan ? (
            <div className="flex items-center gap-2.5 bg-white border border-zinc-200 rounded-xl px-3.5 py-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-zinc-700 font-medium">30-Day History (Free)</span>
              <UpgradeButton label="Upgrade $20/mo →" className="px-3 py-1 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs cursor-pointer" />
            </div>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-medium flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Pro Plan Active
            </span>
          )}
        </div>

        {/* AI Performance Weekly Summary Card */}
        {isFreePlan ? (
          <div className="attio-card rounded-xl p-4 sm:p-5 border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-950">AI Weekly Attribution Summaries</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Automated strategic digests analyzing top-converting acquisition channels & revenue velocity.
                </p>
              </div>
            </div>
            <UpgradeButton label="Unlock AI Summary ($20/mo)" className="shrink-0 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs transition-all cursor-pointer" />
          </div>
        ) : (
          <WeeklySummaryCard initialStats={stats} />
        )}

        {/* Top KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="attio-card p-5 rounded-xl">
            <p className="text-xs text-zinc-500 mb-1 font-medium">Total Tracked Signups</p>
            <p className="text-2xl font-bold text-zinc-950 font-mono">{totalSignups.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">{isFreePlan ? 'Last 30 days (Free)' : 'All-time history'}</p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <p className="text-xs text-zinc-500 mb-1 font-medium">Paying Customers</p>
            <p className="text-2xl font-bold text-emerald-600 font-mono">{totalConverted.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600/80 mt-1 font-mono">Succeeded Stripe/Dodo payments</p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <p className="text-xs text-zinc-500 mb-1 font-medium">Overall Conversion Rate</p>
            <p className="text-2xl font-bold text-zinc-950 font-mono">{overallConversionRate.toFixed(1)}%</p>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">Conversion efficiency</p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <p className="text-xs text-zinc-500 mb-1 font-medium">Connected Sources</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-mono">Stripe</span>
              {isFreePlan ? (
                <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-400 text-xs font-mono border border-zinc-200">Dodo (Locked)</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono">Dodo</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-mono">{isFreePlan ? '1 Source Active (Free Limit)' : '2 Sources Active'}</p>
          </div>
        </div>

        {/* Connected Integration Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Connected Integrations & Setup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stripe Card */}
            <div className="attio-card p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800">
                        <rect x="2" y="5" width="20" height="14" rx="3" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-sm">Stripe Payments</h3>
                      <p className="text-xs text-zinc-500">Read-Only Ingestion</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-mono font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Active
                  </span>
                </div>
                <p className="text-xs text-zinc-600">
                  Ingests paid subscription events from your customer Stripe account.
                </p>
              </div>

              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white space-y-1">
                <p className="text-[11px] font-mono text-zinc-400">Stripe Webhook Route:</p>
                <code className="text-xs font-mono text-zinc-300 block truncate">
                  /api/webhooks/stripe
                </code>
              </div>
            </div>

            {/* Dodo Card */}
            <div className="attio-card p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-sm">Dodo Payments</h3>
                      <p className="text-xs text-zinc-500">Signature Listener</p>
                    </div>
                  </div>
                  {isFreePlan ? (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs text-zinc-500 font-mono font-medium">
                      Locked (Free)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-mono font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600">
                  Ingests paid order & recurring payment events from Dodo.
                </p>
              </div>

              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white space-y-1">
                <p className="text-[11px] font-mono text-zinc-400">Dodo Webhook Route:</p>
                <code className="text-xs font-mono text-zinc-300 block truncate">
                  /api/webhooks/dodo
                </code>
              </div>
            </div>

            {/* Traffic & Signup Tracking Card */}
            <div className="attio-card p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center shrink-0 shadow-xs">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-sm">Traffic & Signup API</h3>
                      <p className="text-xs text-zinc-500">X, Google, Reddit, UTMs</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-mono font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Listening
                  </span>
                </div>
                <p className="text-xs text-zinc-600">
                  Sends signup & UTM attribution events to Kevosh.
                </p>
              </div>

              <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 text-white space-y-1">
                <p className="text-[11px] font-mono text-zinc-400">Signup Track Endpoint:</p>
                <code className="text-xs font-mono text-zinc-300 block truncate">
                  /api/track/signup
                </code>
              </div>
            </div>
          </div>

          {/* Expanded Traffic Setup Code Snippet & UTM Instructions */}
          <div className="attio-card p-5 rounded-xl border border-zinc-200 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-900" />
                  Traffic & Signup Integration Code (X / Twitter, Google, Reddit, etc.)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Call this API from your frontend or server when a user registers on your application to capture marketing source.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 px-2.5 py-1 rounded-md">
                <span>Method:</span>
                <span className="font-bold text-emerald-600">POST</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Code Snippet Box */}
              <div className="p-3.5 bg-zinc-900 text-white rounded-lg border border-zinc-800 font-mono text-[11px] space-y-1.5">
                <div className="text-zinc-400 flex items-center justify-between">
                  <span>cURL Integration Snippet:</span>
                  <span className="text-[10px] text-emerald-400 font-sans font-medium">Ready to test</span>
                </div>
                <code className="text-zinc-300 block overflow-x-auto whitespace-pre">
{`curl -X POST https://your-domain.com/api/track/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "utm_source": "twitter",
    "utm_medium": "cpc",
    "utm_campaign": "launch_promo"
  }'`}
                </code>
              </div>

              {/* Supported Traffic Sources & Rules */}
              <div className="bg-zinc-50/80 border border-zinc-200 rounded-lg p-3.5 space-y-2 text-xs">
                <h4 className="font-semibold text-zinc-800 text-[12px]">Auto-Normalized Traffic Sources:</h4>
                <ul className="space-y-1.5 text-zinc-600 font-mono text-[11px]">
                  <li className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold">X / Twitter:</span>
                    <span><code className="text-zinc-800 font-bold">utm_source=x</code> or <code className="text-zinc-800 font-bold">twitter</code></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold">Reddit:</span>
                    <span><code className="text-zinc-800 font-bold">utm_source=reddit</code> or referrer URL</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold">Product Hunt:</span>
                    <span><code className="text-zinc-800 font-bold">utm_source=producthunt</code></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold">Google:</span>
                    <span>Organic Google search referrers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Attribution Breakdown */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                Signup Conversion by Source
              </h2>
              <p className="text-xs text-zinc-500">
                Performance metrics aggregated and sorted by total signup volume
              </p>
            </div>

            {stats.length > 0 && (
              <div className="flex items-center gap-4 text-xs font-mono bg-white border border-zinc-200 px-3.5 py-2 rounded-lg shadow-xs">
                <div>
                  <span className="text-zinc-500">Signups: </span>
                  <span className="text-zinc-900 font-bold">{totalSignups}</span>
                </div>
                <span className="text-zinc-300">|</span>
                <div>
                  <span className="text-zinc-500">Converted: </span>
                  <span className="text-emerald-600 font-bold">{totalConverted}</span>
                </div>
                <span className="text-zinc-300">|</span>
                <div>
                  <span className="text-zinc-500">Avg Rate: </span>
                  <span className="text-zinc-900 font-bold">{overallConversionRate.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>

          {stats.length === 0 ? (
            /* Polished Empty State for New Founders */
            <div className="p-8 sm:p-12 rounded-xl bg-white border border-dashed border-zinc-300 text-center space-y-5 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center mx-auto shadow-xs">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800">
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-5 5-4-4-5 5" />
                  <circle cx="18" cy="9" r="2" fill="currentColor" />
                </svg>
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-base font-semibold text-zinc-900">No Attribution Events Recorded Yet</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Kevosh is active and listening for signups. Integrate our lightweight tracking snippet or call our API to start capturing revenue attribution.
                </p>
              </div>

              {/* Sample API snippet box */}
              <div className="max-w-md mx-auto p-3.5 bg-zinc-900 text-white rounded-lg border border-zinc-800 text-left font-mono text-[11px] space-y-1">
                <div className="text-zinc-400 flex items-center justify-between">
                  <span>Sample Track API Request:</span>
                  <span className="text-[10px] text-emerald-400">Ready</span>
                </div>
                <code className="text-zinc-300 block overflow-x-auto whitespace-pre">
{`curl -X POST https://your-domain.com/api/track/signup \\
  -H "Content-Type: application/json" \\
  -d '{"utm_source":"twitter", "email":"user@example.com"}'`}
                </code>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Bar Chart */}
              <SourceAttributionChart data={stats} />

              {/* Data Table */}
              <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-700">
                    <thead className="bg-zinc-50 text-[11px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200 font-semibold">
                      <tr>
                        <th scope="col" className="px-6 py-3.5">
                          source_label
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-right">
                          signups
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-right">
                          converted
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-right">
                          conversion rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono text-xs">
                      {stats.map((row) => {
                        const ratePct = (row.conversion_rate * 100).toFixed(1);
                        return (
                          <tr key={row.source_label} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="px-6 py-4 font-sans text-sm font-medium text-zinc-900 flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-zinc-900" />
                              {row.source_label}
                            </td>
                            <td className="px-6 py-4 text-right text-zinc-800 font-semibold">
                              {row.signups.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold ${row.converted > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-zinc-400'}`}>
                                {row.converted.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex items-center gap-3 justify-end">
                                <div className="w-20 bg-zinc-100 rounded-full h-1.5 hidden sm:block overflow-hidden border border-zinc-200/60">
                                  <div
                                    className="bg-zinc-900 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, row.conversion_rate * 100))}%` }}
                                  />
                                </div>
                                <span className="font-bold text-zinc-950">
                                  {ratePct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

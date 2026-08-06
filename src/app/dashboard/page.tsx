import { auth, currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { SourceAttributionChart } from '@/components/SourceAttributionChart';

export interface SourceStat {
  source_label: string;
  signups: number;
  converted: number;
  conversion_rate: number;
}

async function getAttributionStats(founderId: string): Promise<SourceStat[]> {
  const [signupsRes, endCustomerSignupsRes, paymentsRes, endCustomersRes] = await Promise.all([
    supabaseAdmin
      .from('signups')
      .select('id, source_label, end_customer_id')
      .eq('founder_id', founderId),
    supabaseAdmin
      .from('end_customer_signups')
      .select('id, source_label, email, end_customer_id')
      .eq('founder_id', founderId),
    supabaseAdmin
      .from('payments')
      .select('customer_email, status')
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

  // Sort by signups descending by default
  result.sort((a, b) => b.signups - a.signups);

  return result;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();

  // Look up internal founder.id by clerk_user_id
  let founderId: string | null = null;
  const { data: founder } = await supabaseAdmin
    .from('founders')
    .select('id')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (founder) {
    founderId = founder.id;
  } else {
    const email = user?.emailAddresses?.[0]?.emailAddress || null;
    const { data: newFounder } = await supabaseAdmin
      .from('founders')
      .upsert(
        { clerk_user_id: userId, email },
        { onConflict: 'clerk_user_id' }
      )
      .select('id')
      .maybeSingle();

    if (newFounder) {
      founderId = newFounder.id;
    }
  }

  const stats = founderId ? await getAttributionStats(founderId) : [];

  const totalSignups = stats.reduce((acc, curr) => acc + curr.signups, 0);
  const totalConverted = stats.reduce((acc, curr) => acc + curr.converted, 0);
  const overallConversionRate = totalSignups > 0 ? (totalConverted / totalSignups) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      {/* Attio Top Header Nav */}
      <header className="border-b border-white/10 bg-[#0d0e12]/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-zinc-900 border border-white/15 flex items-center justify-center shadow-inner group-hover:border-white/30 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              Attributely
            </span>
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-xs font-medium text-zinc-300 bg-zinc-900 border border-white/10 px-2.5 py-0.5 rounded-md">
            Dashboard
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Webhook Sync Active</span>
          </div>

          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-medium text-zinc-200">{user?.firstName || user?.emailAddresses[0]?.emailAddress}</p>
              <p className="text-[10px] text-zinc-500 font-mono">ID: {user?.id?.slice(0, 12)}...</p>
            </div>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-8">
        {/* Welcome Strip */}
        <div className="p-6 rounded-xl bg-[#121318] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Welcome back, {user?.firstName || 'Founder'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Multi-channel revenue attribution engine and conversion analytics
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300">
            <span>Workspace: </span>
            <span className="text-indigo-400 font-bold">Production</span>
          </div>
        </div>

        {/* Top KPI Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="attio-card p-5 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1 font-medium">Total Tracked Signups</p>
            <p className="text-2xl font-bold text-white font-mono">{totalSignups.toLocaleString()}</p>
            <p className="text-[11px] text-zinc-500 mt-1 font-mono">Aggregated across all channels</p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1 font-medium">Paying Customers</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{totalConverted.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-500/80 mt-1 font-mono">Succeeded Stripe/Dodo payments</p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1 font-medium">Overall Conversion Rate</p>
            <p className="text-2xl font-bold text-indigo-400 font-mono">{overallConversionRate.toFixed(1)}%</p>
            <p className="text-[11px] text-indigo-400/80 mt-1 font-mono">Conversion efficiency</p>
          </div>

          <div className="attio-card p-5 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1 font-medium">Payment Integrations</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">Stripe</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">Dodo</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-mono">2 Active Webhook Listeners</p>
          </div>
        </div>

        {/* Connected Payment Integration Cards */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Connected Payment Providers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stripe Card */}
            <div className="attio-card p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Stripe Account</h3>
                    <p className="text-xs text-zinc-400">Read-Only Webhook Ingestion</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-white/10 space-y-1">
                <p className="text-[11px] font-mono text-zinc-400">Webhook Endpoint Route:</p>
                <code className="text-xs font-mono text-indigo-400 block truncate">
                  /api/webhooks/stripe
                </code>
              </div>
            </div>

            {/* Dodo Card */}
            <div className="attio-card p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    D
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Dodo Payments</h3>
                    <p className="text-xs text-zinc-400">Read-Only Signature Listener</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-white/10 space-y-1">
                <p className="text-[11px] font-mono text-zinc-400">Webhook Endpoint Route:</p>
                <code className="text-xs font-mono text-emerald-400 block truncate">
                  /api/webhooks/dodo
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Channel Attribution Breakdown */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Signup Conversion by Source
              </h2>
              <p className="text-xs text-zinc-400">
                Performance metrics aggregated and sorted by total signup volume
              </p>
            </div>

            {stats.length > 0 && (
              <div className="flex items-center gap-4 text-xs font-mono bg-zinc-900 border border-white/10 px-3.5 py-2 rounded-lg">
                <div>
                  <span className="text-zinc-500">Signups: </span>
                  <span className="text-white font-bold">{totalSignups}</span>
                </div>
                <span className="text-zinc-700">|</span>
                <div>
                  <span className="text-zinc-500">Converted: </span>
                  <span className="text-emerald-400 font-bold">{totalConverted}</span>
                </div>
                <span className="text-zinc-700">|</span>
                <div>
                  <span className="text-zinc-500">Avg Rate: </span>
                  <span className="text-indigo-400 font-bold">{overallConversionRate.toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>

          {stats.length === 0 ? (
            /* Attio Empty State */
            <div className="p-12 rounded-xl bg-[#121318] border border-dashed border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 text-indigo-400 flex items-center justify-center mx-auto text-xl shadow-inner">
                📊
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">No attribution data recorded yet</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  As soon as visitors navigate to your app via campaign referral links, signups and converted paying customers will appear here automatically.
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-400 font-mono">
                  💡 Ingest signups via API: POST /api/track/signup
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Bar Chart Comparing Volume vs Paying Customers */}
              <SourceAttributionChart data={stats} />

              {/* Attio Data Table */}
              <div className="rounded-xl border border-white/10 bg-[#121318] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-[#0d0e12] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-white/10 font-semibold">
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
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {stats.map((row) => {
                        const ratePct = (row.conversion_rate * 100).toFixed(1);
                        return (
                          <tr key={row.source_label} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-6 py-4 font-sans text-sm font-medium text-white flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-400" />
                              {row.source_label}
                            </td>
                            <td className="px-6 py-4 text-right text-zinc-200 font-semibold">
                              {row.signups.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold ${row.converted > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500'}`}>
                                {row.converted.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="inline-flex items-center gap-3 justify-end">
                                <div className="w-20 bg-zinc-900 rounded-full h-1.5 hidden sm:block overflow-hidden border border-white/5">
                                  <div
                                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, row.conversion_rate * 100))}%` }}
                                  />
                                </div>
                                <span className="font-bold text-indigo-400">
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



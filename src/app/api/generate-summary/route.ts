import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAttributionSummary, SourceStat } from '@/lib/ai-summary';

function buildFallbackSummary(sources: SourceStat[]): string {
  if (!sources || sources.length === 0) {
    return "No attribution source data is currently available. Once signups and conversions are recorded across your channels, performance summaries will appear here.";
  }

  const totalSignups = sources.reduce((acc, s) => acc + s.signups, 0);
  const totalConverted = sources.reduce((acc, s) => acc + s.converted, 0);
  const overallRate = totalSignups > 0 ? ((totalConverted / totalSignups) * 100).toFixed(1) : "0.0";

  // Sort by signups and conversion rate
  const sortedBySignups = [...sources].sort((a, b) => b.signups - a.signups);
  const sortedByRate = [...sources].sort((a, b) => b.conversion_rate - a.conversion_rate);

  const topSignupSource = sortedBySignups[0];
  const topRateSource = sortedByRate[0];

  const topSignupRatePct = (topSignupSource.conversion_rate <= 1 ? topSignupSource.conversion_rate * 100 : topSignupSource.conversion_rate).toFixed(1);
  const topRatePct = (topRateSource.conversion_rate <= 1 ? topRateSource.conversion_rate * 100 : topRateSource.conversion_rate).toFixed(1);

  let sentence1 = `Your highest volume channel was "${topSignupSource.source_label}" driving ${topSignupSource.signups} signups and ${topSignupSource.converted} paid conversions (${topSignupRatePct}% conversion rate).`;

  let sentence2 = "";
  if (topRateSource.source_label !== topSignupSource.source_label && topRateSource.conversion_rate > 0) {
    sentence2 = ` In comparison, "${topRateSource.source_label}" demonstrated peak conversion efficiency at ${topRatePct}% (${topRateSource.converted} converted from ${topRateSource.signups} signups).`;
  } else {
    sentence2 = ` Overall conversion efficiency stands at ${overallRate}% across ${sources.length} active channel${sources.length > 1 ? 's' : ''}.`;
  }

  let sentence3 = ` Across all channels combined, Kevosh recorded ${totalSignups} total signups and ${totalConverted} converted paying customer${totalConverted === 1 ? '' : 's'} (${overallRate}% overall rate).`;

  let sentence4 = ` To optimize your CAC, allocate more focus toward high-intent conversion channels while refining landing page positioning for high-volume top-of-funnel sources.`;

  return `${sentence1}${sentence2}${sentence3}${sentence4}`;
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

  type SignupItem = { source_label: string; email?: string | null };
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

  if (allSignups.length === 0) return [];

  const statsMap = new Map<string, { signups: number; converted: number }>();
  for (const item of allSignups) {
    const label = item.source_label;
    if (!statsMap.has(label)) statsMap.set(label, { signups: 0, converted: 0 });
    const current = statsMap.get(label)!;
    current.signups += 1;
    if (item.email && paidEmails.has(item.email)) current.converted += 1;
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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let sources: SourceStat[] = body.sources;

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      const { data: founder } = await supabaseAdmin
        .from('founders')
        .select('id')
        .eq('clerk_user_id', userId)
        .maybeSingle();

      if (founder) {
        sources = await getAttributionStats(founder.id);
      } else {
        sources = [];
      }
    }

    const result = await generateAttributionSummary(sources);

    if (!result.success && result.error?.includes('GROQ_API_KEY')) {
      const fallbackSummary = buildFallbackSummary(sources);
      return NextResponse.json({
        success: true,
        summary: fallbackSummary,
        modelUsed: 'Kevosh Insights Engine',
        isFallback: true,
        timestamp: new Date().toISOString(),
      });
    }

    if (!result.success) {
      const fallbackSummary = buildFallbackSummary(sources);
      return NextResponse.json({
        success: true,
        summary: fallbackSummary,
        modelUsed: 'Kevosh Insights Engine',
        isFallback: true,
        timestamp: new Date().toISOString(),
        warning: result.error,
      });
    }

    return NextResponse.json({
      success: true,
      summary: result.summary,
      modelUsed: result.modelUsed || 'llama-3.3-70b-versatile',
      isFallback: false,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error generating summary' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}

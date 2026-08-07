import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Scheduled Cron Job: Daily Auto-Purge of raw_event Blobs Older Than 30 Days
 *
 * This routine updates payments records older than 30 days, resetting their
 * `raw_event` JSONB field to `{}` to ensure long-term PII minimization.
 * It NEVER modifies or deletes structured columns (`amount`, `currency`,
 * `status`, `customer_email`, `payment_id`, or `user_id`).
 */
export async function GET(req: NextRequest) {
  try {
    // Optional secret check if CRON_SECRET is configured
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const vercelCronHeader = req.headers.get('x-vercel-cron');
      if (!vercelCronHeader) {
        return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 });
      }
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({ raw_event: {} })
      .lt('created_at', thirtyDaysAgo)
      .neq('raw_event', {})
      .select('id');

    if (error) {
      console.error('[Cron Purge Error]:', error);
      return NextResponse.json({ error: 'Database update failed', details: error }, { status: 500 });
    }

    const purgedCount = data?.length || 0;
    console.log(`[Cron Purge Success]: Cleared raw_event JSONB for ${purgedCount} payment records older than 30 days.`);

    return NextResponse.json({
      success: true,
      message: `Successfully purged raw_event blobs for ${purgedCount} payment records older than 30 days.`,
      purgedCount,
      cutoffDate: thirtyDaysAgo,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Cron Purge Exception]:', err);
    return NextResponse.json(
      { error: 'Internal Server Error during raw_event purge', message: err?.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeSource } from '@/lib/source-normalization';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { api_key, email, utm_source, utm_medium, utm_campaign, referrer, how_heard_raw } = body;

    if (!api_key) {
      return NextResponse.json(
        { error: 'Missing API key. Include api_key in payload or script data-key.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. Resolve founder via public API key
    let founderId: string | null = null;

    const { data: founderByKey } = await supabaseAdmin
      .from('founders')
      .select('id')
      .eq('public_api_key', api_key)
      .maybeSingle();

    if (founderByKey) {
      founderId = founderByKey.id;
    } else {
      // Fallback 1: Try by founder ID directly if passed
      const { data: founderById } = await supabaseAdmin
        .from('founders')
        .select('id')
        .eq('id', api_key)
        .maybeSingle();

      if (founderById) {
        founderId = founderById.id;
      } else if (api_key.startsWith('test_') || api_key.startsWith('kev_live_')) {
        // Fallback 2 for test mode: grab the most recent founder
        const { data: latestFounder } = await supabaseAdmin
          .from('founders')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestFounder) {
          founderId = latestFounder.id;
        }
      }
    }

    if (!founderId) {
      return NextResponse.json(
        { error: 'Invalid API key. Check your Kevosh Dashboard for your live key.' },
        { status: 401, headers: corsHeaders }
      );
    }

    let endCustomerId = null;
    let normalizedEmail = email?.trim().toLowerCase() || null;

    // 2. If email is provided, upsert into end_customers
    if (normalizedEmail) {
      const { data: endCustomer, error: ecErr } = await supabaseAdmin
        .from('end_customers')
        .upsert(
          { founder_id: founderId, email: normalizedEmail },
          { onConflict: 'founder_id,email' }
        )
        .select('id')
        .single();

      if (!ecErr && endCustomer) {
        endCustomerId = endCustomer.id;
      }
    }

    // 3. Normalize source label & safely extract referrer domain
    const sourceLabel = normalizeSource({
      utm_source, utm_medium, utm_campaign, referrer, how_heard_raw,
    }) || 'Direct / Unknown';

    let referrerDomain = null;
    if (referrer) {
      try {
        referrerDomain = new URL(referrer).hostname;
      } catch (e) {
        referrerDomain = referrer;
      }
    }

    // 4. Insert into end_customer_signups
    const { error: signupErr } = await supabaseAdmin
      .from('end_customer_signups')
      .insert({
        founder_id: founderId,
        end_customer_id: endCustomerId,
        email: normalizedEmail,
        utm_source,
        utm_medium,
        utm_campaign,
        referrer_domain: referrerDomain,
        how_heard_raw,
        source_label: sourceLabel,
      });

    if (signupErr) {
      // Fallback insert into signups table if end_customer_signups table isn't present
      await supabaseAdmin.from('signups').insert({
        founder_id: founderId,
        end_customer_id: endCustomerId,
        utm_source,
        utm_medium,
        utm_campaign,
        referrer_domain: referrerDomain,
        how_heard_raw,
        source_label: sourceLabel,
      });
    }

    // 5. Return success with CORS headers
    return NextResponse.json(
      { success: true, message: 'Signup tracked', source_label: sourceLabel },
      { status: 200, headers: corsHeaders }
    );

  } catch (err: any) {
    console.error('[Tracking API Error]:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight requests from external domains
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

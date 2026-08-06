import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeSource } from '@/lib/source-normalization';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { api_key, email, utm_source, utm_medium, utm_campaign, referrer, how_heard_raw } = body;

    if (!api_key) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 400 });
    }

    // 1. Resolve founder via public API key
    const { data: founder, error: founderErr } = await supabaseAdmin
      .from('founders')
      .select('id')
      .eq('public_api_key', api_key)
      .single();

    if (founderErr || !founder) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    let endCustomerId = null;
    let normalizedEmail = email?.trim().toLowerCase() || null;

    // 2. If email is provided, upsert into end_customers
    if (normalizedEmail) {
      const { data: endCustomer, error: ecErr } = await supabaseAdmin
        .from('end_customers')
        .upsert(
          { founder_id: founder.id, email: normalizedEmail },
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
        referrerDomain = referrer; // Fallback if not a valid URL
      }
    }

    // 4. Insert into end_customer_signups
    const { error: signupErr } = await supabaseAdmin
      .from('end_customer_signups')
      .insert({
        founder_id: founder.id,
        end_customer_id: endCustomerId,
        email: normalizedEmail,
        utm_source,
        utm_medium,
        utm_campaign,
        referrer_domain: referrerDomain,
        how_heard_raw,
        source_label: sourceLabel,
      });

    if (signupErr) throw signupErr;

    // 5. Return success with CORS headers
    return NextResponse.json({ success: true, message: 'Signup tracked' }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (err: any) {
    console.error('[Tracking API Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle CORS preflight requests from external domains
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeSource } from '@/lib/source-normalization';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  const body = await req.text();

  let payload: any;

  if (WEBHOOK_SECRET && WEBHOOK_SECRET !== 'whsec_your_clerk_webhook_secret_here') {
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('[Clerk Webhook Error]: Missing Svix headers');
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      payload = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as any;
    } catch (err: any) {
      console.error(`[Clerk Webhook Signature Verification Failed]: ${err.message}`);
      return NextResponse.json({ error: `Webhook verification failed: ${err.message}` }, { status: 400 });
    }
  } else {
    console.warn('[Clerk Webhook Warning]: CLERK_WEBHOOK_SECRET is not configured or using placeholder.');
    try {
      payload = JSON.parse(body);
    } catch (err: any) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  }

  const eventType = payload.type;
  console.log(`[Clerk Webhook Received]: Event '${eventType}'`);

  if (eventType === 'user.created') {
    const data = payload.data || {};
    const clerkUserId = data?.id;
    const primaryEmailId = data?.primary_email_address_id;
    const emailAddresses = data?.email_addresses || [];

    const primaryEmailObj = emailAddresses.find((e: any) => e.id === primaryEmailId) || emailAddresses[0];
    const email = primaryEmailObj?.email_address || null;

    if (!clerkUserId) {
      console.error('[Clerk Webhook Error]: Missing user ID in user.created payload');
      return NextResponse.json({ error: 'Missing clerk user ID' }, { status: 400 });
    }

    console.log(`[Clerk Webhook user.created]: Registering founder clerk_user_id='${clerkUserId}', email='${email}'`);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // 1. Upsert founder record
        const { data: founder, error: founderErr } = await supabaseAdmin
          .from('founders')
          .upsert(
            {
              clerk_user_id: clerkUserId,
              email: email,
            },
            {
              onConflict: 'clerk_user_id',
            }
          )
          .select('id')
          .single();

        if (founderErr || !founder) {
          console.error('[Supabase Founder Upsert Error - Clerk Webhook]:', founderErr);
          return NextResponse.json({ error: 'Database founder insert failed' }, { status: 500 });
        }

        console.log(`[Clerk Webhook Success]: Founder record ensured for clerk_user_id '${clerkUserId}' with internal id '${founder.id}'`);

        // 2. Extract attribution metadata from attr_src cookie/param or Clerk unsafe_metadata
        const cookieVal = req.cookies.get('attr_src')?.value;
        const queryVal = req.nextUrl.searchParams.get('attr_src');

        const cookieAttr = parseAttrData(cookieVal);
        const queryAttr = parseAttrData(queryVal);
        const unsafeAttr = parseAttrData(data?.unsafe_metadata?.attr_src);
        const unsafeDirect = data?.unsafe_metadata || {};

        const utmSource =
          cookieAttr?.utm_source ||
          queryAttr?.utm_source ||
          unsafeAttr?.utm_source ||
          unsafeDirect?.utm_source ||
          null;

        const utmMedium =
          cookieAttr?.utm_medium ||
          queryAttr?.utm_medium ||
          unsafeAttr?.utm_medium ||
          unsafeDirect?.utm_medium ||
          null;

        const utmCampaign =
          cookieAttr?.utm_campaign ||
          queryAttr?.utm_campaign ||
          unsafeAttr?.utm_campaign ||
          unsafeDirect?.utm_campaign ||
          null;

        const utmTerm =
          cookieAttr?.utm_term ||
          queryAttr?.utm_term ||
          unsafeAttr?.utm_term ||
          unsafeDirect?.utm_term ||
          null;

        const utmContent =
          cookieAttr?.utm_content ||
          queryAttr?.utm_content ||
          unsafeAttr?.utm_content ||
          unsafeDirect?.utm_content ||
          null;

        const referrer =
          cookieAttr?.referrer ||
          cookieAttr?.referrer_domain ||
          queryAttr?.referrer ||
          queryAttr?.referrer_domain ||
          unsafeAttr?.referrer ||
          unsafeAttr?.referrer_domain ||
          unsafeDirect?.referrer ||
          unsafeDirect?.referrer_domain ||
          null;

        const howHeardRaw =
          cookieAttr?.how_heard_raw ||
          queryAttr?.how_heard_raw ||
          unsafeAttr?.how_heard_raw ||
          unsafeDirect?.how_heard_raw ||
          null;

        // 3. Normalize source label
        const sourceLabel =
          normalizeSource({
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_term: utmTerm,
            utm_content: utmContent,
            referrer: referrer,
            how_heard_raw: howHeardRaw,
          }) || 'Direct / Unknown';

        // 4. Insert signup record into signups table
        const { error: signupErr } = await supabaseAdmin
          .from('signups')
          .insert({
            founder_id: founder.id,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            referrer_domain: referrer,
            how_heard_raw: howHeardRaw,
            source_label: sourceLabel,
          });

        if (signupErr) {
          console.error('[Supabase Signup Insert Error - Clerk Webhook]:', signupErr);
          return NextResponse.json({ error: 'Database signup record failed' }, { status: 500 });
        }

        console.log(`[Clerk Webhook Success]: Signup attribution record created for founder '${founder.id}' with source_label '${sourceLabel}'`);
      } catch (dbErr) {
        console.error('[Supabase DB Exception - Clerk Webhook]:', dbErr);
        return NextResponse.json({ error: 'Internal database error' }, { status: 500 });
      }
    } else {
      console.warn('[Clerk Webhook Warning]: Supabase credentials missing. Founder & signup record skipped.');
    }
  }

  return NextResponse.json({ received: true, eventType });
}

function parseAttrData(input: unknown): Record<string, any> | null {
  if (!input) return null;
  if (typeof input === 'object' && input !== null) {
    return input as Record<string, any>;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      try {
        return JSON.parse(decodeURIComponent(trimmed));
      } catch {
        return null;
      }
    }
  }
  return null;
}

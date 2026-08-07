import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2025-01-27.acacia' as any,
});

const ALLOWED_EVENT_TYPES = ['checkout.session.completed', 'invoice.payment_succeeded'];

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback for development / unverified testing if secret is not set
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook Signature Error]: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const eventType = event.type;

  // 1. Check event.type first
  // 2. Return 200 immediately without DB insertion if not in allowed event types
  if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
    console.log(`[Stripe Webhook Ignored] Event type '${eventType}' is not tracked.`);
    return NextResponse.json(
      { received: true, ignored: true, message: `Event type '${eventType}' ignored` },
      { status: 200 }
    );
  }

  // 3. Only proceed to extract payment details & insert into `payments` for allowed event types
  let paymentId = '';
  let amount = 0;
  let currency = 'usd';
  let status = 'succeeded';
  let customerEmail: string | null = null;

  const dataObj = event.data.object as any;

  // Code path for mapping founder_id / user_id from metadata or client_reference_id
  const rawUserId =
    dataObj?.metadata?.founder_id ||
    dataObj?.metadata?.user_id ||
    dataObj?.metadata?.clerk_user_id ||
    dataObj?.client_reference_id ||
    '';

  let founderId: string | null = null;

  if (rawUserId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Lookup in founders table by clerk_user_id
    const { data: founderByClerk } = await supabaseAdmin
      .from('founders')
      .select('id')
      .eq('clerk_user_id', rawUserId)
      .maybeSingle();

    if (founderByClerk) {
      founderId = founderByClerk.id;
    } else {
      // Lookup by founder UUID directly if valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUserId);
      if (isUuid) {
        const { data: founderById } = await supabaseAdmin
          .from('founders')
          .select('id')
          .eq('id', rawUserId)
          .maybeSingle();
        if (founderById) {
          founderId = founderById.id;
        }
      }
    }
  }

  if (eventType === 'checkout.session.completed') {
    paymentId = dataObj?.id || `stripe_checkout_${Date.now()}`;
    amount = (dataObj?.amount_total || 0) / 100;
    currency = dataObj?.currency || 'usd';
    status = dataObj?.payment_status === 'paid' ? 'succeeded' : (dataObj?.status || 'succeeded');
    customerEmail = dataObj?.customer_details?.email || dataObj?.customer_email || null;
  } else if (eventType === 'invoice.payment_succeeded') {
    paymentId = dataObj?.id || `stripe_inv_${Date.now()}`;
    amount = (dataObj?.amount_paid || 0) / 100;
    currency = dataObj?.currency || 'usd';
    status = 'paid';
    customerEmail = dataObj?.customer_email || dataObj?.billing_details?.email || null;
  }

  console.log(`[Stripe Webhook Received] Event: ${eventType}, PaymentId: ${paymentId}, Amount: ${amount} ${currency}, FounderId: ${founderId}, RawUser: ${rawUserId}`);

  if (!founderId) {
    console.error(`[Stripe Webhook Error] Founder not found in DB for raw user identifier: '${rawUserId}'`);
    return NextResponse.json(
      { error: `Founder not found for identifier '${rawUserId}'` },
      { status: 400 }
    );
  }

  // Insert or Upsert into unified Supabase `payments` table
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const minimalRawEvent = {
        provider_event_id: event.id,
        event_type: eventType,
        metadata_received: dataObj?.metadata || {},
        received_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin.from('payments').upsert(
        {
          user_id: founderId,
          provider: 'stripe',
          payment_id: paymentId,
          amount,
          currency: currency.toLowerCase(),
          status,
          customer_email: customerEmail,
          event_type: eventType,
          raw_event: minimalRawEvent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider,payment_id' }
      );

      if (error) {
        console.error('[Supabase Insert Error - Stripe]:', error);
        return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
      }
    } catch (dbErr) {
      console.error('[Supabase DB Exception - Stripe]:', dbErr);
      return NextResponse.json({ error: 'Database exception occurred' }, { status: 500 });
    }
  } else {
    console.warn('[Stripe Webhook] Supabase credentials missing. Event logged without DB insertion.');
  }

  return NextResponse.json({ received: true, provider: 'stripe', eventType, paymentId, founderId });
}


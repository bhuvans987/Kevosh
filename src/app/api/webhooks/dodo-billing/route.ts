import { NextRequest, NextResponse } from 'next/server';
import { verifyDodoSignature } from '../dodo/route';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Dedicated Webhook Handler for Founder Subscription Billing via Dodo Payments
 * (OUR founders paying US for Kevosh Pro)
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const webhookId = req.headers.get('webhook-id');
  const webhookTimestamp = req.headers.get('webhook-timestamp');
  const webhookSignature = req.headers.get('webhook-signature');
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

  if (webhookSecret) {
    const isValid = verifyDodoSignature(
      body,
      webhookId,
      webhookTimestamp,
      webhookSignature,
      webhookSecret
    );
    if (!isValid) {
      console.error('[Dodo Founder Billing Webhook]: Invalid Signature');
      return NextResponse.json({ error: 'Invalid Dodo billing signature' }, { status: 400 });
    }
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const eventType = payload.type || payload.event_type || 'subscription.active';
  const dataObj = payload.data || payload;
  const metadata = dataObj.metadata || payload.metadata || {};

  const clerkUserId = metadata.clerk_user_id;
  const founderId = metadata.founder_id;
  const customerEmail = dataObj.customer?.email || dataObj.billing?.email || null;
  const subscriptionId = dataObj.subscription_id || dataObj.id || null;

  console.log(`[Founder Billing Webhook Received] Event: ${eventType}, Founder: ${founderId || clerkUserId || customerEmail}`);

  let query = supabaseAdmin.from('founders');
  let updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (eventType.includes('succeeded') || eventType.includes('active') || eventType.includes('renewed')) {
    updateData.plan = 'paid';
    updateData.subscription_status = 'active';
    if (subscriptionId) updateData.subscription_id = subscriptionId;
  } else if (eventType.includes('cancelled') || eventType.includes('expired') || eventType.includes('failed')) {
    updateData.plan = 'free';
    updateData.subscription_status = 'cancelled';
  }

  let matched = false;

  if (clerkUserId) {
    const { error } = await query.update(updateData).eq('clerk_user_id', clerkUserId);
    if (!error) matched = true;
  }

  if (!matched && founderId) {
    const { error } = await supabaseAdmin.from('founders').update(updateData).eq('id', founderId);
    if (!error) matched = true;
  }

  if (!matched && customerEmail) {
    const { error } = await supabaseAdmin.from('founders').update(updateData).eq('email', customerEmail);
    if (!error) matched = true;
  }

  if (!matched) {
    console.warn('[Founder Billing Webhook]: Could not find founder matching metadata/email.');
  }

  return NextResponse.json({
    received: true,
    flow: 'founder_billing',
    eventType,
    matchedFounder: matched,
  });
}

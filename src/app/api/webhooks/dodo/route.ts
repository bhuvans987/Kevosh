import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Verify Dodo Payments Webhook signature (Standard Webhooks / Svix specification)
 */
export function verifyDodoSignature(
  rawBody: string,
  webhookId: string | null,
  webhookTimestamp: string | null,
  webhookSignature: string | null,
  secret: string
): boolean {
  if (!webhookId || !webhookTimestamp || !webhookSignature || !secret) {
    return false;
  }

  try {
    // 1. Timestamp validation (5 minutes / 300 seconds tolerance)
    const timestampSeconds = parseInt(webhookTimestamp, 10);
    if (isNaN(timestampSeconds)) {
      return false;
    }
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowInSeconds - timestampSeconds) > 300) {
      return false;
    }

    // 2. Construct signed content: `${webhook_id}.${webhook_timestamp}.${raw_body}`
    const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

    // 3. Extract and decode secret key bytes (strip 'whsec_' prefix if present, base64 decode remainder)
    let secretKey = secret;
    if (secretKey.startsWith('whsec_')) {
      secretKey = secretKey.slice(6);
    }
    const keyBytes = Buffer.from(secretKey, 'base64');

    // 4. Compute HMAC-SHA256 signature in base64
    const computedSignature = crypto
      .createHmac('sha256', keyBytes)
      .update(signedContent, 'utf-8')
      .digest('base64');

    const computedBuffer = Buffer.from(computedSignature, 'base64');

    // 5. Compare with signatures in webhook-signature header (space-delimited, "v1,<base64signature>")
    const signatures = webhookSignature.trim().split(/\s+/);
    for (const sigItem of signatures) {
      const commaIndex = sigItem.indexOf(',');
      if (commaIndex === -1) continue;
      const version = sigItem.slice(0, commaIndex);
      const signatureBase64 = sigItem.slice(commaIndex + 1);

      if (version === 'v1') {
        const signatureBuffer = Buffer.from(signatureBase64, 'base64');
        if (
          signatureBuffer.byteLength === computedBuffer.byteLength &&
          crypto.timingSafeEqual(signatureBuffer, computedBuffer)
        ) {
          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error('[Dodo Signature Verification Error]:', err);
    return false;
  }
}

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
      console.error('[Dodo Webhook]: Invalid Webhook Signature');
      return NextResponse.json({ error: 'Invalid Dodo signature' }, { status: 400 });
    }
  } else {
    console.warn('[Dodo Webhook]: DODO_PAYMENTS_WEBHOOK_SECRET is not configured.');
  }

  let payload: any;
  try {
    payload = JSON.parse(body);
  } catch (err: any) {
    console.error('[Dodo Webhook JSON Parse Error]:', err);
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // Dodo event attributes (e.g., event_type or type)
  const eventType = payload.type || payload.event_type || 'payment.succeeded';
  const dataObj = payload.data || payload;

  const paymentId = dataObj.payment_id || dataObj.id || `dodo_${Date.now()}`;
  const rawUserId = dataObj.metadata?.user_id || dataObj.metadata?.clerk_user_id || payload.metadata?.user_id || '';

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

  // Dodo amounts may be in cents or base units
  let rawAmount = dataObj.total_amount ?? dataObj.amount ?? 0;
  const amount = rawAmount > 1000 ? rawAmount / 100 : rawAmount;

  const currency = dataObj.currency || 'usd';
  const status = dataObj.status || (eventType.includes('succeeded') ? 'succeeded' : 'processed');
  const customerEmail = dataObj.customer?.email || dataObj.customer_email || dataObj.billing?.email || null;

  console.log(`[Dodo Webhook Received] Event: ${eventType}, PaymentId: ${paymentId}, Amount: ${amount} ${currency}, FounderId: ${founderId}, RawUser: ${rawUserId}`);

  if (!founderId) {
    console.error(`[Dodo Webhook Error] Founder not found in DB for raw user identifier: '${rawUserId}'`);
    return NextResponse.json(
      { error: `Founder not found for identifier '${rawUserId}'` },
      { status: 400 }
    );
  }

  // Insert or Upsert into unified Supabase `payments` table
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const minimalRawEvent = {
        provider_event_id: payload.id || dataObj.payment_id || dataObj.id || null,
        event_type: eventType,
        metadata_received: dataObj.metadata || payload.metadata || {},
        received_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin.from('payments').upsert(
        {
          user_id: founderId,
          provider: 'dodo',
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
        console.error('[Supabase Insert Error - Dodo]:', error);
        return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
      }
    } catch (dbErr) {
      console.error('[Supabase DB Exception - Dodo]:', dbErr);
      return NextResponse.json({ error: 'Database exception occurred' }, { status: 500 });
    }
  } else {
    console.warn('[Dodo Webhook] Supabase credentials missing. Event logged without DB insertion.');
  }

  return NextResponse.json({ received: true, provider: 'dodo', eventType, paymentId, founderId });
}

-- Schema for Next.js SaaS Attribution Tool (Phase 1)
-- Multi-provider payment tracking (Stripe + Dodo Payments)

-- Founders table: Stores Clerk user mapping to internal app user IDs
CREATE TABLE IF NOT EXISTS public.founders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE NOT NULL,               -- Unique Clerk User ID (e.g. user_2...)
    email TEXT,                                       -- Primary email address
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast founder lookup by Clerk User ID
CREATE INDEX IF NOT EXISTS idx_founders_clerk_user_id ON public.founders(clerk_user_id);

-- RLS Policies for founders
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on founders" ON public.founders;
CREATE POLICY "Service role full access on founders" ON public.founders
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Payments table: Stores ingested payment events from Stripe & Dodo
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.founders(id) ON DELETE CASCADE, -- Reference to founders table PK
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'dodo')),
    payment_id TEXT NOT NULL,                        -- External payment ID from Stripe or Dodo
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL,                            -- e.g., 'succeeded', 'paid', 'failed', 'refunded'
    customer_email TEXT,                             -- End-customer email driven by marketing
    event_type TEXT NOT NULL,                        -- Webhook event type (e.g. payment_intent.succeeded)
    raw_event JSONB NOT NULL DEFAULT '{}'::jsonb,    -- Complete raw webhook event payload
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Prevent duplicate processing of the same payment event per provider
    CONSTRAINT unique_provider_payment UNIQUE (provider, payment_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments(provider);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- RLS Policies (Row Level Security)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for webhooks)
DROP POLICY IF EXISTS "Service role full access" ON public.payments;
CREATE POLICY "Service role full access" ON public.payments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- Signups table: Ingested signup/attribution events
CREATE TABLE IF NOT EXISTS public.signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID NOT NULL REFERENCES public.founders(id) ON DELETE CASCADE,
    end_customer_id UUID,                            -- Placeholder column for future matching target
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer_domain TEXT,
    how_heard_raw TEXT,                              -- Free text fallback answer
    source_label TEXT NOT NULL,                      -- Normalized single value
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signups_founder_id ON public.signups(founder_id);
CREATE INDEX IF NOT EXISTS idx_signups_created_at ON public.signups(created_at DESC);

-- RLS Policies
ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on signups" ON public.signups;
CREATE POLICY "Service role full access on signups" ON public.signups
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

/*
MIGRATION NOTICE FOR EXISTING DATABASES:
If your Supabase database already has `payments` table with `user_id` as TEXT:
1. Drop existing test payments or map them to valid founder UUIDs.
2. Run:
   ALTER TABLE public.payments ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
   ALTER TABLE public.payments ADD CONSTRAINT fk_payments_founder FOREIGN KEY (user_id) REFERENCES public.founders(id) ON DELETE CASCADE;
*/


I'm building a Next.js SaaS attribution tool. Tech stack (locked, don't deviate):
- Frontend/Backend: Next.js (App Router), TypeScript, Tailwind CSS
- Auth: Clerk
- Database: Supabase (Postgres)
- Payments data sources: Stripe API + webhooks AND Dodo Payments API + webhooks —
  both are read-only integrations into the CUSTOMER's own Stripe/Dodo account
  (this is not billing for my own app, it's pulling THEIR payment data so we can
  tell them which marketing channel drove revenue).
  A founder can connect Stripe, Dodo, or both simultaneously.
- Hosting: Vercel

Today we're only doing Phase 1 (Day 1 of a 5-day build):
1. Set up Next.js project scaffold
2. Integrate Clerk auth (sign up / sign in / protected dashboard route)
3. Set up Supabase project + initial database schema (schema needs to support
   multiple payment providers per founder, not just Stripe — see note below)
4. Set up Stripe webhook endpoint (/api/webhooks/stripe) that can receive events
   from a connected customer Stripe account
5. Set up Dodo Payments webhook endpoint (/api/webhooks/dodo) that can receive
   events from a connected customer Dodo account — look up Dodo's actual webhook
   event names and signature verification method from their docs
   (dodopayments.com/docs) rather than assuming it matches Stripe's shape

Do NOT build the dashboard UI, signup capture, or AI summary yet — that's later
phases. Just get the foundation solid and working end to end: a user can sign up
via Clerk, land on an empty dashboard, and the app can receive a test webhook
event from EITHER Stripe or Dodo and log it into one unified `payments` table.

Ask me clarifying questions before generating code if anything is ambiguous.
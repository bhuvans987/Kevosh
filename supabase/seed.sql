-- Manual insertion snippet for existing Clerk users in Supabase
-- Replace 'user_2abc123456789' with your actual Clerk User ID (from Clerk Dashboard -> Users -> User ID)
-- Replace 'your.email@example.com' with your actual account email address

INSERT INTO public.founders (clerk_user_id, email)
VALUES ('user_2abc123456789', 'your.email@example.com')
ON CONFLICT (clerk_user_id) DO NOTHING;

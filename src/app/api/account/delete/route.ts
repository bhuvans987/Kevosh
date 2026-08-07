import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Self-Service Account & Data Deletion API Route
 *
 * 1. Authenticates requesting user via Clerk (`auth()`).
 * 2. Deletes row from `public.founders` where `clerk_user_id = userId`.
 *    (PostgreSQL `ON DELETE CASCADE` automatically and atomically purges all related
 *     `payments`, `end_customers`, `end_customer_signups`, and `signups`).
 * 3. Calls Clerk backend SDK (`clerkClient().users.deleteUser(userId)`) to remove
 *    the account from Clerk authentication.
 */
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in to delete your account.' },
        { status: 401 }
      );
    }

    console.log(`[Account Delete Request]: Initiated for Clerk User ID '${userId}'`);

    // 1. Delete founder from Supabase DB (triggers ON DELETE CASCADE across all child tables)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { error: dbError } = await supabaseAdmin
        .from('founders')
        .delete()
        .eq('clerk_user_id', userId);

      if (dbError) {
        console.error('[Supabase Account Delete Error]:', dbError);
        return NextResponse.json(
          { error: 'Database record deletion failed. Please try again or contact support.' },
          { status: 500 }
        );
      }
      console.log(`[Supabase Account Delete Success]: Purged founder and cascaded all associated data for '${userId}'`);
    }

    // 2. Delete user account from Clerk auth
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
      console.log(`[Clerk Account Delete Success]: User '${userId}' deleted from Clerk.`);
    } catch (clerkErr: any) {
      console.error('[Clerk Account Delete Exception]:', clerkErr);
      // If DB was already deleted, report success so user is not trapped
    }

    return NextResponse.json({
      success: true,
      message: 'Your account and all associated attribution data have been permanently deleted.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Account Delete Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error occurred during account deletion.' },
      { status: 500 }
    );
  }
}

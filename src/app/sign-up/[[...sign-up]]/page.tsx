'use client';

import { useEffect, useRef } from 'react';
import { SignUp, useSignUp, useAuth } from '@clerk/nextjs';
import { getStoredAttribution } from '@/lib/attribution';

function SignUpWithAttribution() {
  const { isLoaded } = useAuth();
  const { signUp } = useSignUp();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !signUp || hasSyncedRef.current) return;

    const attrData = getStoredAttribution();
    if (attrData && Object.keys(attrData).length > 0) {
      hasSyncedRef.current = true;
      signUp
        .update({
          unsafeMetadata: attrData as any,
        })
        .catch((err: any) => {
          console.error('[Attribution] Failed to sync unsafeMetadata to Clerk signUp object:', err);
          hasSyncedRef.current = false;
        });
    }
  }, [isLoaded, signUp]);

  return <SignUp />;
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] text-[#f4f4f5] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-attio-grid opacity-50 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md flex justify-center">
        <SignUpWithAttribution />
      </div>
    </main>
  );
}



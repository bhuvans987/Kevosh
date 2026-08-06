import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] text-[#f4f4f5] p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-attio-grid opacity-50 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md flex justify-center">
        <SignIn />
      </div>
    </main>
  );
}


import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { AttributionTracker } from '@/components/AttributionTracker';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Attributely — Multi-Channel Revenue Attribution for Stripe & Dodo Payments',
  description: 'The revenue attribution engine for modern SaaS founders. Connect Stripe and Dodo Payments in seconds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark h-full`}>
        <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
          <AttributionTracker />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}


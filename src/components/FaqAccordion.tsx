'use client';

import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: 'How does Kevosh track visitor traffic without cookies?',
    answer: 'Kevosh captures first-party referral headers, UTM parameters, and optional how-heard survey inputs during signup. When a user creates an account, their attribution source label is stored securely on your backend and matched via webhook when Stripe or Dodo Payments fires a successful payment event.',
  },
  {
    question: 'Why Stripe & Dodo Payments webhook integration?',
    answer: 'Most analytics tools only track pageviews or clicks, not actual dollars deposited into your bank account. By ingesting webhook payment events directly from Stripe and Dodo Payments, Kevosh ensures 100% server-verified revenue attribution.',
  },
  {
    question: 'How is my payment data kept private and secure?',
    answer: 'Kevosh never sells, rents, or shares your data. We strip sensitive billing details (card info, physical addresses, IPs) before saving webhooks, automatically purge raw event blobs after 30 days, and provide 1-click full account & data deletion at any time.',
  },
  {
    question: 'How easy is it to set up for solo founders?',
    answer: 'It takes less than 2 minutes. Add our single API endpoint or lightweight JS snippet to your signup handler, paste your webhook secret in the environment variables, and revenue attribution begins automatically.',
  },
  {
    question: 'Can I upgrade or cancel my plan anytime?',
    answer: 'Yes! You can start on our generous Free tier with 30-day analytics history. Upgrade to Pro ($20/mo) at any time to unlock unlimited history, dual payment integrations, and AI weekly summaries.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3 text-left">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="attio-card rounded-xl overflow-hidden transition-all duration-200"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-semibold text-zinc-900 text-sm hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <span>{faq.question}</span>
              <span
                className={`w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center text-xs shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 bg-zinc-900 text-white border-zinc-800' : ''
                }`}
              >
                ↓
              </span>
            </button>
            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

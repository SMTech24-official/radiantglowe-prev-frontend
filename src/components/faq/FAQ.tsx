/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetCmsQuery } from '@/redux/api/cmsApi';
import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string | string[];
}

const defaultFaqData: FAQItem[] = [
  {
    question: 'How does simpleroomsng.com ensure no agents are involved in listings?',
    answer:
      'We have a strict no-agent policy. Every landlord or property owner is verified directly through our secure onboarding process. If we detect any agent posing as a landlord while violating our strict policy, their account is immediately suspended.',
  },
  {
    question: 'Are there any hidden fees or commissions?',
    answer:
      'Absolutely none! simpleroomsng operates on a zero-commission model—you deal directly with landlords, so there are no middlemen fees, no agent commissions, and no surprises.',
  },
  {
    question: 'What happens if someone demands an "agent fee" or "registration fee"?',
    answer:
      'This is against our policy. Report them immediately via our 24/7 CHAT LIVE, and we will take action, including delisting fraudulent properties and blocking violators.',
  },
  {
    question: 'How do I verify that a landlord is legitimate?',
    answer:
      'We conduct ID verification, property documentation checks, and phone authentication for all landlords. You can also check our "Verified Landlord" badge on listings for added trust.',
  },
  {
    question: 'Can I negotiate rent directly with the landlord?',
    answer:
      'Yes! Since there are no agents, you can discuss pricing, terms, and conditions directly with the property owner—no middlemen inflating costs.',
  },
  {
    question: 'What if a landlord refuses to deal without an agent?',
    answer:
      'Simpleroomsng does not allow such practices. If a landlord insists on using an agent while asking for commission fee, please flag the listing, and we will investigate promptly.',
  },
  {
    question: 'How do I schedule a property viewing?',
    answer:
      'Contact the landlord directly through our secure messaging system. All communication stays within on our platform for safety and transparency.',
  },
  {
    question: 'Is my payment handled securely when renting through simpleroomsng?',
    answer:
      'Yes, your payment is secure if the landlord uses our Rent Agreement Service. In other cases, you should only pay the landlord after signing a lease agreement. For added security, we recommend using bank transfers or legally documented payment methods.',
  },
  {
    question: 'What if a landlord asks for an upfront payment before viewing?',
    answer:
      'Never pay before inspection! This is a red flag. Report such requests to us immediately, and we will take action.'
  },
  {
    question: 'How does simpleroomsng handle fraudulent listings?',
    answer:
      'We use AI monitoring + manual reviews to detect scams. Users can also report suspicious listings, and our team responds within 24 hours to remove violators.',
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  // Fetch CMS data using the RTK Query hook
  const { data: cmsData, isSuccess } = useGetCmsQuery("faq");

  // Use API data if available, otherwise fallback to default data
  const faqData = isSuccess && cmsData?.data?.content?.faqs
    ? cmsData.data.content.faqs
    : defaultFaqData;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="py-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-8">Frequently Asked Questions (FAQs)</h1>
        <p className="text-lg">
          Got questions about <span className="font-semibold">simpleroomsng.com</span>? Find answers to common queries below to understand how we make renting simple, secure, and agent-free.
        </p>
      </div>

      <div className="space-y-4">
        {faqData.map((faq:any, index:number) => (
          <div key={index}>
            <button
              className="cursor-pointer w-full text-left py-4 flex justify-between items-center"
              onClick={() => toggleFAQ(index)}
            >
              <h2 className="text-lg font-semibold text-gray-800 w-2/3 md:w-auto">{faq.question}</h2>
              <svg
                className={`w-6 h-6 text-gray-600 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="py-4 bg-white text-gray-600">
                {Array.isArray(faq.answer) ? (
                  <ul className="list-disc pl-6 space-y-2">
                    {faq.answer.map((item:any, i:number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{faq.answer}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
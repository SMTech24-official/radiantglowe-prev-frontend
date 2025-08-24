"use client";

import { useGetCmsQuery } from "@/redux/api/cmsApi";
import React from "react";
import DOMPurify from 'dompurify';
import '../../style/terms.css';
import { addTailwindClasses } from "@/utils/addTailwindClasses";
// import { addTailwindClasses } from "@/utils/addTailwindClasses";

const PrivacyPolicy: React.FC = () => {
  // Fetch CMS data using the RTK Query hook
  const { data: cmsData, isSuccess } = useGetCmsQuery("privacyPolicy");

  // Default hardcoded data (used initially or if API fails)
  const defaultContent = {
    title: "Privacy Policy",
    content: `
      <p class="text-lg">
        Welcome to <span class="font-semibold">simplerooms.ng</span> (&apos;we,&apos; &apos;us,&apos; &apos;our&apos;). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our website and services.
      </p>
      <p class="mt-2">
        By accessing or using simplerooms.ng, you agree to the terms of this Privacy Policy. If you do not agree, please do not use our services.
      </p>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">1.1 Personal Information</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Address (for property listings or rentals)</li>
          <li>Government-issued ID (for verification, if required)</li>
          <li>Payment details (processed securely via third-party payment gateways)</li>
        </ul>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">1.2 Non-Personal Information</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Browser type and version</li>
          <li>IP address</li>
          <li>Device information (e.g., operating system, device model)</li>
          <li>Cookies and tracking data (see Section 4: Cookies & Tracking Technologies)</li>
        </ul>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">1.3 Property-Related Information</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Property details (for landlords/agents listing properties)</li>
          <li>Rental history (for tenants)</li>
          <li>Transaction records</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
        <p>We use your data for the following purposes:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>To provide and improve our rental services</li>
          <li>To verify user identity and prevent fraud</li>
          <li>To process payments and rental agreements</li>
          <li>To communicate with you (e.g., confirmations, updates, customer support)</li>
          <li>To send promotional offers (only with your consent)</li>
          <li>To analyse website traffic and user behaviour for improvements</li>
          <li>To comply with legal and regulatory requirements</li>
        </ul>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">3. How We Share Your Information</h2>
        <p>We may share your information with:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Landlords/Agents: If you are a tenant, necessary details may be shared to facilitate rentals.</li>
          <li>Payment Processors: For secure transactions (we do not store full payment details).</li>
          <li>Service Providers: Third-party vendors assisting with hosting, analytics, and marketing.</li>
          <li>Legal Authorities: If required by law or to protect our rights and safety.</li>
        </ul>
        <p class="mt-4 font-semibold text-gray-800">We do NOT sell your personal information to third parties.</p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">4. Cookies & Tracking Technologies</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Enhance user experience</li>
          <li>Remember preferences</li>
          <li>Analyse site traffic</li>
          <li>Deliver targeted ads (with consent)</li>
        </ul>
        <p class="mt-4">You can disable cookies via your browser settings, but some features may not function properly.</p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
        <p>We implement industry-standard security measures, including:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Encryption (SSL/TLS) for data transmission</li>
          <li>Secure servers and access controls</li>
          <li>Regular security audits</li>
        </ul>
        <p class="mt-4">However, no online platform is 100% secure. You are responsible for keeping your login credentials confidential.</p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights & Choices</h2>
        <p>You have the right to:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>Access, correct, or delete your personal data</li>
          <li>Opt out of marketing communications</li>
          <li>Withdraw consent (where applicable)</li>
          <li>Request data portability</li>
        </ul>
        <p class="mt-4">
          To exercise these rights, contact us at
          <a href="mailto:info@simplerooms.ng" class="text-blue-600 hover:underline">
            info@simplerooms.ng
          </a>.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">7. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party sites. We are not responsible for their privacy practices. Please review their policies before sharing data.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">8. Children’s Privacy</h2>
        <p>Our services are not intended for users under 18. We do not knowingly collect data from minors.</p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. The revised version will be posted on our website. Continued use of our services constitutes acceptance of changes.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
        <p>For questions or concerns regarding this Privacy Policy, contact us at:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            Email:
            <a href="mailto:info@simplerooms.ng" class="text-blue-600 hover:underline">
              info@simplerooms.ng
            </a>
          </li>
          <li>Phone: +234 (0)</li>
          <li>Address: 2972 Westheimer Rd. Santa Ana, Illinois 85486</li>
        </ul>
      </section>
      <section class="mb-8">
        <p class="font-semibold text-gray-800">Thank you for trusting simplerooms.ng with your rental needs!</p>
        <p class="mt-2">
          This Privacy Policy is compliant with the Nigeria Data Protection Regulation (NDPR) and global best practices.
        </p>
      </section>
    `,
  };

  // Use API data if available, otherwise fallback to default data
  const contentData = isSuccess && cmsData?.data?.content
    ? cmsData.data.content
    : defaultContent;

    const cleanHtml = DOMPurify.sanitize(contentData.content.replace(/\\"/g, '"'), {
        ADD_ATTR: ['class'],
      });

  return (
    <div className="terms-content max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {contentData.title}
        </h1>
        <div dangerouslySetInnerHTML={{ __html: addTailwindClasses(cleanHtml)}} />
      </div>
    </div>
  );
};

export default PrivacyPolicy;
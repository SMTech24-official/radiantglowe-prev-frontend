"use client";

import { useGetCmsQuery } from "@/redux/api/cmsApi";
import React from "react";
import DOMPurify from 'dompurify';
import '../../style/terms.css';
import { addTailwindClasses } from "@/utils/addTailwindClasses";

export const TermsAndConditions: React.FC = () => {
  // Fetch CMS data using the RTK Query hook
  const { data: cmsData, isSuccess } = useGetCmsQuery("termsAndConditions");

  // Default hardcoded data (used initially or if API fails)
  const defaultContent = {
    title: "Terms and Conditions",
    content: `
      <p class="text-lg">
        Welcome to <span class="font-semibold">simplerooms.ng</span>, a
        subsidiary of Biodeb Group. By accessing or using our website, you
        agree to comply with and be legally bound by these Terms and
        Conditions. If you do not agree, you must discontinue use immediately.
      </p>
      <p class="mt-2 font-semibold">
        simplerooms.NG IS A NO-COMMISSION FEES WEBSITE
      </p>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          1. Acceptance of Terms
        </h2>
        <p class="text-gray-600">
          By accessing or using simplerooms.ng (the &apos;Website&apos;), a
          subsidiary of Biodeb Group (&apos;we,&apos; &apos;us,&apos; or
          &apos;our&apos;), you agree to comply with and be legally bound by
          these Terms and Conditions (&apos;Terms&apos;). If you do not agree,
          you must discontinue use immediately.
        </p>
      </section>
      <section class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          2. Definitions
        </h2>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">
          2.1 User
        </h3>
        <p class="text-gray-600">
          Refers to any individual, organisation, or legal entity that accesses,
          browses, or interacts with the Website in any capacity, whether for
          property rental purposes, general information, or other services
          offered by simplerooms.ng.
        </p>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">
          2.2 Landlord
        </h3>
        <p class="text-gray-600">
          Denotes a User who registers on the Website to advertise, list, or
          offer a residential or commercial property for rent, lease, or
          sublease, and who engages with potential tenants through the
          platform’s services.
        </p>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">
          2.3 Tenant
        </h3>
        <p class="text-gray-600">
          Signifies a User who utilises the Website to search for, inquire
          about, or express interest in renting or leasing a property listed by
          a Landlord, with the intent of entering into a Lease Agreement.
        </p>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">
          2.4 Service
        </h3>
        <p class="text-gray-600">
          Encompasses all functionalities provided by simplerooms.ng, including
          but not limited to property listings, rental advertisements,
          tenant-landlord communication tools, payment processing, lease
          management, and any other features designed to facilitate property
          rentals and related transactions.
        </p>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">
          2.5 Content
        </h3>
        <p class="text-gray-600">
          Includes any form of information, media, or data uploaded, submitted,
          or displayed on the Website, such as property descriptions,
          photographs, videos, reviews, user profiles, and other materials
          shared by Users or the platform itself.
        </p>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">
          2.6 Lease Agreement
        </h3>
        <p class="text-gray-600">
          Refers to the formal, legally binding contract executed between a
          Landlord and a Tenant, outlining the terms and conditions of the
          rental arrangement, including rent amount, duration, obligations, and
          other clauses in compliance with applicable laws.
        </p>
        <h3 class="text-xl font-medium text-gray-700 mt-6 mb-2">
          2.7 NDPR
        </h3>
        <p class="text-gray-600">
          Nigeria Data Protection Regulation 2019 represents the regulatory
          framework governing the collection, processing, storage, and
          protection of personal data in Nigeria, with which simplerooms.ng
          complies to ensure user privacy and data security.
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
    <div className="terms-content max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="py-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
          {contentData.title}
        </h1>
      <div dangerouslySetInnerHTML={{ __html: addTailwindClasses(cleanHtml) }} />
      </div>

      {/* <h1 className="text-center text-2xl font-bold mb-8">
        If you want to see or read the full terms and conditions of this website you can download it as pdf.
      </h1>

      <a
        href="/pdf/terms-and-conditions.pdf"
        download
        className="block w-full text-center bg-primary hover:bg-primary/80 text-white font-semibold py-3 px-6 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
      >
        Download our full terms & conditions PDF
      </a> */}
    </div>
  );
};

export default TermsAndConditions;
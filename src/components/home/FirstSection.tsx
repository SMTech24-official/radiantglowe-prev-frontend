/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import landlord from "@/assets/home/Landlord.png";
import tenants from "@/assets/home/Tenants.png";
import ContentSection from "./ContentSection";
import { useGetCmsQuery } from "@/redux/api/cmsApi";

// Define the shape of the content data
interface ContentData {
  title: string;
  description: string;
  listDescription: string[];
  button: {
    text: string;
    link: string;
  };
  image: any; 
  sectionLabel: string;
}

const FirstSection = () => {
  const { data: cmsData, isSuccess } = useGetCmsQuery("home");

  // Default data for landlords and tenants
  const defaultLandlordData: ContentData = {
    title: "Advertise Your Rental Property with Ease",
    description:
      "At SimpleRooms, we help you connect with reliable tenants and streamline the process with support in referencing, contracts, and more, if needed. We offer you a hassle-free experience while keeping you in full control of your rental property.",
    listDescription: [
      "100% Free Advertising Option",
      "No Hidden Charges",
      "No Renewal Fees",
      "Get Started Without a Credit Card",
    ],
    button: {
      text: "Add Properties",
      link: "/add-properties",
    },
    image: landlord,
    sectionLabel: "For Landlords",
  };

  const defaultTenantData: ContentData = {
    title: "Find Your Ideal Home with Confidence",
    description:
      "At SimpleRooms, we make renting easy and transparent. There are no admin fees ever, and we ensure all listings are real and up-to-date. We take down listings as soon as they are rented, so you won't waste time on outdated adverts. Plus, your rent and deposit are always protected.",
    listDescription: [
      "No Admin Fees",
      "No Outdated Listings",
      "Rent & Deposit Protected",
      "The Safer, Faster, and More Affordable Way to Rent",
    ],
    button: {
      text: "Search Properties",
      link: "/properties",
    },
    image: tenants,
    sectionLabel: "For Tenants",
  };

  // Process CMS data for landlords and tenants
  const landlordCmsData = isSuccess
    ? cmsData?.data?.content[0]
    : null;
  const tenantCmsData = isSuccess
    ? cmsData?.data?.content[1]
    : null;

  // Use CMS data if available, otherwise fallback to default data
  const landlordContent: ContentData = landlordCmsData
    ? {
        title: landlordCmsData.title,
        description: landlordCmsData.description,
        listDescription: landlordCmsData.listDescription,
        button: landlordCmsData.button,
        image: landlordCmsData.image || landlord, 
        sectionLabel: landlordCmsData.tag || "For Landlords",
      }
    : defaultLandlordData;

  const tenantContent: ContentData = tenantCmsData
    ? {
        title: tenantCmsData.title,
        description: tenantCmsData.description,
        listDescription: tenantCmsData.listDescription,
        button: tenantCmsData.button,
        image: tenantCmsData.image || tenants, 
        sectionLabel: tenantCmsData.tag || "For Tenants",
      }
    : defaultTenantData;

  return (
    <div>
      <ContentSection content={landlordContent} isImageLeft={true} />
      <ContentSection content={tenantContent} isImageLeft={false} />
    </div>
  );
};

export default FirstSection;
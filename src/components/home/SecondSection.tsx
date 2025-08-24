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
  image: any; // Ideally use StaticImageData for local images or string for URLs
  sectionLabel: string;
}

const SecondSection = () => {
  const { data: cmsData, isSuccess } = useGetCmsQuery("home");

  // Default data array for landlords and tenants
  const defaultData: ContentData[] = [
    {
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
        link: "/add-propertiestt",
      },
      image: landlord,
      sectionLabel: "For Landlords",
    },
    {
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
    },
  ];

  // Filter CMS data to include items from index 2 onward, excluding "testimonials" tags
  const filteredCmsData = isSuccess
    ? cmsData?.data?.content
        ?.slice(2, cmsData?.data?.content?.length)
        .filter(
          (item: any) =>
            !item.tag.toLowerCase().includes("testimonials") &&
            !item.tag.toLowerCase().includes("testimonial")
        )
    : [];

  // Use CMS data if available and non-empty, otherwise fallback to default data
  const contentData: ContentData[] = filteredCmsData.length > 0
    ? filteredCmsData.map((item: any, index: number) => ({
        title: item.title,
        description: item.description,
        listDescription: item.listDescription,
        button: item.button,
        image: item.image || (index === 0 ? landlord : tenants), // Fallback to local images
        sectionLabel: item.tag === "forLandlords" ? "For Landlords" : item.tag === "forTenants" ? "For Tenants" : item.tag,
      }))
    : defaultData;

  return (
    <div>
      {contentData.map((content, index) => (
        <ContentSection
          key={content.title}
          content={content}
          isImageLeft={index % 2 === 0} // Alternate image position
        />
      ))}
    </div>
  );
};

export default SecondSection;
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import ourMission from "@/assets/aboutUs/OurMission.png";
import ourVision from "@/assets/aboutUs/OurVission.png";
import whoWeAreImage from "@/assets/aboutUs/whoWeAre.svg";
import { useGetCmsQuery } from "@/redux/api/cmsApi";
import ContentSection from "../home/ContentSection";

// Import the ContentData type from ContentSection to ensure type consistency

const AboutUsSections = () => {
  const { data: cmsData, isSuccess } = useGetCmsQuery("aboutUs");

  // Default data array for About Us sections
  const defaultData = [
    {
      title: "Passionate Experts in Property Rentals",
      description:
        "We are a passionate team dedicated to transforming the property rental experience. With years of experience in the industry, we understand the challenges faced by both tenants and landlords. Our platform was built to bridge the gap between landlords and tenants by offering a streamlined and hassle-free experience.",
      listDescription: [],
      button: {
        text: "",
        link: "",
      },
      image: whoWeAreImage,
      sectionLabel: "Who We Are",
    },
    {
      title: "Simplifying the Rental Experience for Everyone",
      description:
        "Our mission is to simplify the rental experience for everyone. Whether you're a tenant searching for your dream home or a landlord looking to find reliable tenants, we are here to connect you with the right opportunities. We aim to provide transparent, trustworthy, and efficient solutions for all your rental needs.",
      listDescription: [],
      button: {
        text: "",
        link: "",
      },
      image: ourMission,
      sectionLabel: "Our Mission",
    },
    {
      title: "Revolutionizing the Future of Property Rentals",
      description:
        "We aim to be the leading online platform for property rentals, providing a space where landlords and tenants can connect, communicate, and manage their rental experiences easily and efficiently. We envision a future where the property rental process is simple, accessible, and transparent for everyone.",
      listDescription: [],
      button: {
        text: "",
        link: "",
      },
      image: ourVision,
      sectionLabel: "Our Vision",
    }
  ];

  // Use CMS data if available, otherwise fallback to default data
  const contentData = isSuccess && cmsData?.data?.content?.length > 0
    ? cmsData.data.content.map((item: any, index: number) => ({
        title: item.title,
        description: item.description,
        listDescription: item.listDescription || [],
        button: item.button || { text: "", link: "" },
        image: item.image || defaultData[index]?.image || whoWeAreImage,
        sectionLabel: item.tag || defaultData[index]?.sectionLabel || "About Us",
      }))
    : defaultData;

  return (
    <div>
      {contentData?.map((content:any, index:number) => (
        <ContentSection
          key={content.title}
          content={content}
          isImageLeft={index % 2 !== 0}
        />
      ))}
    </div>
  );
};

export default AboutUsSections;
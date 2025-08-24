"use client";

import Image from "next/image";
import { BiHomeAlt2 } from "react-icons/bi";
import { motion } from "framer-motion";
import ourMission from "@/assets/aboutUs/OurMission.png";
import { useGetCmsQuery } from "@/redux/api/cmsApi";


export default function OurMissionSection() {
  // Fetch CMS data using the RTK Query hook
  const { data: cmsData, isSuccess } = useGetCmsQuery("aboutUs");

  // Default hardcoded data (used initially or if API fails)
  const defaultData = {
    title: "Simplifying the Rental Experience for Everyone",
    description:
      "Our mission is to simplify the rental experience for everyone. Whether you're a tenant searching for your dream home or a landlord looking to find reliable tenants, we are here to connect you with the right opportunities. We aim to provide transparent, trustworthy, and efficient solutions for all your rental needs.",
    listDescription: [],
  };

  // Use API data if available, otherwise fallback to default data
  const content = isSuccess && cmsData?.data?.content?.ourMission
    ? cmsData.data.content.ourMission
    : defaultData;

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image Column */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={ourMission.src}
                alt="Modern living room interior with plants and furniture"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            className="order-1 lg:order-2 text-primary"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Small Label */}
            <div className="flex items-center mb-4 gap-2">
              <BiHomeAlt2 />
              <span className="text-sm font-medium">Our Mission</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-xl xl:text-3xl 2xl:text-4xl text-gray-900 mb-6 leading-tight">
              {content.title}
            </h2>

            {/* Description */}
            <p className="text-base lg:text-sm xl:text-base 2xl:text-lg text-gray-600 mb-8 leading-relaxed">
              {content.description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
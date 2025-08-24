/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { BiHomeAlt2 } from "react-icons/bi";
import { motion } from "framer-motion";
import ourVision from "@/assets/aboutUs/OurVission.png";
import { useGetCmsQuery } from "@/redux/api/cmsApi";

export default function OurVisionSection() {
  // Fetch CMS data using the RTK Query hook
  const { data: cmsData, isSuccess } = useGetCmsQuery("aboutUs");

  // Default hardcoded data (used initially or if API fails)
  const defaultData = {
    title: "Revolutionizing the Future of Property Rentals",
    description:
      "We aim to be the leading online platform for property rentals, providing a space where landlords and tenants can connect, communicate, and manage their rental experiences easily and efficiently. We envision a future where the property rental process is simple, accessible, and transparent for everyone.",
    listDescription: [],
  };

  // Use API data if available, otherwise fallback to default data
  const content = isSuccess && cmsData?.data?.content?.ourVision
    ? cmsData.data.content.ourVision
    : defaultData;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content Column */}
          <motion.div
            className="order-1 text-primary"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Small Label */}
            <div className="flex items-center mb-4 gap-2">
              <BiHomeAlt2 />
              <span className="text-sm font-medium">Our Vision</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-xl xl:text-3xl 2xl:text-4xl text-gray-900 mb-6 leading-tight">
              {content.title}
            </h2>

            {/* Description */}
            <p className="text-base lg:text-sm xl:text-base 2xl:text-lg text-gray-600 mb-8 leading-relaxed">
              {content.description}
            </p>

            {/* Benefits List (only render if listDescription exists and is not empty) */}
            {content.listDescription?.length > 0 && (
              <ul className="mb-8 space-y-3">
                {content.listDescription.map((benefit:any, index:number) => (
                  <motion.li
                    key={benefit}
                    className="flex items-start"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-2 h-2 bg-gray-700 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium text-sm lg:text-sm xl:text-base 2xl:text-lg">
                      {benefit}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Image Column */}
          <motion.div
            className="order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={ourVision}
                alt="Modern living room interior with plants and furniture"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { BiHomeAlt2 } from "react-icons/bi";
import { motion } from "framer-motion";
import tenants from "@/assets/home/Tenants.png";
import { useRouter } from "next/navigation";
import { useGetCmsQuery } from "@/redux/api/cmsApi";

export default function TenantsSection() {
  const router = useRouter();

  // Fetch CMS data using the RTK Query hook
  const { data: cmsData, isSuccess } = useGetCmsQuery("home");

  // Default hardcoded data (used initially or if API fails)
  const defaultData = {
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
  };

  // Use API data if available, otherwise fallback to default data
  const content = isSuccess && cmsData?.data?.content?.forTenants
    ? cmsData.data.content.forTenants
    : defaultData;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Content Column */}
          <motion.div
            className="order-1 text-primary"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Small Label */}
            <div className="flex items-center mb-3 gap-2">
              <BiHomeAlt2 className="lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-xs font-medium">For Tenants</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-xl xl:text-3xl 2xl:text-4xl text-gray-900 mb-4 leading-tight">
              {content.title}
            </h2>

            {/* Description */}
            <p className="text-base lg:text-sm xl:text-base 2xl:text-lg text-gray-600 mb-6 leading-relaxed">
              {content.description}
            </p>

            {/* Benefits List */}
            <ul className="mb-6">
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
                  <span className="text-gray-700 font-medium text-sm lg:text-sm xl:text-sm 2xl:text-lg">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.button
              className="cursor-pointer bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg font-semibold 2xl:text-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(content.button.link)}
            >
              {content.button.text}
            </motion.button>
          </motion.div>

          {/* Image Column */}
          <motion.div
            className="order-2"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg lg:scale-90">
              <Image
                src={tenants}
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
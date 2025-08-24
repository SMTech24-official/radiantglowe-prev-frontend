"use client";

import Image from "next/image";
import { BiHomeAlt2 } from "react-icons/bi";
import { motion } from "framer-motion";
// import img1 from "@/assets/aboutUs/Image_1.png";
// import img2 from "@/assets/aboutUs/Image_2.png";
// import img3 from "@/assets/aboutUs/Image_3.png";
import whoWeAreImage from "@/assets/aboutUs/whoWeAre.svg";
import { useGetCmsQuery } from "@/redux/api/cmsApi";

export default function WhoWeAreSection() {
  // Fetch CMS data using the RTK Query hook
  const { data: cmsData, isSuccess } = useGetCmsQuery("aboutUs");

  // Default hardcoded data (used initially or if API fails)
  const defaultData = {
    title: "Passionate Experts in Property Rentals",
    description:
      "We are a passionate team dedicated to transforming the property rental experience. With years of experience in the industry, we understand the challenges faced by both tenants and landlords. Our platform was built to bridge the gap between landlords and tenants by offering a streamlined and hassle-free experience.",
    listDescription: [],
    image:whoWeAreImage,
  };

  // Use API data if available, otherwise fallback to default data
  const content = isSuccess && cmsData?.data?.content?.whoWeAre
    ? cmsData.data.content.whoWeAre
    : defaultData;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center lg:h-[550px]">
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
              <span className="text-sm font-medium">Who We Are</span>
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
                src={content.image ==='' ? whoWeAreImage : content.image}
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
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import banner from "@/assets/home/Banner.png";
import { motion, Variants } from "framer-motion";
import PropertySearchForm from "./PropertySearchForm";


export default function PropertyBanner( {setAddress, setPriceRange, setPropertyType, setAvailability} : any) {
  // Define variants with explicit types
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative h-screen lg:h-[800px] xl:h-[950px]">
        {/* Background Image */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={banner}
            alt="Modern house property"
            fill
            className="object-cover"
            priority
            quality={100}
            sizes="100vw"
          />
        </motion.div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 flex items-center justify-center h-full px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center mx-auto">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-5xl font-bold text-white mb-4 leading-tight"
              variants={itemVariants}
            >
              Have a Property to Feature?
            </motion.h1>
            <motion.p
              className="text-xl text-white mb-16 opacity-90 tracking-wider"
              variants={itemVariants}
            >
              Explore Top Properties for Rent
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="w-full mx-auto mb-8"
              variants={itemVariants}
            >
              <PropertySearchForm setAddress={setAddress} setPriceRange={setPriceRange} setPropertyType={setPropertyType} setAvailability={setAvailability} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

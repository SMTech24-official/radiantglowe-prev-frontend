"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Hero from "@/assets/shared/banner/Hero.png";

interface BreadcrumbProps {
  title: string;
  shortDescription: string;
}

export default function Breadcrumb({ title, shortDescription }: BreadcrumbProps) {
  return (
    <section className="relative h-80 sm:h-80 lg:h-96 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={Hero}
          alt="Banner Image"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Animated Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="pt-10 md:pt-0 text-center px-4 sm:px-6 lg:px-8 container mx-auto">
          {/* Main Title */}
          <motion.h1
            className="lg:text-4xl 2xl:text-5xl text-3xl font-bold text-white mb-4 leading-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {title}
          </motion.h1>

          {/* Short Description */}
          <motion.p
            className="2xl:text-xl text-lg text-white opacity-90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {shortDescription}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

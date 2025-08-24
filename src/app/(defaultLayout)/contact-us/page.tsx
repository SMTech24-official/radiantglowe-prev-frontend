"use client";

import ContactForm from "@/components/contactUs/ContactForm";
import ContactInformation from "@/components/contactUs/ContactInformation";
import Breadcrumb from "@/components/shared/Breadcrumb";
import React from "react";

import { motion } from "framer-motion";

export default function ContactUsPage() {
  return (
    <div>
      <Breadcrumb
        title="Contact Us"
        shortDescription="Your guide to resolving any issues and getting the most out of our platform. We're here to assist you at every step!"
      />
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 lg:py-28 py-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12"
          initial="hidden"
          whileInView="visible"
          transition={{ staggerChildren: 0.2 }}
          viewport={{ once: true }}
        >
          {/* Contact Information - Left Column */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ContactInformation />
          </motion.div>

          {/* Contact Form - Right Column */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ContactForm />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

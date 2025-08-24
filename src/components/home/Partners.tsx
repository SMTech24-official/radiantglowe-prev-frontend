"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import partnerOne from "@/assets/home/partners/partner1.png";
import partnerTwo from "@/assets/home/partners/partner2.png";
import partnerThree from "@/assets/home/partners/partner3.png";
import partnerFour from "@/assets/home/partners/partner4.png";
import partnerFive from "@/assets/home/partners/partner5.png";
import partnerSix from "@/assets/home/partners/partner6.png";
import partnerSeven from "@/assets/home/partners/partner7.png";

const Partners = () => {
  const allPartners = [
    partnerOne,
    partnerTwo,
    partnerThree,
    partnerFour,
    partnerFive,
    partnerSix,
    partnerSeven,
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto">
        {/* Heading */}
        <motion.h2
          className="text-2xl lg:text-3xl font-semibold text-primary pb-3 mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          As Featured By
        </motion.h2>

        {/* Partner Logos */}
        <div className="flex gap-6 flex-wrap justify-between items-center">
          {allPartners?.length > 0 ? (
            allPartners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Image
                  src={partner}
                  alt={`Partner ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10 col-span-full">
              No partners available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Partners;

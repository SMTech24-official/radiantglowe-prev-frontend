/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { BiHomeAlt2 } from "react-icons/bi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Define the shape of the content data
interface ContentData {
  title: string;
  description: string;
  listDescription: string[];
  button: {
    text: string;
    link: string;
  };
  image: any;
  sectionLabel: string;
}

// Props for the reusable component
interface ContentSectionProps {
  content: ContentData;
  isImageLeft?: boolean; 
}

export default function ContentSection({ content, isImageLeft = true }: ContentSectionProps) {
  const router = useRouter();

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Image Column */}
          <motion.div
            className={`order-2 ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}
            initial={{ opacity: 0, x: isImageLeft ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg lg:scale-90">
              <Image
                src={content.image}
                alt="Property Picture"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={true}
              />
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            className={`order-1 ${isImageLeft ? "lg:order-2" : "lg:order-1"} text-primary`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Small Label */}
            <div className="flex items-center mb-3 gap-2">
              <BiHomeAlt2 className="lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-xs font-medium">{content.sectionLabel}</span>
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
            <ul className="mb-6 space-y-1">
              {content.listDescription.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  className="flex items-start"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-2 h-2 bg-gray-700 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium text-sm lg:text-sm xl:text-sm 2xl:text-base">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </ul>

            {/* CTA Button */}
            {
              content.button.text && (
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
              )
            }
          </motion.div>
        </div>
      </div>
    </section>
  );
}
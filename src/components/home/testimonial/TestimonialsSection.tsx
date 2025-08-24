/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import CustomerProfile from "./CustomerProfile";
import ReviewContent from "./ReviewContent";
import customerReview from "@/assets/home/CustomerReview.png";
import { BiHomeAlt2 } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import {useGetHomePageReviewQuery } from "@/redux/api/propertyReviewApi";
import { LoaderCircle } from "lucide-react";

// Define the testimonial type
interface TTestimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  title: string;
  review: string;
  isActive?: boolean;
  isHomePageView?: boolean;
}

export default function TestimonialsSection() {
  // Fetch reviews using the query hook
  const { data, isLoading, isError } = useGetHomePageReviewQuery();

  // Transform API data to match TTestimonial type and get the last 20 reviews
  const testimonials: TTestimonial[] =
    data?.data
      ?.slice(-20)
      .map((review: any) => ({
        id: review._id,
        name: review?.user?.name || review?.name || "Anonymous",
        role: review?.user?.role || "User",
        avatar: "/placeholder.svg",
        rating: review?.rating,
        title: review?.reviewText.slice(0, 30) + "...",
        review: review?.reviewText,
        isActive: false,
        isHomePageView: review?.isHomePageView,
      })) || [];

  // State for active testimonial
  const [activeTestimonial, setActiveTestimonial] = useState<TTestimonial | null>(null);

  // Set the last testimonial as active when testimonials are loaded
  useEffect(() => {
    if (testimonials.length > 0 && !activeTestimonial) {
      setActiveTestimonial({ ...testimonials[0], isActive: true });
    }
  }, [testimonials, activeTestimonial]);

  const handleTestimonialClick = (testimonial: TTestimonial) => {
    setActiveTestimonial({ ...testimonial, isActive: true });
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-0 text-center">
          <LoaderCircle className="animate-spin" />
        </div>
      </section>
    );
  }

  if (isError || testimonials.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-0 text-center">
          <p className="text-lg text-gray-400">No reviews available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-0">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-4 gap-2 text-primary justify-center">
            <BiHomeAlt2 />
            <span className="text-sm font-medium">Testimonials</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-4xl text-gray-900 mb-6 leading-tight">
            Our Customers Review
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Hear what our customers have to say about their experiences with us.
            Their stories and feedback inspire us to keep delivering exceptional
            service and lasting value every step of the way.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Customer Profiles */}
          <div className="lg:col-span-4 h-96 overflow-y-scroll">
            <div className="space-y-2">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CustomerProfile
                    testimonial={{
                      ...testimonial,
                      isActive: testimonial.id === activeTestimonial?.id,
                    }}
                    onClick={() => handleTestimonialClick(testimonial)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Review & Image */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <AnimatePresence mode="wait">
                {activeTestimonial && (
                  <motion.div
                    key={activeTestimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="order-1 lg:order-1"
                  >
                    <ReviewContent testimonial={activeTestimonial} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full rounded-2xl overflow-hidden">
                  <Image
                    src={customerReview}
                    alt="Customer Review"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
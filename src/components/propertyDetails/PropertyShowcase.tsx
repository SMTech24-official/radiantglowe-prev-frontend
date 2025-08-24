"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import Image from "next/image";
import { PiShareFatLight } from "react-icons/pi";
import ReferralModal from "./ReferralModal";
import { useParams } from "next/navigation";
import { usePropertyDetailsWithReviewQuery } from "@/redux/api/propertyApi";

export default function PropertyShowcase() {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const { id } = useParams();
  const { data: property } = usePropertyDetailsWithReviewQuery(id);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          {property?.data?.headlineYourProperty || "Property Showcase"}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 hover:text-primary/80 transition-colors cursor-pointer text-primary"
        >
          <PiShareFatLight className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Main Image Slider */}
      <div className="relative mb-4 flex gap-4">
        <div className="w-2/3 ">
          <Swiper
          modules={[Navigation, Thumbs]}
          thumbs={{
            swiper:
              thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
          }}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          className="rounded-2xl overflow-hidden aspect-[4/2] bg-gray-100"
          spaceBetween={0}
          slidesPerView={1}
        >
          {property?.data?.images.map((image: string, id: number) => (
            <SwiperSlide key={id}>
              <div className="relative w-full h-full">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={"Property Image"}
                  fill
                  className="w-full h-full object-cover"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <button className="cursor-pointer swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
          <FiChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button className="cursor-pointer swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
          <FiChevronRight className="w-5 h-5 text-gray-700" />
        </button>
        </div>
        <div className="relative w-[20rem]">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="thumbnail-swiper"
          watchSlidesProgress
        >
          {property?.data?.images.map((image:string,id: number) => (
            <SwiperSlide key={id} className="cursor-pointer">
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden cursor-pointer group">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={"Property Thumbnail"}
                  fill
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      </div>

      {/* Thumbnail Slider */}
      {/* <div className="relative">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="thumbnail-swiper"
          watchSlidesProgress
        >
          {property?.data?.images.map((image:string,id: number) => (
            <SwiperSlide key={id} className="cursor-pointer">
              <div className="relative aspect-[4/3] max-w-[5rem] rounded-xl overflow-hidden cursor-pointer group">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={"Property Thumbnail"}
                  fill
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div> */}

      <ReferralModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}

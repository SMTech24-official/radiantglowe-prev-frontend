"use client";

import type { TProperty } from "@/types/property.type";
import Image from "next/image";
import { FiStar, FiUsers } from "react-icons/fi";
import { SlLocationPin } from "react-icons/sl";
import { LuBedDouble } from "react-icons/lu";
import { PiBathtub } from "react-icons/pi";
import { IoPricetagsOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { symbol } from "@/utils/symbol";

interface PropertyCardProps {
  property: TProperty;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();

  const handleBtnClick = () => {
    router.push(`/properties/${property?.id}`);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Property Image */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={
            property.image ||
            "/placeholder.svg?height=208&width=400&query=modern apartment"
          }
          alt={property.title}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300 rounded-t-2xl"
        />
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex gap-1 items-center">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 mr-2 line-clamp-1">
            {property.title}
            <span className="bg-primary/80 px-2 py-1 text-white rounded-lg ml-2 text-xs">{property.status}</span>
          </h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 bg-primary/20 px-2 py-1 rounded-lg">
            <FiStar className="w-4 h-4 text-primary fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {property.rating}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="flex gap-2 items-start pt-2 pb-4">
          <SlLocationPin className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-1">
            {property.address}
          </p>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <LuBedDouble className="w-4 h-4" />
            <span>
              {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <PiBathtub className="w-4 h-4" />
            <span>
              {property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FiUsers className="w-4 h-4" />
            <span>
              {property.guests} guest{property.guests !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Price and Button */}
        <div className="text-xl font-bold text-primary flex items-center gap-2 pb-5">
          <IoPricetagsOutline />
          <span>
            {symbol.nigeria}{property.price}
            <span className="text-sm font-normal text-gray-600">/Year</span>
          </span>
        </div>

        <button
          onClick={handleBtnClick}
          className="w-full text-primary border border-primary cursor-pointer hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
        >
          View Full Details
        </button>
      </div>
    </div>
  );
}

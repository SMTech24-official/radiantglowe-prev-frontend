"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import PropertyTypeCard from "../admin-dashboard/property-type/PropertyTypeCard";

// Dummy data for property types
const propertyTypes = [
  {
    id: "house",
    name: "House",
    icon: "/placeholder.svg?height=48&width=48&text=🏠",
  },
  {
    id: "bungalow",
    name: "Bungalow",
    icon: "/placeholder.svg?height=48&width=48&text=🏘️",
  },
  {
    id: "apartment",
    name: "Apartment/Flat",
    icon: "/placeholder.svg?height=48&width=48&text=🏢",
  },
  {
    id: "boys-quatres",
    name: "Boys Quatres",
    icon: "/placeholder.svg?height=48&width=48&text=🏠",
  },
  {
    id: "studio-room",
    name: "Studio Room",
    icon: "/placeholder.svg?height=48&width=48&text=🏠",
  },
  {
    id: "boat-house",
    name: "Boat House",
    icon: "/placeholder.svg?height=48&width=48&text=⛵",
  },
  {
    id: "rooms",
    name: "Rooms",
    icon: "/placeholder.svg?height=48&width=48&text=🛏️",
  },
  {
    id: "duplex",
    name: "Duplex",
    icon: "/placeholder.svg?height=48&width=48&text=🏢",
  },
  {
    id: "office",
    name: "Office",
    icon: "/placeholder.svg?height=48&width=48&text=🏢",
  },
  {
    id: "events-hall",
    name: "Events Hall",
    icon: "/placeholder.svg?height=48&width=48&text=🎪",
  },
  {
    id: "shops",
    name: "Shops",
    icon: "/placeholder.svg?height=48&width=48&text=🏪",
  },
  {
    id: "warehouses",
    name: "Warehouses",
    icon: "/placeholder.svg?height=48&width=48&text=🏭",
  },
];

export default function PropertyTypeSelection() {
  const [selectedType, setSelectedType] = useState("house"); // Default selection

  const handleSelectType = (id: string) => {
    setSelectedType(id);
    // console.log("Selected property type:", id);
  };

  return (
    <div className="container mx-auto lg:p-6 mb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative w-full">
          <Input
            type="text"
            placeholder="Write Headlines Now for your property "
            className="w-full pl-10 h-12 border-gray-200 focus:border-gray-300 focus:ring-0 text-base"
          />
        </div>
      </div>

      {/* Property Types Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {propertyTypes.map((type) => (
          <div key={type.id} className="aspect-[4/3]">
            <PropertyTypeCard
              id={type.id}
              name={type.name}
              icon={type.icon}
              isSelected={selectedType === type.id}
              onSelect={handleSelectType}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

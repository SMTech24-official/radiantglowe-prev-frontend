/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import PropertyCard from "../shared/PropertyCard";
import { BiHomeAlt2 } from "react-icons/bi";
import { usePathname } from "next/navigation";
import { useGetActivePropertyQuery } from "@/redux/api/propertyApi";
import type { TProperty } from "@/types/property.type";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// Map API response to PropertyCard expected format
const mapApiPropertyToTProperty = (apiProperty: any): TProperty => {
  // Calculate average rating from reviews
  const reviews = apiProperty.reviews || [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0; // Fallback to 0 if no reviews

  return {
    id: apiProperty?._id,
    image: apiProperty?.images?.[0] || "/placeholder.svg",
    title: apiProperty.headlineYourProperty,
    rating: parseFloat(averageRating.toFixed(1)),
    address: `${apiProperty?.location?.address}, ${apiProperty?.location?.city}, ${apiProperty?.location?.state}`,
    bedrooms: apiProperty?.bedrooms,
    bathrooms: apiProperty?.bathrooms,
    guests: apiProperty?.bedrooms * 2,
    price: apiProperty?.rentPerYear === 0 || apiProperty?.rentPerYear === undefined ? Math.round(apiProperty?.rentPerMonth * 12) : apiProperty?.rentPerYear,
    status: apiProperty?.status,
  };
};

export default function FeaturedProperties({ address, priceRange, propertyType, availability }: any) {
  const path = usePathname().split("/")[1];
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(path === "properties" ? 21 : 12); 
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null); 

  const { data, isLoading, error } = useGetActivePropertyQuery({
    page: currentPage,
    limit: path === "properties" ? limit : 999999999999999999,
    where: address,
    minPrice: priceRange ? priceRange.split("-")[0] : undefined,
    maxPrice: priceRange ? priceRange.split("-")[1] : undefined,
    propertyType: propertyType,
    availability: availability,
    status: selectedStatus || undefined, // Pass single status or undefined for "All"
  });

  const properties = data?.data?.properties || [];
  const totalProperties = data?.data?.total || 0;
  const totalPages = Math.ceil(totalProperties / limit);

  const filteredProperties = path === "properties"
  ? properties
  : properties.filter((property: any) => property.isHomePageView === true);

const mappedProperties: TProperty[] = filteredProperties?.slice(0, limit).map(mapApiPropertyToTProperty);
  // Map API properties to expected format
  // const mappedProperties: TProperty[] = properties.map(mapApiPropertyToTProperty);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of section when page changes
    document.getElementById("featured-properties")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Handle status selection
  const handleStatusToggle = (status: string | null) => {
    setCurrentPage(1); // Reset to first page when filter changes
    setSelectedStatus(status); // Set single status or null for "All"
  };

  return (
    <section
      id="featured-properties"
      className={`py-16 lg:py-24 ${
        path === "properties" ? "bg-white" : "bg-background-secondary"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Small Label */}
          <div className="flex items-center justify-center mb-4 gap-2 text-primary">
            <BiHomeAlt2 />
            <span className="text-sm font-medium">Featured Properties</span>
          </div>
          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-4xl text-gray-900 leading-tight pb-6 pt-4">
            Discover Your Perfect Home
          </h2>
          {/* Status Filter */}
          {/* {
            path === "properties" && <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusToggle(null)}
            >
              All
            </Button>
            {["available", "rented", "pending"].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => handleStatusToggle(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
          } */}
          
          {/* Results count */}
          {!isLoading && path === "properties" && (
            <p className="text-gray-600">
              Showing {(currentPage - 1) * limit + 1}-
              {Math.min(currentPage * limit, totalProperties)} of{" "}
              {totalProperties} properties
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading properties...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">
              Failed to load properties. Please try again.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && !error && mappedProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {mappedProperties?.map((property) => (
              <div key={property.id}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}

        {/* No Properties Found */}
        {!isLoading && !error && mappedProperties.length === 0 && (
          <div className="text-center py-12">
            <BiHomeAlt2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Properties Found
            </h3>
            <p className="text-gray-600">
              There are no properties matching your criteria at the moment.
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && path === "properties" && (
          <div className="flex items-center justify-center mt-12 gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current page
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                const showEllipsis =
                  (page === currentPage - 2 && currentPage > 3) ||
                  (page === currentPage + 2 && currentPage < totalPages - 2);

                if (showEllipsis) {
                  return (
                    <span key={page} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 bg-transparent"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
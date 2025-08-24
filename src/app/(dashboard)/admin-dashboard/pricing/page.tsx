'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import PricingCard from "@/components/admin-dashboard/pricing/PricingCard";
import { Button } from "@/components/ui/button";
import { useGetAllPackageQuery } from "@/redux/api/packageApi";
import { symbol } from "@/utils/symbol";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

// Helper function to map API data to PricingCard props
const mapPackageToPricingCard = (pkg: any) => ({
  id: pkg._id,
  title: pkg.name,
  description: pkg.description || "",
  price: pkg.price.toFixed(2),
  currency: symbol.nigeria,
  period: pkg.duration === "FREE" ? "Per Month" : pkg.duration.charAt(0) + pkg.duration.slice(1).toLowerCase(),
  recommendation: pkg.description,
  features: pkg.features,
  buttonText: "Edit Now",
  isPremium: pkg.state === "PAID",
  bgColor: pkg.bgColor,
  isActive: pkg.isActive,
  textColor: pkg.textColor,
  isFreePromo: pkg.isFreePromo || false,
  freePromoText: pkg.freePromoText || "",
  propertyLimit: pkg.propertyLimit || 0,
});

export default function AdminDashboardPricingPage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useGetAllPackageQuery();

  // Memoize the mapped packages to prevent unnecessary re-renders
  const pricingPlans = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map(mapPackageToPricingCard);
  }, [data]);

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl lg:p-6 mb-16 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full max-w-7xl lg:p-6 mb-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{(error as any)?.data?.message || "Failed to load pricing plans. Please try again later."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl lg:p-6 mb-16">
      <Button
        onClick={() => router.push("/admin-dashboard/pricing/add-package")}
        className="bg-primary mb-4"
      >
        + Add New Package
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingPlans.map((plan: any, index: number) => (
          <PricingCard
            key={plan.id}
            {...plan}
            buttonVariant={plan.isPremium ? "default" : "outline"}
          />
        ))}
      </div>
    </div>
  );
}
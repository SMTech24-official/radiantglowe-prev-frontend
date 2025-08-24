// import LandlordSection from "@/components/home/LandlordSection";
import PricingContentSection from "@/components/home/PricingContentSection";
// import TenantsSection from "@/components/home/TenantsSection";
import NoCommission from "@/components/packages/NoCommission";
import { PricingSection } from "@/components/packages/PricingSection";
import Breadcrumb from "@/components/shared/Breadcrumb";
import React from "react";

export default function PackagesPage() {
  return (
    <div>
      <Breadcrumb
        title="Packages"
        shortDescription="Premium users get on average nine times more enquiries than free users"
      />

      <NoCommission />
      <PricingSection /> 
      <PricingContentSection /> 
      {/* <LandlordSection />
      <TenantsSection /> */}
    </div>
  );
}

import FAQ from "@/components/faq/FAQ";
import WhyChooseSection from "@/components/faq/WhyChooseSection";
import Breadcrumb from "@/components/shared/Breadcrumb";
import React from "react";

export default function FaqPage() {
  return (
    <div>
      <Breadcrumb title="Frequently Asked Questions" shortDescription="" />

      <FAQ />
      <WhyChooseSection />
    </div>
  );
}

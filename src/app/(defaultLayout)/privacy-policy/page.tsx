import ContactSection from "@/components/privacy-policy/ContactSection";
import PrivacyPolicy from "@/components/privacy-policy/PrivacyPolicy";
import Breadcrumb from "@/components/shared/Breadcrumb";
import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Breadcrumb
        title="Privacy Policy "
        shortDescription=""
      />

      <PrivacyPolicy />
      <ContactSection />
    </div>
  );
}

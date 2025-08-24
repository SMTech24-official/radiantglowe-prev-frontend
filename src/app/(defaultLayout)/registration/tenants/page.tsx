/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import TenantRegistrationForm from "@/components/registration/tenants/TenantRegistrationForm";
import TenantsProfileVerification from "@/components/registration/tenants/TenantsProfileVerification";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useState } from "react";

export default function TenantsRegistrationPage() {
  const [isTenantFormSubmitted, setIsTenantFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  return (
    <div>
      <Breadcrumb
        title="Tenant’s registration"
        shortDescription="Register to Find Your Perfect Home – Easy, Quick, and Secure"
      />

      {!isTenantFormSubmitted ? (
        <TenantRegistrationForm
          onNext={(data) => {
            setFormData(data);
            setIsTenantFormSubmitted(true);
          }}
        />
      ) : (
        <TenantsProfileVerification
          formData={formData}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onBack={() => setIsTenantFormSubmitted(false)}
        />
      )}
    </div>
  );
}
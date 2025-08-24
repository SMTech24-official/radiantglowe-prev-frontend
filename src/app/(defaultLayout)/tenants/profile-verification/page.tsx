/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { TenantsVerificationSubmitForm } from "@/components/registration/tenants/TenantsVerificationSubmitForm";
import Breadcrumb from "@/components/shared/Breadcrumb";
import TenantsProfileCard from "@/components/tenants/TenantsProfileCard";
import { useGetMeQuery } from "@/redux/api/authApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileVerificationPage() {
  const { data: profileData, isLoading: isProfileLoading } = useGetMeQuery();
  const router = useRouter();

  const userData = profileData?.data || {};

  const [formData, setFormData] = useState({
    email: userData.email || "",
    address: {
      flatOrHouseNo: userData.address?.flatOrHouseNo || "",
      address: userData.address?.address || "",
      state: userData.address?.state || "",
      city: userData.address?.city || "",
      town: userData.address?.town || "",
      area: userData.address?.area || "",
    },
    lookingPropertyForTenant: userData.lookingPropertyForTenant || ["Room"],
    guarantor: userData.guarantor || {
      name: "",
      telephone: "",
      email: "",
      profession: "",
      address: {
        address: "",
        state: "",
        city: "",
        town: "",
        area: "",
      },
    },
    references: userData.references || [
      {
        name: "",
        telephone: "",
        email: "",
        profession: "",
        address: {
          address: "",
          state: "",
          city: "",
          town: "",
          area: "",
        },
      },
      {
        name: "",
        telephone: "",
        email: "",
        profession: "",
        address: {
          address: "",
          state: "",
          city: "",
          town: "",
          area: "",
        },
      },
    ],
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleBack = () => {
    router.push("/tenants/profile");
  };

  return (
    <div>
      <Breadcrumb
        title="Your Profile Verification"
        shortDescription="Manage Your Profile Verification"
      />

      <div className="container mx-auto py-10 space-y-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <TenantsProfileCard />
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-center md:text-start">
              Your Profile
            </h1>
            <p className="pt-4 text-center md:text-start">Manage Your Profile</p>
          </div>
        </div>

        <TenantsVerificationSubmitForm
          formData={formData}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
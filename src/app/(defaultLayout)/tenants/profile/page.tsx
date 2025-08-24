import Breadcrumb from "@/components/shared/Breadcrumb";
import GeneralInfo from "@/components/tenants/profile/GeneralInfo";
import SecurityInfo from "@/components/tenants/profile/SecurityInfo";
import TenantsProfileHeader from "@/components/tenants/profile/TenantsProfileHeader";
import TenantsProfileCard from "@/components/tenants/TenantsProfileCard";
import React from "react";

export default function TenantsProfilePage() {
  return (
    <div>
      <Breadcrumb
        title="Profile"
        shortDescription="Manage Your Account and Personal Information"
      />

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center py-10">
        <TenantsProfileCard />
        <div className="flex flex-col lg:flex-row gap-5 w-full">
          <TenantsProfileHeader />
          <div className="flex flex-col w-full gap-4">
            <GeneralInfo />
            <SecurityInfo />
          </div>
        </div>
      </div>
    </div>
  );
}

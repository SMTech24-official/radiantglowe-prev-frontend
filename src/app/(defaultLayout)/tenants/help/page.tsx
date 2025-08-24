import Breadcrumb from "@/components/shared/Breadcrumb";
import MessageManagement from "@/components/tenants/help/MessageManagement";
import TenantsProfileCard from "@/components/tenants/TenantsProfileCard";
import React from "react";

export default function HelpPage() {
  return (
    <div>
      <Breadcrumb
        title="Help & Support"
        shortDescription="Find answers or get in touch with our support team"
      />

      <div className="container mx-auto py-10 space-y-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <TenantsProfileCard />
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-center md:text-start">
              Help / Support
            </h1>
            <p className="pt-4 text-center md:text-start">
              Find answers or get in touch with our support team
            </p>
          </div>
        </div>

        <MessageManagement />
      </div>
    </div>
  );
}

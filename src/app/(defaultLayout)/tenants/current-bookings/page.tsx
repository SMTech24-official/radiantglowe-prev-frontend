import Breadcrumb from "@/components/shared/Breadcrumb";
import ReferralTable from "@/components/tenants/ReferralTable";
import TenantsProfileCard from "@/components/tenants/TenantsProfileCard";
import React from "react";

export default function TenantsCurrentBookingsPage() {
  return (
    <div>
      <Breadcrumb
        title="Your Current  Bookings"
        shortDescription="Manage Your Bookings"
      />

      <div className="container mx-auto py-10 space-y-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <TenantsProfileCard />
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-center md:text-start">
              Your Current  Bookings
            </h1>
            <p className="pt-4 text-center md:text-start">Manage Your Bookings</p>
          </div>
        </div>

        <ReferralTable />
      </div>
    </div>
  );
}

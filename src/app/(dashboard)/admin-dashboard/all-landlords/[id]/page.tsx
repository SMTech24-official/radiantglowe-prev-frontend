"use client";

import AdminLandlordInfo from "@/components/admin-dashboard/all-landlord-details/AdminLandlordInfo";
import AdminPricingInfo from "@/components/admin-dashboard/all-landlord-details/AdminPricingInfo";
import AdminPropertiesInfo from "@/components/admin-dashboard/all-landlord-details/AdminPropertiesInfo";
import { useLandlordDetailsByAdminQuery } from "@/redux/api/dashboardApi";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { IoBusinessOutline, IoPricetagsOutline } from "react-icons/io5";
import { LiaUserSolid } from "react-icons/lia";
import { PiMapPinLine } from "react-icons/pi";


const TABS = [
  {
    key: "landlords",
    label: "Landlords Information",
    icon: <LiaUserSolid className="w-5 h-5" />,
    component: <AdminLandlordInfo />,
  },
  {
    key: "properties",
    label: "Properties Information",
    icon: <IoBusinessOutline className="w-5 h-5" />,
    component: <AdminPropertiesInfo />,
  },
  {
    key: "pricing",
    label: "Pricing Information",
    icon: <IoPricetagsOutline className="w-5 h-5" />,
    component: <AdminPricingInfo />,
  },
];



const TabButton = ({
  tabKey,
  label,
  icon,
  isActive,
  onClick,
}: {
  tabKey: string;
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick: (key: string) => void;
}) => (
  <button
    onClick={() => onClick(tabKey)}
    className={`flex items-center gap-2 py-4 px-1 text-sm font-medium cursor-pointer
      ${isActive
        ? "text-primary border-b-2 border-primary"
        : "text-gray-500 hover:text-gray-700"
      }
      transition-colors duration-200`}
  >
    {icon}
    {label}
  </button>
);

export default function AdminLandlordDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const { data } = useLandlordDetailsByAdminQuery(id)
  const [activeTab, setActiveTab] = useState("landlords");

  const activeTabContent = TABS.find((tab) => tab.key === activeTab)?.component;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:p-6 pb-8">
        {/* Property Image */}
        <div className="relative w-28 h-28 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={data?.data?.landlord?.image || "/placeholder.svg"}
            alt={data?.data?.landlord?.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Name, ID, Address */}
        <div className="flex-1 pt-2">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3 leading-tight">
            {data?.data?.landlord?.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <PiMapPinLine className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{data?.data?.landlord?.address?.address}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 lg:px-6">
        <nav
          className="flex flex-col md:flex-row md:space-x-8"
          aria-label="Tabs"
        >
          {TABS.map((tab) => (
            <TabButton
              key={tab.key}
              tabKey={tab.key}
              label={tab.label}
              icon={tab.icon}
              isActive={tab.key === activeTab}
              onClick={setActiveTab}
            />
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">{activeTabContent}</div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { IoBusinessOutline, IoCallOutline } from "react-icons/io5";
import AddPropertyInfo from "@/components/landlord-dashboard/all-properties/add-new-property/AddPropertyInfo";
import AddContactInfo from "@/components/landlord-dashboard/all-properties/add-new-property/AddContactInfo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAddPropertyMutation } from "@/redux/api/propertyApi";
import { LoaderIcon } from "lucide-react";

const TABS = [
  {
    key: "properties",
    label: "Properties Information",
    icon: <IoBusinessOutline className="w-5 h-5" />,
    component: <AddPropertyInfo />,
  },
  {
    key: "contact",
    label: "Contact Information",
    icon: <IoCallOutline className="w-5 h-5" />,
    component: <AddContactInfo />,
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
      ${
        isActive
          ? "text-primary border-b-2 border-primary"
          : "text-gray-500 hover:text-gray-700"
      }
      transition-colors duration-200`}
  >
    {icon}
    {label}
  </button>
);



export default function LandlordAddNewPropertyPage() {

  const [ addPropertyMutate ,{isLoading}] = useAddPropertyMutation()
  const [activeTab, setActiveTab] = useState("properties");

  const activeTabContent = TABS.find((tab) => tab.key === activeTab)?.component;


  const handleSave = () => {
  const rawData = localStorage.getItem("propertyFormData");
  const propertyData = rawData ? JSON.parse(rawData) : {};

  // Required fields check
  if(!propertyData.headlineYourProperty){
    toast.error("Headline your property is required");
  }else if (!propertyData.propertyType) {
    toast.error("Property type is required");
  } else if (typeof propertyData.bedrooms !== "number") {
    toast.error("Bedrooms must be a number");
  } else if (typeof propertyData.bathrooms !== "number") {
    toast.error("Bathrooms must be a number");
  } else if (typeof propertyData.livingRooms !== "number") {
    toast.error("Living rooms must be a number");
  } else if (typeof propertyData.kitchen !== "number") {
    toast.error("Kitchen count must be a number");
  } else if (!propertyData.location || !propertyData.location.address || !propertyData.location.city || !propertyData.location.state || !propertyData.location.town || !propertyData.location.area) {
    toast.error("Complete location details are required");
  } else if (!Array.isArray(propertyData.images) || propertyData.images.length === 0) {
    toast.error("At least one image is required");
  } else if (!propertyData.formAvailable) {
    toast.error("Form available date is required");
  } else if (typeof propertyData.rentPerYear !== "number") {
    toast.error("Rent per year must be a number");
  } else if (typeof propertyData.rentPerMonth !== "number") {
    toast.error("Rent per month must be a number");
  } else if (typeof propertyData.serviceCharge !== "number") {
    toast.error("Service charge must be a number");
  } else if (!Array.isArray(propertyData.accessYourProperty) || propertyData.accessYourProperty.length === 0) {
    toast.error("Access type is required");
  } else if(!propertyData.location){
    toast.error("Location is required")
  }else {
    // ✅ All required fields are valid
    addPropertyMutate(propertyData).unwrap().then(() => 
     {
      toast.success("Property added successfully")
      localStorage.removeItem("propertyFormData")
     }
  ).catch((error) => toast.error(error.data.message))
    // console.log("Validation passed", propertyData);
    // Proceed to save or submit the form
  }
};

  return (
    <div className="w-full max-w-6xl">
      <div className="pb-4 flex justify-between gap-2">
        <p className="font-semibold text-xl">Add Property</p>
        <Button className="mt-2 cursor-pointer" onClick={handleSave}>{
          isLoading ? <>Saving <LoaderIcon className="w-4 h-4 animate-spin" /></>  : "Save"}
          </Button>
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

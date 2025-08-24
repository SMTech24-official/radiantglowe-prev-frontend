/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  IoCardOutline,
  IoBusinessOutline,
  IoCallOutline,
} from "react-icons/io5"
import { PiMapPinLine, PiUserLight } from "react-icons/pi"
import { useParams } from "next/navigation"
import { usePropertyDetailsQuery } from "@/redux/api/propertyApi"
import { Skeleton } from "@/components/ui/skeleton"
import PropertiesInformation from "@/components/landlord-dashboard/all-properties/details/PropertiesInformation"
import ContactInformation from "@/components/landlord-dashboard/all-properties/details/ContactInformation"
import TenantsInformation from "@/components/landlord-dashboard/all-properties/details/TenantsInformation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const TABS = [
  {
    key: "properties",
    label: "Properties Information",
    icon: <IoBusinessOutline className="w-5 h-5" />,
    component: <PropertiesInformation />,
  },
  {
    key: "contact",
    label: "Contact Information",
    icon: <IoCallOutline className="w-5 h-5" />,
    component: <ContactInformation />,
  },
  {
    key: "tenants",
    label: "Tenants Information",
    icon: <PiUserLight className="w-5 h-5" />,
    component: <TenantsInformation />,
  },
]

const PropertyHeader = ({ data }: { data: any }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:p-6 pb-8">
      {data ? (
        <>
          <div>
            <p className="text-gray-400 text-sm">
              View Images {data.images?.length || 0}
            </p>
            <div
              className="relative w-28 h-28 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            >
              <Image
                src={data.images?.[0] || "/placeholder.svg"}
                alt={data.headlineYourProperty}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 pt-2">
            <h1 className="text-2xl font-semibold text-gray-900 mb-3 leading-tight">
              {data.headlineYourProperty}
            </h1>
            <h1 className="text-sm text-white font-semibold text-green mb-3 leading-tight bg-green-400 inline-block px-2 py-0.5">
              {data.status}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <IoCardOutline className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{data.PID}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <PiMapPinLine className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                {`${data.location.flatOrHouseNo}, ${data.location.address}, ${data.location.city}, ${data.location.state}`}
              </span>
            </div>
          </div>

          {/* Image Modal */}
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Property Images</DialogTitle>
                <DialogDescription>
                  Total Images: {data.images?.length || 0}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {data.images && data.images.length > 0 ? (
                  data.images.map((image: string, index: number) => (
                    <div key={index} className="relative w-full h-48">
                      <Image
                        src={image}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))
                ) : (
                  <p>No images available.</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full">
          <Skeleton className="w-28 h-28 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      )}
    </div>
  )
}

const TabButton = ({
  tabKey,
  label,
  icon,
  isActive,
  onClick,
}: {
  tabKey: string
  label: string
  icon: React.ReactElement
  isActive: boolean
  onClick: (key: string) => void
}) => (
  <button
    onClick={() => onClick(tabKey)}
    className={`flex items-center gap-2 py-4 px-1 text-sm font-medium cursor-pointer
      ${isActive ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}
      transition-colors duration-200`}
  >
    {icon}
    {label}
  </button>
)

export default function AllPropertiesDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const { data, isLoading } = usePropertyDetailsQuery(id)
  const [activeTab, setActiveTab] = useState("properties")

  const activeTabContent = TABS.find(tab => tab.key === activeTab)?.component

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <PropertyHeader data={null} />
        <div className="border-b border-gray-200 lg:px-6">
          <nav className="flex flex-col md:flex-row md:space-x-8" aria-label="Tabs">
            {TABS.map(tab => (
              <Skeleton key={tab.key} className="h-10 w-32" />
            ))}
          </nav>
        </div>
        <div className="py-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!data?.data) {
    return <div className="p-6">Property not found</div>
  }

  return (
    <div className="w-full p-6">
      <PropertyHeader data={data.data} />
      <div className="border-b border-gray-200 lg:px-6">
        <nav className="flex flex-col md:flex-row md:space-x-8" aria-label="Tabs">
          {TABS.map(tab => (
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
      <div className="py-6">{activeTabContent}</div>
    </div>
  )
}
"use client"

import { usePropertyDetailsWithReviewQuery } from "@/redux/api/propertyApi"
import { symbol } from "@/utils/symbol"
import { useParams } from "next/navigation"
import type React from "react"
import { useState, useEffect } from "react"
import { FiChevronDown, FiChevronUp } from "react-icons/fi"
import { FiTv, FiHome, FiDroplet, FiLock } from "react-icons/fi"

interface AccordionItem {
  id: string
  title: string
  isOpen: boolean
  content: React.ReactNode
}

export default function PropertyAccordion() {
  const { id } = useParams()
  const { data: property, isLoading, isError } = usePropertyDetailsWithReviewQuery(id)
  const [accordionItems, setAccordionItems] = useState<AccordionItem[]>([])

  useEffect(() => {
    if (property?.data) {
      setAccordionItems([
        {
          id: "availability",
          title: "Availability",
          isOpen: true,
          content: (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Available from</span>
                <span className="text-gray-900 text-sm font-medium">
                  {property.data.formAvailable || "Now"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Minimum term</span>
                <span className="text-gray-900 text-sm font-medium">
                  {property.data.minimumLengthOfContract || "N/A"} months
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Status</span>
                <span className="text-green-500 text-sm font-medium capitalize">
                  {property.data.status || "N/A"}
                </span>
              </div>
            </div>
          ),
        },
        {
          id: "extra-cost",
          title: "Extra cost",
          isOpen: false,
          content: (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Security deposit</span>
                <span className="text-gray-900 text-sm font-medium">
                  {symbol.nigeria}{property.data.depositAmount || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Service charge</span>
                <span className="text-gray-900 text-sm font-medium">
                  {symbol.nigeria}{property.data.serviceCharge || "N/A"}
                </span>
              </div>
              {property.data.isIncludeAllUtilityWithService && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Utilities included</span>
                  <span className="text-gray-900 text-sm font-medium">Yes</span>
                </div>
              )}
            </div>
          ),
        },
        {
          id: "amenities",
          title: "Amenities",
          isOpen: false,
          content: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {property.data.furnished === "fully_furnished" && (
                <div className="flex items-center space-x-3">
                  <FiHome className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 text-sm">Fully furnished</span>
                </div>
              )}
              {property.data.features?.includes("billsIncluded") && (
                <div className="flex items-center space-x-3">
                  <FiDroplet className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 text-sm">Bills included</span>
                </div>
              )}
              {property.data.features?.includes("parking") && (
                <div className="flex items-center space-x-3">
                  <FiTv className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 text-sm">Parking space</span>
                </div>
              )}
              {property.data.isReferenceRequired && (
                <div className="flex items-center space-x-3">
                  <FiLock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 text-sm">References required</span>
                </div>
              )}
              {property.data.isRemoteVideoView && (
                <div className="flex items-center space-x-3">
                  <FiTv className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900 text-sm">Virtual viewings</span>
                </div>
              )}

            </div>
          ),
        },
        {
          id: "property-details",
          title: "Property Details",
          isOpen: false,
          content: (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Property Type</span>
                <span className="text-gray-900 text-sm font-medium capitalize">
                  {property.data.propertyType || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Bedrooms</span>
                <span className="text-gray-900 text-sm font-medium">
                  {property.data.bedrooms || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Bathrooms</span>
                <span className="text-gray-900 text-sm font-medium">
                  {property.data.bathrooms || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Living Rooms</span>
                <span className="text-gray-900 text-sm font-medium">
                  {property.data.livingRooms || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Kitchen</span>
                <span className="text-gray-900 text-sm font-medium">
                  {property.data.kitchen || "N/A"}
                </span>
              </div>
            </div>
          ),
        },
        {
          id: "housemate-preferences",
          title: "Housemate Preferences",
          isOpen: false,
          content: (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Gender</span>
                <span className="text-gray-900 text-sm font-medium capitalize">
                  {property.data.gender || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Age range</span>
                <span className="text-gray-900 text-sm font-medium">
                  {property.data.ages || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Suitable for</span>
                <span className="text-gray-900 text-sm font-medium">
                  {property.data.accessYourProperty?.join(", ") || "N/A"}
                </span>
              </div>
            </div>
          ),
        },
      ])
    }
  }, [property])

  const toggleAccordion = (id: string) => {
    setAccordionItems((items) =>
      items.map((item) => (item.id === id ? { ...item, isOpen: !item.isOpen } : item))
    )
  }

  if (isLoading) {
    return (
      <section className="px-4 py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </section>
    )
  }

  if (isError || !property?.data) {
    return (
      <section className="px-4 py-8">
        <div className="text-center text-red-500">
          Failed to load property details. Please try again later.
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 py-8">
      <div className="">
        <div className="bg-white rounded-lg border-b border-gray-200 divide-y divide-gray-200">
          {accordionItems.map((item) => (
            <div key={item.id} className="py-6">
              <button
                onClick={() => toggleAccordion(item.id)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                {item.isOpen ? (
                  <FiChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {item.isOpen && <div className="mt-4 animate-in slide-in-from-top-2 duration-200">{item.content}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
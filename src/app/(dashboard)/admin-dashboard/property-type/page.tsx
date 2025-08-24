/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import PropertyTypeCard from "@/components/admin-dashboard/property-type/PropertyTypeCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePropertyElementQuery } from "@/redux/api/propertyApi"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { IoAdd, IoSearch } from "react-icons/io5"

export default function AdminPropertyTypePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("house") // Default selection

  const router = useRouter()
  const { data, isLoading, isError } = usePropertyElementQuery()

  // Transform API data to match the expected format
  const propertyTypes = data?.data?.propertyTypes?.map((type: any) => ({
    id: type._id,
    name: type.title.charAt(0).toUpperCase() + type.title.slice(1), // Capitalize first letter
    icon: type.icon,
  })) || []

  // Filter property types based on search term
  const filteredPropertyTypes = propertyTypes.filter((type: any) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectType = (id: string) => {
    setSelectedType(id)
  }

  const handleMenuClick = (id: string) => {
    // console.log("Menu clicked for:", id)
  }

  const handleAddNewType = () => {
    router.push(`/admin-dashboard/property-type/add-new-type`)
  }

  return (
    <div className="w-full max-w-7xl lg:p-6 mb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 border-gray-200 focus:border-gray-300 focus:ring-0 text-base"
            disabled={isLoading} // Disable input while loading
          />
        </div>

        {/* Add New Type Button */}
        <Button
          onClick={handleAddNewType}
          className="bg-primary hover:bg-primary/80 text-white h-12 px-6 rounded-lg flex items-center gap-2 cursor-pointer"
          disabled={isLoading} // Disable button while loading
        >
          <IoAdd className="w-5 h-5" />
          Add New Type
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Failed to load property types. Please try again later.</p>
        </div>
      )}

      {/* Property Types Grid */}
      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPropertyTypes.map((type: any) => (
              <div key={type.id} className="aspect-[4/3]">
                <PropertyTypeCard
                  id={type.id}
                  name={type.name}
                  icon={type.icon}
                  isSelected={selectedType === type.id}
                  onSelect={handleSelectType}
                  onMenuClick={handleMenuClick}
                />
              </div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredPropertyTypes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No property types found matching &apos;{searchTerm}&apos;</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
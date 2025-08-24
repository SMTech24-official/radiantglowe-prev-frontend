"use client"
import FeaturedProperties from '@/components/home/FeaturedProperties'
import PropertyBanner from '@/components/properties/PropertyBanner'
import React from 'react'

export default function PropertiesPage() {
  const [address, setAddress] = React.useState<string>("");
  const [priceRange, setPriceRange] = React.useState<string>("");
  const [propertyType, setPropertyType] = React.useState<string>("");
  const [availability, setAvailability] = React.useState<string>("");
  return (
    <div>
        <PropertyBanner setAddress={setAddress} setPriceRange={setPriceRange} setPropertyType={setPropertyType} setAvailability={setAvailability} />
        <FeaturedProperties address={address} priceRange={priceRange} propertyType={propertyType} availability={availability} />
    </div>
  )
}

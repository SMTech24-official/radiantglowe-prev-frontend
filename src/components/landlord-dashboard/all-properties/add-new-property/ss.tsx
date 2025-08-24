/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
import { IoCameraOutline } from "react-icons/io5"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { usePropertyElementQuery } from "@/redux/api/propertyApi"

// Define the FormData type first
interface FormData {
  headlineYourProperty?: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  livingRooms: number
  kitchen: number
  description?: string
  images: string[]
  status?: "available" | "rented" | "pending"
  gender?: string
  features?: string[]
  formAvailable: string
  furnished?: "furnished" | "unfurnished" | "semi-furnished"
  ages?: string
  rentPerYear: number
  rentPerMonth: number
  serviceCharge: number
  depositAmount?: number
  isIncludeAllUtilityWithService: boolean
  minimumLengthOfContract?: number
  isReferenceRequired: boolean
  accessYourProperty: string[]
  mediaLink?: string
  isAcceptTermsAndCondition: boolean
  isRemoteVideoView: boolean
}

// Create a base schema without dynamic validation
const baseFormSchema = z.object({
  headlineYourProperty: z.string().trim().optional(),
  propertyType: z.string().min(1, { message: "Property type is required" }),
  bedrooms: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Bedrooms must be a non-negative number" })
  ),
  bathrooms: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Bathrooms must be a non-negative number" })
  ),
  livingRooms: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Living rooms must be a non-negative number" })
  ),
  kitchen: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Kitchens must be a non-negative number" })
  ),
  description: z.string().trim().optional(),
  images: z.array(z.string()).min(1, { message: "At least one image is required" }),
  status: z.enum(["available", "rented", "pending"]).default("available").optional(),
  gender: z.string().optional(),
  features: z.array(z.string()).optional(),
  formAvailable: z.string().min(1, { message: "Available from date is required" }),
  furnished: z.enum(["furnished", "unfurnished", "semi-furnished"]).optional(),
  ages: z.string().optional(),
  rentPerYear: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Rent per year must be a non-negative number" })
  ),
  rentPerMonth: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Rent per month must be a non-negative number" })
  ),
  serviceCharge: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Service charge must be a non-negative number" })
  ),
  depositAmount: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().min(0, { message: "Deposit amount must be a non-negative number" }).optional()
  ),
  isIncludeAllUtilityWithService: z.boolean().default(false),
  minimumLengthOfContract: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().min(0, { message: "Contract length must be a non-negative number" }).optional()
  ),
  isReferenceRequired: z.boolean().default(false),
  accessYourProperty: z.array(z.string()).min(1, { message: "At least one access type is required" }),
  mediaLink: z.string().optional(),
  isAcceptTermsAndCondition: z.boolean().default(false),
  isRemoteVideoView: z.boolean().default(false),
})

// Define interfaces for propertyElementsData
interface PropertyType {
  _id: string
  title: string
  icon: string
}

interface PropertyElementData {
  _id: string
  accessTypes: string[]
  featureTypes: string[]
  propertyTypes: PropertyType[]
  createdAt: string
  updatedAt: string
  __v: number
}

interface PropertyElementResponse {
  success: boolean
  message: string
  data: PropertyElementData
}

export default function AddPropertyInfo() {
  const { data: propertyElementsData, isLoading } = usePropertyElementQuery() as {
    data: PropertyElementResponse | undefined
    isLoading: boolean
  }

  // Extract data from propertyElementsData
  const propertyTypes = propertyElementsData?.data?.propertyTypes?.map((pt) => ({
    title: pt.title,
    icon: pt.icon || "/placeholder.svg?height=20&width=20",
  })) || []
  const featureTypes = propertyElementsData?.data?.featureTypes?.map((name) => ({
    id: name,
    name,
    icon: "/placeholder.svg?height=20&width=20",
  })) || []
  const accessTypes = propertyElementsData?.data?.accessTypes?.map((name) => ({
    id: name,
    name,
    icon: "/placeholder.svg?height=20&width=20",
  })) || []

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedAccessTypes, setSelectedAccessTypes] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<string[]>([])

  // Create form with proper typing
  const form = useForm<FormData>({
    resolver: zodResolver(baseFormSchema) as any,
    defaultValues: {
      features: [],
      accessYourProperty: [],
      images: [],
      status: "available",
      isIncludeAllUtilityWithService: false,
      isReferenceRequired: false,
      isAcceptTermsAndCondition: false,
      isRemoteVideoView: false,
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
      kitchen: 0,
      rentPerYear: 0,
      rentPerMonth: 0,
      serviceCharge: 0,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = form

  // Custom validation function
  const validateForm = (data: FormData): string[] => {
    const errors: string[] = []
    
    const propertyTitlesList = propertyTypes.map(pt => pt.title)
    const featureTypesList = featureTypes.map(ft => ft.id)
    const accessTypesList = accessTypes.map(at => at.id)
    
    if (propertyTitlesList.length > 0 && !propertyTitlesList.includes(data.propertyType)) {
      errors.push("Invalid property type")
    }
    
    if (data.features && featureTypesList.length > 0) {
      const invalidFeatures = data.features.filter(f => !featureTypesList.includes(f))
      if (invalidFeatures.length > 0) {
        errors.push("Invalid feature types selected")
      }
    }
    
    if (accessTypesList.length > 0) {
      const invalidAccess = data.accessYourProperty.filter(a => !accessTypesList.includes(a))
      if (invalidAccess.length > 0) {
        errors.push("Invalid access types selected")
      }
    }
    
    return errors
  }

  const toggleFeature = (featureId: string) => {
    const updatedFeatures = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter((id) => id !== featureId)
      : [...selectedFeatures, featureId]
    setSelectedFeatures(updatedFeatures)
    setValue("features", updatedFeatures)
  }

  const toggleAccessType = (accessId: string) => {
    const updatedAccessTypes = selectedAccessTypes.includes(accessId)
      ? selectedAccessTypes.filter((id) => id !== accessId)
      : [...selectedAccessTypes, accessId]
    setSelectedAccessTypes(updatedAccessTypes)
    setValue("accessYourProperty", updatedAccessTypes)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      const updatedImages = [...imageFiles, ...newImages]
      setImageFiles(updatedImages)
      setValue("images", updatedImages)
    }
  }

  const onSubmit: SubmitHandler<FormData> = (data) => {
    // Perform custom validation
    const validationErrors = validateForm(data)
    if (validationErrors.length > 0) {
      // You can show these errors to the user
      return
    }
    
    // Handle form submission (e.g., send to backend)
  }

  const handleCancel = () => {
    reset()
    setSelectedFeatures([])
    setSelectedAccessTypes([])
    setImageFiles([])
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!propertyElementsData?.data) {
    return <div>Error: Unable to load property types</div>
  }

  return (
    <div className="w-full max-w-4xl lg:p-8 rounded-lg mb-12 bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
          <div className="flex flex-wrap gap-2">
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
              <IoCameraOutline className="w-6 h-6 text-gray-400" />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imageFiles.map((url, index) => (
              <div key={index} className="relative w-20 h-20">
                <Image src={url} alt={`Preview ${index}`} fill className="object-cover rounded-lg" />
              </div>
            ))}
          </div>
          {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>}
        </div>

        {/* Headline */}
        <div>
          <Input
            placeholder="Headline Your Property"
            {...register("headlineYourProperty")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.headlineYourProperty && (
            <p className="text-red-500 text-sm mt-1">{errors.headlineYourProperty.message}</p>
          )}
        </div>

        {/* Property Type */}
        <div>
          <Select onValueChange={(value) => setValue("propertyType", value)}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0">
              <SelectValue placeholder="Select Property Type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.title} value={type.title}>
                  <div className="flex items-center gap-2">
                    <span>{type.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType.message}</p>}
        </div>

        {/* Bedrooms, Bathrooms, Living Rooms, Kitchen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Bedrooms"
              {...register("bedrooms")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Bathrooms"
              {...register("bathrooms")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Living Rooms"
              {...register("livingRooms")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.livingRooms && <p className="text-red-500 text-sm mt-1">{errors.livingRooms.message}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Kitchen"
              {...register("kitchen")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.kitchen && <p className="text-red-500 text-sm mt-1">{errors.kitchen.message}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <Textarea
            placeholder="Description"
            rows={4}
            {...register("description")}
            className="border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Status */}
        <div>
          <Select onValueChange={(value) => setValue("status", value as "available" | "rented" | "pending")}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {["available", "rented", "pending"].map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>

        {/* Gender */}
        <div>
          <Input
            placeholder="Gender (e.g., Male, Female, Any)"
            {...register("gender")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
        </div>

        {/* Features */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Features</label>
          <div className="flex flex-wrap gap-3">
            {featureTypes.map((feature) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => toggleFeature(feature.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full border transition-colors cursor-pointer
                  ${
                    selectedFeatures.includes(feature.id)
                      ? "border-primary bg-background-secondary text-primary"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }
                `}
              >
                <div className="relative w-4 h-4 flex-shrink-0">
                  <Image src={feature.icon} alt={feature.name} fill className="object-contain" />
                </div>
                <span className="text-sm">{feature.name}</span>
              </button>
            ))}
          </div>
          {errors.features && <p className="text-red-500 text-sm mt-1">{errors.features.message}</p>}
        </div>

        {/* Available From */}
        <div>
          <Input
            type="date"
            placeholder="Available From"
            {...register("formAvailable")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.formAvailable && <p className="text-red-500 text-sm mt-1">{errors.formAvailable.message}</p>}
        </div>

        {/* Furnished */}
        <div>
          <Select onValueChange={(value) => setValue("furnished", value as "furnished" | "unfurnished" | "semi-furnished")}>
            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0">
              <SelectValue placeholder="Select Furnished Status" />
            </SelectTrigger>
            <SelectContent>
              {["furnished", "unfurnished", "semi-furnished"].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.furnished && <p className="text-red-500 text-sm mt-1">{errors.furnished.message}</p>}
        </div>

        {/* Ages */}
        <div>
          <Input
            placeholder="Ages (e.g., 18-30, Any)"
            {...register("ages")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.ages && <p className="text-red-500 text-sm mt-1">{errors.ages.message}</p>}
        </div>

        {/* Rent and Charges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Rent Per Year"
              {...register("rentPerYear")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.rentPerYear && <p className="text-red-500 text-sm mt-1">{errors.rentPerYear.message}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Rent Per Month"
              {...register("rentPerMonth")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.rentPerMonth && <p className="text-red-500 text-sm mt-1">{errors.rentPerMonth.message}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Service Charge"
              {...register("serviceCharge")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.serviceCharge && <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message}</p>}
          </div>
        </div>

        {/* Deposit Amount and Contract Length */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="number"
              placeholder="Deposit Amount"
              {...register("depositAmount")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.depositAmount && <p className="text-red-500 text-sm mt-1">{errors.depositAmount.message}</p>}
          </div>
          <div>
            <Input
              type="number"
              placeholder="Minimum Length of Contract (Months)"
              {...register("minimumLengthOfContract")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.minimumLengthOfContract && (
              <p className="text-red-500 text-sm mt-1">{errors.minimumLengthOfContract.message}</p>
            )}
          </div>
        </div>

        {/* Access Types */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Access Types</label>
          <div className="flex flex-wrap gap-3">
            {accessTypes.map((access) => (
              <button
                key={access.id}
                type="button"
                onClick={() => toggleAccessType(access.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full border transition-colors cursor-pointer
                  ${
                    selectedAccessTypes.includes(access.id)
                      ? "border-primary bg-background-secondary text-primary"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }
                `}
              >
                <div className="relative w-4 h-4 flex-shrink-0">
                  <Image src={access.icon} alt={access.name} fill className="object-contain" />
                </div>
                <span className="text-sm">{access.name}</span>
              </button>
            ))}
          </div>
          {errors.accessYourProperty && (
            <p className="text-red-500 text-sm mt-1">{errors.accessYourProperty.message}</p>
          )}
        </div>

        {/* Media Link */}
        <div>
          <Input
            placeholder="Media Link (e.g., video tour URL)"
            {...register("mediaLink")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.mediaLink && <p className="text-red-500 text-sm mt-1">{errors.mediaLink.message}</p>}
        </div>

        {/* Checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isIncludeAllUtilityWithService"
              {...register("isIncludeAllUtilityWithService")}
              onCheckedChange={(checked) => setValue("isIncludeAllUtilityWithService", !!checked)}
            />
            <label htmlFor="isIncludeAllUtilityWithService" className="text-sm text-gray-700">
              Include All Utilities with Service
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isReferenceRequired"
              {...register("isReferenceRequired")}
              onCheckedChange={(checked) => setValue("isReferenceRequired", !!checked)}
            />
            <label htmlFor="isReferenceRequired" className="text-sm text-gray-700">
              Reference Required
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isAcceptTermsAndCondition"
              {...register("isAcceptTermsAndCondition")}
              onCheckedChange={(checked) => setValue("isAcceptTermsAndCondition", !!checked)}
            />
            <label htmlFor="isAcceptTermsAndCondition" className="text-sm text-gray-700">
              Accept Terms and Conditions
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isRemoteVideoView"
              {...register("isRemoteVideoView")}
              onCheckedChange={(checked) => setValue("isRemoteVideoView", !!checked)}
            />
            <label htmlFor="isRemoteVideoView" className="text-sm text-gray-700">
              Allow Remote Video View
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="cursor-pointer px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer px-6 py-2 bg-primary hover:bg-primary text-white">
            Next
          </Button>
        </div>
      </form>
    </div>
  )
}
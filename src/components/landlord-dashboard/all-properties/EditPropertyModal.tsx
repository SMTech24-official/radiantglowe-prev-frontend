/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePropertyElementQuery } from "@/redux/api/propertyApi"
import { toast } from "sonner"
import { useUploadFileMutation } from "@/redux/api/uploaderApi"
import { LoaderIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

// Define static feature and access types
const featureTypes = [
  { id: "bills included", name: "Bills Included" },
  { id: "parking", name: "Parking" },
  { id: "garden access", name: "Garden Access" },
  { id: "gym", name: "Gym" },
  { id: "roof terrace", name: "Roof Terrace" },
  { id: "air conditioning", name: "Air Conditioning" },
  { id: "balcony", name: "Balcony" },
  { id: "washing machine", name: "Washing Machine" },
  { id: "pool", name: "Pool" },
  { id: "church", name: "Church" },
  { id: "mosque", name: "Mosque" },
  { id: "24/7 electricity", name: "24/7 Electricity" },
  { id: "garage", name: "Garage" },
  { id: "security", name: "Security" }
]

const accessTypes = [
  { id: "students", name: "Students" },
  { id: "families", name: "Families" },
  { id: "single", name: "Single" },
  { id: "couple", name: "Couple" },
  { id: "unemployed", name: "Unemployed" },
  { id: "smoker", name: "Smoker" },
  { id: "professional", name: "Professional" },
  { id: "pets", name: "Pets" },
]

// Define the PropertyFormData type
interface PropertyFormData {
  headlineYourProperty: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  livingRooms: number
  kitchen: number
  description?: string
  images: string[]
  status?: "available" | "rented" | "pending"
  features: string[]
  formAvailable: string
  furnished: "fully_furnished" | "unfurnished" | "semi_furnished"
  rentPerYear: number
  rentPerMonth: number
  rentPerDay: number
  serviceCharge: number
  depositAmount?: number
  minimumLengthOfContract?: number
  isReferenceRequired: boolean
  isRemoteVideoView: boolean
  accessYourProperty: string[]
  mediaLink?: string
  isAcceptTermsAndCondition: boolean
}

// Create form schema
const formSchema = z.object({
  headlineYourProperty: z.string().trim().min(1, { message: "Headline is required" }),
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
  features: z.array(z.string()).optional(),
  formAvailable: z.string().min(1, { message: "Available from date is required" }),
  furnished: z.enum(["fully_furnished", "unfurnished", "semi_furnished"]).optional(),
  rentPerYear: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Rent per year must be a non-negative number" })
  ),
  rentPerMonth: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Rent per month must be a non-negative number" })
  ),
  rentPerDay: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Rent per day must be a non-negative number" })
  ),
  serviceCharge: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().min(0, { message: "Service charge must be a non-negative number" })
  ),
  depositAmount: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().min(0, { message: "Deposit amount must be a non-negative number" }).optional()
  ),
  minimumLengthOfContract: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().min(0, { message: "Contract length must be a non-negative number" }).optional()
  ),
  isReferenceRequired: z.boolean().default(false),
  isRemoteVideoView: z.boolean().default(false),
  accessYourProperty: z.array(z.string()).min(1, { message: "At least one access type is required" }),
  mediaLink: z.string().optional(),
  isAcceptTermsAndCondition: z.boolean().default(false),
})

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

interface EditPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  property: any
  onUpdate: (id: string, data: PropertyFormData) => Promise<void>
  buttonLoading: boolean
}

export default function EditPropertyModal({ isOpen, onClose, property, onUpdate, buttonLoading }: EditPropertyModalProps) {
  const { data: propertyElementsData, isLoading: isElementsLoading } = usePropertyElementQuery() as {
    data: PropertyElementResponse | undefined
    isLoading: boolean
  }
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()

  const router = useRouter()
  const pathName = usePathname()

  const propertyTypes = propertyElementsData?.data?.propertyTypes?.map((pt) => ({
    title: pt.title,
    icon: pt.icon || "/placeholder.svg?height=20&width=20",
  })) || []

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedAccessTypes, setSelectedAccessTypes] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<string[]>([])
  const [imagesRawFile, setImagesRawFile] = useState<File[]>([])

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      headlineYourProperty: "",
      propertyType: "",
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
      kitchen: 0,
      description: "",
      images: [],
      status: "available",
      features: [],
      formAvailable: "",
      furnished: undefined,
      rentPerYear: 0,
      rentPerMonth: 0,
      rentPerDay: 0,
      serviceCharge: 0,
      depositAmount: undefined,
      minimumLengthOfContract: undefined,
      isReferenceRequired: false,
      isRemoteVideoView: false,
      accessYourProperty: [],
      mediaLink: "",
      isAcceptTermsAndCondition: false,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = form

  // Set default values when property changes
  useEffect(() => {
    if (property) {
      reset({
        headlineYourProperty: property.headlineYourProperty || "",
        propertyType: property.propertyType || "",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        livingRooms: property.livingRooms || 0,
        kitchen: property.kitchen || 0,
        description: property.description || "",
        images: property.images || [],
        status: property.status || "available",
        features: property.features || [],
        formAvailable: property.formAvailable || "",
        furnished: property.furnished || undefined,
        rentPerYear: property.rentPerYear || 0,
        rentPerMonth: property.rentPerMonth || 0,
        rentPerDay: property.rentPerDay || 0,
        serviceCharge: property.serviceCharge || 0,
        depositAmount: property.depositAmount || undefined,
        minimumLengthOfContract: property.minimumLengthOfContract || undefined,
        isReferenceRequired: property.isReferenceRequired || false,
        isRemoteVideoView: property.isRemoteVideoView || false,
        accessYourProperty: property.accessYourProperty || [],
        mediaLink: property.mediaLink || "",
        isAcceptTermsAndCondition: property.isAcceptTermsAndCondition || false,
      })
      setSelectedFeatures(property.features || [])
      setSelectedAccessTypes(property.accessYourProperty || [])
      setImageFiles(property.images || [])
      setImagesRawFile([])
    }
  }, [property, reset])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setImagesRawFile([...imagesRawFile, ...fileArray])
      const newImages = fileArray.map((file) => URL.createObjectURL(file))
      const updatedImages = [...imageFiles, ...newImages]
      setImageFiles(updatedImages)
      setValue("images", updatedImages)
    }
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

  const onSubmit: SubmitHandler<PropertyFormData> = async (data) => {
    try {
      // Validate property type
      const propertyTitlesList = propertyTypes.map(pt => pt.title)
      if (propertyTitlesList.length > 0 && !propertyTitlesList.includes(data.propertyType)) {
        toast.error("Invalid property type")
        return
      }

      // Upload new images if any
      if (imagesRawFile.length > 0) {
        const uploadFormData = new FormData()
        imagesRawFile.forEach((file) => uploadFormData.append("images", file))
        const uploadResponse = await uploadFile(uploadFormData).unwrap().catch((error) => {
          toast.error("Image upload failed")
          return
        })
        if (uploadResponse?.data) {
          data.images = [...imageFiles.filter(url => !url.startsWith('blob:')), ...uploadResponse.data]
        }
      }

      const newData = {
        ...data,
        location: property?.location
      }

      await onUpdate(property._id, newData)
      onClose()
      reset()
      setImageFiles(property?.images || [])
      setImagesRawFile([])
      setSelectedFeatures(property?.features || [])
      setSelectedAccessTypes(property?.accessYourProperty || [])
    } catch (error) {
      toast.error("Error updating property. Please try again.")
    }
  }

  if (isElementsLoading) {
    return <div>Loading...</div>
  }

  // Watch form values to get the current state of checkboxes
  const isReferenceRequired = watch("isReferenceRequired")
  const isRemoteVideoView = watch("isRemoteVideoView")
  const isAcceptTermsAndCondition = watch("isAcceptTermsAndCondition")

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
        reset()
        setImageFiles(property?.images || [])
        setImagesRawFile([])
        setSelectedFeatures(property?.features || [])
        setSelectedAccessTypes(property?.accessYourProperty || [])
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
            <Select
              onValueChange={(value) => setValue("propertyType", value)}
              defaultValue={property?.propertyType || ""}
            >
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <Input
                type="number"
                placeholder="Bedrooms"
                {...register("bedrooms")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <Input
                type="number"
                placeholder="Bathrooms"
                {...register("bathrooms")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Living Rooms</label>
              <Input
                type="number"
                placeholder="Living Rooms"
                {...register("livingRooms")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.livingRooms && <p className="text-red-500 text-sm mt-1">{errors.livingRooms.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kitchen</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Textarea
              placeholder="Description"
              rows={4}
              {...register("description")}
              className="border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
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
                    ${selectedFeatures.includes(feature.id)
                      ? "border-primary bg-background-secondary text-primary"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }
                  `}
                >
                  <span className="text-sm">{feature.name}</span>
                </button>
              ))}
            </div>
            {errors.features && <p className="text-red-500 text-sm mt-1">{errors.features.message}</p>}
          </div>

          {/* Available From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Furnished Status</label>
            <Select
              onValueChange={(value) => setValue("furnished", value as "fully_furnished" | "unfurnished" | "semi_furnished")}
              defaultValue={property?.furnished || ""}
            >
              <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0">
                <SelectValue placeholder="Select Furnished Status" />
              </SelectTrigger>
              <SelectContent>
                {["fully_furnished", "unfurnished", "semi_furnished"].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.furnished && <p className="text-red-500 text-sm mt-1">{errors.furnished.message}</p>}
          </div>

          {/* Rent and Charges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rent Per Year</label>
              <Input
                type="number"
                placeholder="Rent Per Year"
                {...register("rentPerYear")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.rentPerYear && <p className="text-red-500 text-sm mt-1">{errors.rentPerYear.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rent Per Month</label>
              <Input
                type="number"
                placeholder="Rent Per Month"
                {...register("rentPerMonth")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.rentPerMonth && <p className="text-red-500 text-sm mt-1">{errors.rentPerMonth.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rent Per Day</label>
              <Input
                type="number"
                placeholder="Rent Per Day"
                {...register("rentPerDay")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.rentPerDay && <p className="text-red-500 text-sm mt-1">{errors.rentPerDay.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Charge</label>
              <Input
                type="number"
                placeholder="Service Charge"
                {...register("serviceCharge")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.serviceCharge && <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount</label>
              <Input
                type="number"
                placeholder="Deposit Amount"
                {...register("depositAmount")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.depositAmount && <p className="text-red-500 text-sm mt-1">{errors.depositAmount.message}</p>}
            </div>
          </div>

          {/* Deposit Amount and Contract Length */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length of Contract (Months)</label>
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
                    ${selectedAccessTypes.includes(access.id)
                      ? "border-primary bg-background-secondary text-primary"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }
                  `}
                >
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Media Link</label>
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
                id="isReferenceRequired"
                {...register("isReferenceRequired")}
                checked={isReferenceRequired}
                onCheckedChange={(checked) => setValue("isReferenceRequired", !!checked)}
              />
              <label htmlFor="isReferenceRequired" className="text-sm text-gray-700">
                Reference Required
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isRemoteVideoView"
                {...register("isRemoteVideoView")}
                checked={isRemoteVideoView}
                onCheckedChange={(checked) => setValue("isRemoteVideoView", !!checked)}
              />
              <label htmlFor="isRemoteVideoView" className="text-sm text-gray-700">
                Remote Video View Available
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            {pathName.includes("admin-dashboard") ? null : (
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/packages")}
                className="cursor-pointer px-6 py-2 bg-yellow-600 text-white hover:bg-gray-50"
              >
                Take a Plan
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer px-6 py-2 bg-primary hover:bg-primary text-white">
              {buttonLoading || isUploading ? <LoaderIcon className="animate-spin" /> : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
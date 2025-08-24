"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect } from "react"

// Define the schema for form validation using Zod
const formSchema = z.object({
  propertiesOwnerName: z.string().min(1, { message: "Properties Owner Name is required." }),
  phoneNumber: z.string().min(10, { message: "Phone Number must be at least 10 digits." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  location: z.object({
    flatOrHouseNo: z.string().min(1, { message: "Flat or House Number is required." }),
    address: z.string().min(1, { message: "Address is required." }),
    state: z.string().min(1, { message: "State is required." }),
    city: z.string().min(1, { message: "City is required." }),
    town: z.string().min(1, { message: "Town is required." }),
    area: z.string().min(1, { message: "Area is required." }),
  }),
  zipCode: z.string().min(1, { message: "ZIP Code is required." }),
})

type FormData = z.infer<typeof formSchema>

export default function AddContactInfo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // Load default values from localStorage
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("propertyFormData") || "{}")
    if (storedData) {
      setValue("propertiesOwnerName", storedData.propertiesOwnerName || "")
      setValue("phoneNumber", storedData.phoneNumber || "")
      setValue("email", storedData.email || "")
      setValue("location.flatOrHouseNo", storedData.location?.flatOrHouseNo || "")
      setValue("location.address", storedData.location?.address || "")
      setValue("location.state", storedData.location?.state || "")
      setValue("location.city", storedData.location?.city || "")
      setValue("location.town", storedData.location?.town || "")
      setValue("location.area", storedData.location?.area || "")
      setValue("zipCode", storedData.zipCode || "")
    }
  }, [setValue])

  const onSubmit = (data: FormData) => {
    const propertyFormData = JSON.parse(localStorage.getItem("propertyFormData") || "{}")
    if (propertyFormData) {
      localStorage.setItem("propertyFormData", JSON.stringify({ ...propertyFormData, ...data }))
      toast.success("Data saved successfully!")
    } else {
      toast.error("Please fill up property information first!")
    }
  }

  const handleCancel = () => {
    reset()
  }

  return (
    <div className="w-full max-w-4xl bg-white lg:p-8 rounded-lg mb-12">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Properties Owner Name & Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              placeholder="Properties Owner Name"
              {...register("propertiesOwnerName")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.propertiesOwnerName && (
              <p className="text-red-500 text-sm mt-1">{errors.propertiesOwnerName.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Phone Number"
              type="tel"
              {...register("phoneNumber")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <Input
            placeholder="Email"
            type="email"
            {...register("email")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Location Fields */}
        <div className="space-y-6">
          <div>
            <Input
              placeholder="Flat or House Number"
              {...register("location.flatOrHouseNo")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.location?.flatOrHouseNo && (
              <p className="text-red-500 text-sm mt-1">{errors.location.flatOrHouseNo.message}</p>
            )}
          </div>
          <div>
            <Input
              placeholder="Address"
              {...register("location.address")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.location?.address && (
              <p className="text-red-500 text-sm mt-1">{errors.location.address.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Input
                placeholder="City"
                {...register("location.city")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.location?.city && (
                <p className="text-red-500 text-sm mt-1">{errors.location.city.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="State"
                {...register("location.state")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.location?.state && (
                <p className="text-red-500 text-sm mt-1">{errors.location.state.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="ZIP Code"
                {...register("zipCode")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                placeholder="Town"
                {...register("location.town")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.location?.town && (
                <p className="text-red-500 text-sm mt-1">{errors.location.town.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Area"
                {...register("location.area")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.location?.area && (
                <p className="text-red-500 text-sm mt-1">{errors.location.area.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="cursor-pointer px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary/80 text-white">
            ADD
          </Button>
        </div>
      </form>
    </div>
  )
}
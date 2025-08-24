/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the schema for form validation using Zod
const formSchema = z.object({
  status: z.string().min(1, { message: "Status is required." }),
  availableFrom: z.string().min(1, { message: "Available from date is required." }),
  bedrooms: z.string().min(1, { message: "Number of bedrooms is required." }),
  baths: z.string().min(1, { message: "Number of baths is required." }),
  livingRoom: z.string().min(1, { message: "Number of living rooms is required." }),
  kitchen: z.string().min(1, { message: "Number of kitchens is required." }),
  flatOrHouseNumber: z.string().min(1, { message: "Flat or House Number is required." }),
  address1: z.string().min(1, { message: "Address 1 is required." }),
  address2: z.string().optional(),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
  town: z.string().min(1, { message: "Town is required." }),
  areaCode: z.string().min(1, { message: "Area code is required." }),
  description: z.string().min(1, { message: "Description is required." }),
})

type FormData = z.infer<typeof formSchema>

// Options for dropdowns
const statusOptions = ["Available", "Occupied", "Under Maintenance", "Coming Soon"]
const roomNumbers = ["1", "2", "3", "4", "5", "6+"]

export default function PropertyListingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const watchedValues = watch()

  const onSubmit = (data: FormData) => {
    // alert("Form submitted successfully! Check the console for data.")
  }

  const handleCancel = () => {
    reset()
    // console.log("Form cancelled")
  }

  return (
    <div className="container mx-auto bg-white pb-8 md:px-6 rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Status and Available From */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select onValueChange={(value) => setValue("status", value)} value={watchedValues.status}>
              <SelectTrigger className="border-gray-300 focus:border-gray-400 focus:ring-0 w-full py-6 cursor-pointer">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
          </div>
          <div>
            <Input
              placeholder="Available from"
              {...register("availableFrom")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.availableFrom && <p className="text-red-500 text-sm mt-1">{errors.availableFrom.message}</p>}
          </div>
        </div>

        {/* Room Count Section */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-4">List number of each rooms:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Select onValueChange={(value) => setValue("bedrooms", value)} value={watchedValues.bedrooms}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full py-6 cursor-pointer">
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  {roomNumbers.map((number) => (
                    <SelectItem key={number} value={number}>
                      {number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message}</p>}
            </div>
            <div>
              <Select onValueChange={(value) => setValue("baths", value)} value={watchedValues.baths}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full py-6 cursor-pointer">
                  <SelectValue placeholder="Baths" />
                </SelectTrigger>
                <SelectContent>
                  {roomNumbers.map((number) => (
                    <SelectItem key={number} value={number}>
                      {number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.baths && <p className="text-red-500 text-sm mt-1">{errors.baths.message}</p>}
            </div>
            <div>
              <Select onValueChange={(value) => setValue("livingRoom", value)} value={watchedValues.livingRoom}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full py-6 cursor-pointer">
                  <SelectValue placeholder="Living room" />
                </SelectTrigger>
                <SelectContent>
                  {roomNumbers.map((number) => (
                    <SelectItem key={number} value={number}>
                      {number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.livingRoom && <p className="text-red-500 text-sm mt-1">{errors.livingRoom.message}</p>}
            </div>
            <div>
              <Select onValueChange={(value) => setValue("kitchen", value)} value={watchedValues.kitchen}>
                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full py-6 cursor-pointer">
                  <SelectValue placeholder="Kitchen" />
                </SelectTrigger>
                <SelectContent>
                  {roomNumbers.map((number) => (
                    <SelectItem key={number} value={number}>
                      {number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kitchen && <p className="text-red-500 text-sm mt-1">{errors.kitchen.message}</p>}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div>
          <Input
            placeholder="Flat or House Number ( kept private)*"
            {...register("flatOrHouseNumber")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.flatOrHouseNumber && <p className="text-red-500 text-sm mt-1">{errors.flatOrHouseNumber.message}</p>}
        </div>

        <div>
          <Input
            placeholder="Address 1"
            {...register("address1")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.address1 && <p className="text-red-500 text-sm mt-1">{errors.address1.message}</p>}
        </div>

        <div>
          <Input
            placeholder="Address 2"
            {...register("address2")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.address2 && <p className="text-red-500 text-sm mt-1">{errors.address2.message}</p>}
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="State"
              {...register("state")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
          </div>
          <div>
            <Input
              placeholder="City"
              {...register("city")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <Input
              placeholder="Town"
              {...register("town")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.town && <p className="text-red-500 text-sm mt-1">{errors.town.message}</p>}
          </div>
          <div>
            <Input
              placeholder="Area code"
              {...register("areaCode")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.areaCode && <p className="text-red-500 text-sm mt-1">{errors.areaCode.message}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <Textarea
            placeholder="Write Description Now"
            rows={4}
            {...register("description")}
            className="border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
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
            Next
          </Button>
        </div>
      </form>
    </div>
  )
}

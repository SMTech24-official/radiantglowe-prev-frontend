/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  country: z.string().min(1, "Please select a country"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Please enter a valid email address"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const countries = ["Nigeria"];

export default function BookingDetailsForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      country: "",
      address: "",
      city: "",
      zipCode: "",
      phoneNumber: "",
      email: "",
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: BookingFormData) => {
  };

  return (
    <div className="w-full lg:w-1/2 mx-auto p-6 bg-white">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Booking Details</h1>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="sr-only">
              First name
            </Label>
            <Input
              id="firstName"
              {...register("firstName")}
              placeholder="First name"
              className="h-14 bg-gray-50 border-gray-200 rounded-lg focus:border-primary focus:ring-primary text-gray-900 placeholder:text-gray-500"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="sr-only">
              Last name
            </Label>
            <Input
              id="lastName"
              {...register("lastName")}
              placeholder="Last name"
              className="h-14 bg-gray-50 border-gray-200 rounded-lg focus:border-primary focus:ring-primary text-gray-900 placeholder:text-gray-500"
            />
            {errors.lastName && (
              <p className="text-xs text-red-500">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country" className="sr-only">
            Country
          </Label>
          <Select
            value={watchedValues.country}
            onValueChange={(value) => setValue("country", value)}
          >
            <SelectTrigger className="w-full h-20 py-7 bg-gray-50 border-gray-200 rounded-lg focus:border-primary focus:ring-primary text-gray-900">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-xs text-red-500">{errors.country.message}</p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="city" className="sr-only">
            Address
          </Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="Address"
            className="h-14 bg-gray-50 border-gray-200 rounded-lg focus:border-primary focus:ring-primary text-gray-900 placeholder:text-gray-500"
          />
          {errors.address && (
            <p className="text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>

        {/* City & Zip Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city" className="sr-only">
              City
            </Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="City"
              className="h-14 bg-gray-50 border-gray-200 rounded-lg focus:border-primary focus:ring-primary text-gray-900 placeholder:text-gray-500"
            />
            {errors.city && (
              <p className="text-xs text-red-500">{errors.city.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode" className="sr-only">
              Zip Code
            </Label>
            <Input
              id="zipCode"
              {...register("zipCode")}
              placeholder="Zip Code"
              className="h-14 bg-gray-50 border-gray-200 rounded-lg focus:border-primary focus:ring-primary text-gray-900 placeholder:text-gray-500"
            />
            {errors.zipCode && (
              <p className="text-xs text-red-500">{errors.zipCode.message}</p>
            )}
          </div>
        </div>

        {/* Phone Number & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="sr-only">
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              {...register("phoneNumber")}
              placeholder="Phone Number"
              className="h-14 bg-gray-50 border-gray-200 rounded-lg focus:border-primary focus:ring-primary text-gray-900 placeholder:text-gray-500"
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Email"
              className="h-14 bg-gray-50 border-gray-200 rounded-lg focus:border-primary focus:ring-primary text-gray-900 placeholder:text-gray-500"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            className="cursor-pointer w-full md:w-auto px-8 h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg"
          >
            Submit Booking Details
          </Button>
        </div>
      </form>
    </div>
  );
}

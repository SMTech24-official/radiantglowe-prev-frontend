"use client";

import { PropertySchema } from "@/app/(defaultLayout)/add-properties/component/schemas";
import CityInput from "@/components/shared/input/CityInput";
import StateInput from "@/components/shared/input/StateInput";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Removed custom Select import
import { Skeleton } from "@/components/ui/skeleton";
import { usePropertyElementQuery } from "@/redux/api/propertyApi";
import Image from "next/image";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { UseFormReturn } from "react-hook-form";
import { MdClearAll } from "react-icons/md";

const roomNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20+"];

interface FirstStepProps {
  form: UseFormReturn<PropertySchema>;
  clearLocalStorage: () => void;
}

export default function FirstStep({ form, clearLocalStorage }: FirstStepProps) {

  const { register, formState: { errors }, setValue, watch, reset } = form;
  const { data, isLoading, isError } = usePropertyElementQuery();
  const [formAvailableDate, setFormAvailableDate] = useState<Date | null>(null);
  const [headlineWordCount, setHeadlineWordCount] = useState(0);

  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem("propertyFormData", JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    const savedData = localStorage.getItem("propertyFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);

      const safeData = {
        ...parsedData,
        bedrooms: parsedData.bedrooms !== undefined ? Number(parsedData.bedrooms) : 0,
        bathrooms: parsedData.bathrooms !== undefined ? Number(parsedData.bathrooms) : 0,
        livingRooms: parsedData.livingRooms !== undefined ? Number(parsedData.livingRooms) : 0,
        kitchen: parsedData.kitchen !== undefined ? Number(parsedData.kitchen) : 0,
      };
      reset(safeData);
      if (safeData.formAvailable) {
        setFormAvailableDate(new Date(safeData.formAvailable));
      }
      const words = safeData.headlineYourProperty?.trim().split(/\s+/) || [];
      setHeadlineWordCount(words.length);
    }
  }, [reset]);

  // Handle date change and update form value
  const handleDateChange = (date: Date | null) => {
    setFormAvailableDate(date);
    setValue("formAvailable", date ? date.toISOString().split("T")[0] : "");
  };

  const handleHeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const words = e.target.value.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 15) {
      setValue("headlineYourProperty", e.target.value);
      setHeadlineWordCount(words.length);
    }
  };

  const handleClearForm = () => {
    reset({
      status: "available",
      headlineYourProperty: "",
      propertyType: "",
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
      kitchen: 0,
      location: {
        flatOrHouseNo: "",
        address: "",
        state: "",
        city: "",
        town: "",
        area: "",
      },
      description: "",
      images: [],
      furnished: undefined,
      features: [],
      formAvailable: "",
      isIncludeAllUtilityWithService: false,
      minimumLengthOfContract: undefined,
      isReferenceRequired: false,
      accessYourProperty: [],
      mediaLink: "",
      isAcceptTermsAndCondition: false,
      isRemoteVideoView: false,
      rentPerYear: 0,
      rentPerMonth: 0,
      serviceCharge: 0,
      depositAmount: 0,
      gender: undefined,
      ages: undefined,
    });
    clearLocalStorage();
    setHeadlineWordCount(0);
    setFormAvailableDate(null);
  };

  return (
    <div className="container mx-auto lg:p-6 mb-5 space-y-8">
      {/* Clear Form Button */}
      <div className="">
        <p
          className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer underline"
          onClick={handleClearForm}
        >
          <MdClearAll /> Clear Form
        </p>
      </div>

      {/* Headline */}
      <div>
        <label className="block text-base font-medium text-gray-900 mb-4">
          Headline:
        </label>
        <Input
          placeholder="Write Headlines Now for your property (max 15 words)"
          value={watch("headlineYourProperty") || ""}
          onChange={handleHeadlineChange}
          className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
        />
        <p className="text-sm text-gray-500 mt-1">{headlineWordCount}/15 words</p>
        {errors.headlineYourProperty && (
          <p className="text-red-500 text-sm mt-1">{errors.headlineYourProperty.message || "This field is required"}</p>
        )}
      </div>

      {/* Property Type Selection */}
      <div>
        <h2 className="text-lg font-medium mb-4">Select Property Type </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Skeleton key={index} className="w-full h-32 rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-red-500 text-center p-4">
            Failed to load property types. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {data?.data?.propertyTypes?.map((type: { _id: string; title: string; icon: string }) => (
              <div key={type._id} className="aspect-[4/3] overflow-hidden">
                <Card
                  className={`w-full h-full cursor-pointer transition-all duration-200 hover:shadow-md ${watch("propertyType") === type.title ? "border border-primary bg-primary/10" : "border border-gray-200"}`}
                  onClick={() => setValue("propertyType", type.title)}
                >
                  <CardContent className="px-6 flex flex-col items-start justify-center gap-3 h-full relative">
                    <div className="relative w-8 h-8">
                      <Image
                        src={type.icon || "/placeholder.svg"}
                        alt={type.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <h3
                      className="text-lg font-medium text-gray-900 leading-tight w-full whitespace-normal"
                      dangerouslySetInnerHTML={{ __html: type.title.replace("/", "/<wbr>") }}
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
        {errors.propertyType && (
          <p className="text-red-500 text-sm mt-1">{errors.propertyType.message || "This field is required"}</p>
        )}
      </div>

      {/* Room Count */}
      <div>
        <label className="block text-base font-medium text-gray-900 mb-4">
          List number of each rooms :
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-500 mb-4">Bedrooms:</label>
            <select
              {...register("bedrooms", { valueAsNumber: true })}
              className="h-12 border border-gray-300 focus:border-gray-400 focus:ring-0 w-full rounded-md p-2"
            >
              {roomNumbers.map((number) => (
                <option key={number} value={number === "20+" ? 20 : number}>{number}</option>
              ))}
            </select>
            {errors.bedrooms && (
              <p className="text-red-500 text-sm mt-1">{errors.bedrooms.message || "This field is required"}</p>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-500 mb-4">Baths/ Toilets:</label>
            <select
              {...register("bathrooms", { valueAsNumber: true })}
              className="h-12 border border-gray-300 focus:border-gray-400 focus:ring-0 w-full rounded-md p-2"
            >
              {roomNumbers.map((number) => (
                <option key={number} value={number === "20+" ? 20 : number}>{number}</option>
              ))}
            </select>
            {errors.bathrooms && (
              <p className="text-red-500 text-sm mt-1">{errors.bathrooms.message || "This field is required"}</p>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-500 mb-4">Living Rooms:</label>
            <select
              {...register("livingRooms", { valueAsNumber: true })}
              className="h-12 border border-gray-300 focus:border-gray-400 focus:ring-0 w-full rounded-md p-2"
            >
              {roomNumbers.map((number) => (
                <option key={number} value={number === "20+" ? 20 : number}>{number}</option>
              ))}
            </select>
            {errors.livingRooms && (
              <p className="text-red-500 text-sm mt-1">{errors.livingRooms.message || "This field is required"}</p>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-500 mb-4">Kitchen:</label>
            <select
              {...register("kitchen", { valueAsNumber: true })}
              className="h-12 border border-gray-300 focus:border-gray-400 focus:ring-0 w-full rounded-md p-2"
            >
              {roomNumbers.map((number) => (
                <option key={number} value={number === "20+" ? 20 : number}>{number}</option>
              ))}
            </select>
            {errors.kitchen && (
              <p className="text-red-500 text-sm mt-1">{errors.kitchen.message || "This field is required"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Available Date */}
      <div>
        <label className="block text-base font-medium text-gray-900 mb-2">
          Available Date :
        </label>
        <DatePicker
          selected={formAvailableDate}
          onChange={handleDateChange}
          dateFormat="dd-MM-yy"
          placeholderText="Select available date (YYYY-MM-DD)"
          className="h-12 w-full border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md p-2"
          minDate={new Date()}
        />
        {errors.formAvailable && (
          <p className="text-red-500 text-sm mt-1">{errors.formAvailable.message || "This field is required"}</p>
        )}
      </div>

      {/* Location Details */}
      <div className="space-y-4">
        <label className="block text-base font-medium text-gray-900 mb-2">
          Location :
        </label>
        <label className="block text-base font-medium text-gray-500 mb-4">
          Flat or House No:
        </label>
        <Input
          placeholder="Flat or House Number (kept private)"
          {...register("location.flatOrHouseNo")}
          className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
        />
        <label className="block text-base font-medium text-gray-500 mb-4">
          Address :
        </label>
        <Input
          placeholder="Address"
          {...register("location.address")}
          className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
        />
        {errors.location?.address && (
          <p className="text-red-500 text-sm mt-1">{errors.location.address.message || "This field is required"}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-base font-medium text-gray-500 mb-4">
              State :
            </label>
            <StateInput
              form={form}
              name="location.state"
              placeholder="State"
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            {errors.location?.state && (
              <p className="text-red-500 text-sm mt-1">{errors.location.state.message || "This field is required"}</p>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-500 mb-4">
              City :
            </label>
            <CityInput
              form={form}
              name="location.city"
              placeholder="City"
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            {errors.location?.city && (
              <p className="text-red-500 text-sm mt-1">{errors.location.city.message || "This field is required"}</p>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-500 mb-4">
              Town :
            </label>
            <Input
              placeholder="Town"
              {...register("location.town")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            {errors.location?.town && (
              <p className="text-red-500 text-sm mt-1">{errors.location.town.message || "This field is required"}</p>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-500 mb-4">
              Area:
            </label>
            <Input
              placeholder="Area code"
              {...register("location.area")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            {errors.location?.area && (
              <p className="text-red-500 text-sm mt-1">{errors.location.area.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-base font-medium text-gray-500 mb-4">
          Description :
        </label>
        <textarea
          placeholder="Write Description Now"
          {...register("description")}
          className="w-full h-32 border border-gray-300 focus:border-gray-400 focus:ring-0 rounded-md p-2"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message || "This field is required"}</p>
        )}
      </div>
    </div>
  );
}
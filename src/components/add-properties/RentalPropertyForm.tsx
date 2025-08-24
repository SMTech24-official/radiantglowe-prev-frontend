/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { PropertySchema } from "@/app/(defaultLayout)/add-properties/component/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { MdClearAll } from "react-icons/md";

const furnishedOptions = ["fully_furnished", "semi_furnished", "unfurnished"];
const contractOptions = ["1 Month", "3 Months", "6 Months", "1 Year", "2 Years", "Flexible"];
const valueMap: { [key: string]: number | undefined } = {
  "1 Month": 1,
  "3 Months": 3,
  "6 Months": 6,
  "1 Year": 12,
  "2 Years": 24,
  "Flexible": undefined,
};
const referenceOptions = ["Required", "Not Required", "Preferred"];

interface RentalPropertyFormProps {
  form: UseFormReturn<PropertySchema>;
  clearLocalStorage: () => void;
  handleBack?: () => void;
}

export default function RentalPropertyForm({ form, clearLocalStorage, handleBack }: RentalPropertyFormProps) {
  const { register, setValue, watch, formState: { errors }, reset } = form;

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
      rentPerDay: 0,
      serviceCharge: 0,
      depositAmount: 0,
      gender: undefined,
      ages: undefined,
    });
    clearLocalStorage();
    handleBack?.();
  };

  return (
    <div className="container mx-auto bg-white md:p-8 rounded-lg space-y-6">
      {/* Clear Form Button */}
      <div className="">
        <p
          className="flex items-center gap-1 text-sm text-gray-600 cursor-pointer underline"
          onClick={handleClearForm}
        >
          <MdClearAll /> Clear Form
        </p>
      </div>

      {/* Furnished and Rent Per Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-base font-medium text-gray-900 mb-4">
            Furnished :
          </label>
          <Select
            onValueChange={(value) => setValue("furnished", value as "fully_furnished" | "semi_furnished" | "unfurnished")}
            value={watch("furnished") || ""}
          >
            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full">
              <SelectValue placeholder="Furnished" />
            </SelectTrigger>
            <SelectContent>
              {furnishedOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.furnished && (
            <p className="text-red-500 text-sm mt-1">{errors.furnished.message || "This field is required"}</p>
          )}
        </div>
        <div>
          <label className="block text-base font-medium text-gray-900 mb-4">
            ₦ Rent Per Year :
          </label>
          <Input
            min={0}
            type="number"
            placeholder="₦ Rent Per Year"
            {...register("rentPerYear", { valueAsNumber: true })}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full"
          />
          {errors.rentPerYear && (
            <p className="text-red-500 text-sm mt-1">{errors.rentPerYear.message || "This field is required"}</p>
          )}
        </div>
      </div>

      {/* Rent Per Month and Service Charge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-base font-medium text-gray-900 mb-4">
            ₦ Rent Per Month:
          </label>
          <Input
            min={0}
            type="number"
            placeholder="₦ Rent Per Month"
            {...register("rentPerMonth", { valueAsNumber: true })}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full"
          />
          {errors.rentPerMonth && (
            <p className="text-red-500 text-sm mt-1">{errors.rentPerMonth.message || "This field is required"}</p>
          )}
        </div>
        <div>
          <label className="block text-base font-medium text-gray-900 mb-4">
            ₦ Rent Per Day:
          </label>
          <Input
            min={0}
            type="number"
            placeholder="₦ Rent Per Day"
            defaultValue={0}
            {...register("rentPerDay", { valueAsNumber: true })}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full"
          />
          {errors.rentPerDay && (
            <p className="text-red-500 text-sm mt-1">{errors.rentPerDay.message || "This field is required"}</p>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Amount */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-4">
            ₦ Deposit Amount:
          </label>
          <Input
            min={0}
            type="number"
            placeholder="₦ Deposit Amount"
            {...register("depositAmount", { valueAsNumber: true })}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full"
          />
          {errors.depositAmount && (
            <p className="text-red-500 text-sm mt-1">{errors.depositAmount.message || "This field is required"}</p>
          )}
        </div>
        <div>
          <label className="block text-base font-medium text-gray-900 mb-4">
            ₦ Service Charge:
          </label>
          <Input
            min={0}
            type="number"
            placeholder="₦ Service Charge"
            {...register("serviceCharge", { valueAsNumber: true })}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full"
          />
          {errors.serviceCharge && (
            <p className="text-red-500 text-sm mt-1">{errors.serviceCharge.message || "This field is required"}</p>
          )}
        </div>
      </div>



      {/* Include Bill */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="isIncludeAllUtilityWithService"
          checked={watch("isIncludeAllUtilityWithService") || false}
          onCheckedChange={(checked) => setValue("isIncludeAllUtilityWithService", checked as boolean)}
        />
        {/* style when active text is checked */}
        <label htmlFor="isIncludeAllUtilityWithService" className={`-mt-1 text-sm ${watch("isIncludeAllUtilityWithService") ? "text-primary" : "text-gray-700"}`}>
          Include bill (rent includes all utility bills and service charges)
        </label>
      </div>

      {/* Minimum Contract and Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Minimum Contract:
          </label>
          <Select
            onValueChange={(value) => setValue("minimumLengthOfContract", valueMap[value])}
            value={
              Object.entries(valueMap).find(
                ([key, val]) => val === watch("minimumLengthOfContract")
              )?.[0] || "Flexible"
            }
          >
            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full">
              <SelectValue placeholder="Minimum length of contract" />
            </SelectTrigger>
            <SelectContent>
              {contractOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.minimumLengthOfContract && (
            <p className="text-red-500 text-sm mt-1">{errors.minimumLengthOfContract.message}</p>
          )}
        </div>
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Reference:
          </label>
          <Select
            onValueChange={(value) => setValue("isReferenceRequired", value === "Required")}
            value={watch("isReferenceRequired") ? "Required" : "Not Required"}
          >
            <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full">
              <SelectValue placeholder="Reference required" />
            </SelectTrigger>
            <SelectContent>
              {referenceOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.isReferenceRequired && (
            <p className="text-red-500 text-sm mt-1">{errors.isReferenceRequired.message || "This field is required"}</p>
          )}
        </div>
        <div>
          <Checkbox
            id="isRemoteVideoView"
            checked={watch("isRemoteVideoView") || false}
            onCheckedChange={(checked) => setValue("isRemoteVideoView", checked as boolean)}
          />
          {/* design when active text is checked */}
          <span className={`ml-2 -mt-2 text-sm ${watch("isRemoteVideoView") ? "text-primary" : "text-gray-700"}`}>
            Remote Video View
          </span>
        </div>
      </div>
    </div>
  );
}
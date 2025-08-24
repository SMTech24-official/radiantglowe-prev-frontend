/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePropertyElementQuery } from "@/redux/api/propertyApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";


export default function AddPropertiesPage() {
  const { data: property } = usePropertyElementQuery();
  const router = useRouter();
  const [selectedPropertyType, setSelectedPropertyType] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState({
    headline: "",
    status: "",
    availableFrom: "",
    bedrooms: "",
    baths: "",
    livingRoom: "",
    kitchen: "",
    flatNumber: "",
    address1: "",
    address2: "",
    state: "",
    city: "",
    town: "",
    areaCode: "",
    description: "",
    propertyType: "",
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("propertyFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData);
      if (parsedData.propertyType) {
        setSelectedPropertyType(parsedData.propertyType);
      }
    }
  }, []);

  // Save data to localStorage whenever formData changes


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePropertyTypeSelect = (typeId: string) => {
    setSelectedPropertyType(typeId);
    handleInputChange("propertyType", typeId);
  };

  const validateForm = () => {
    if (!selectedPropertyType) {
      toast.error("Please select a property type");
      return false;
    }

    const requiredFields = [
      "headline",
      "status",
      "availableFrom",
      "bedrooms",
      "baths",
      "address1",
      "state",
      "city",
      "description",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(
          `Please fill in the ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} field`
        );
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    localStorage.setItem("propertyFormData", JSON.stringify(formData));
    if (validateForm()) {
      // Proceed to next step or submit the form
      toast.success("Form validated successfully!");
      router.push("/add-properties");
      // Here you would typically navigate to the next step or submit the data
    }
  };

  return (
    <div>
      <Breadcrumb
        title="List your property"
        shortDescription="Your guide to resolving any issues and getting the most out of our platform. We're here to assist you at every step!"
      />

      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <h1 className="text-center text-2xl md:text-4xl font-semibold">
          List your property{" "}
        </h1>
        <p className="text-center">
          Ready to turn your property into a top listing? Fill out the form
          below and get started today!
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <Input
          placeholder="Write Headlines Now for your property"
          className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          value={formData.headline}
          onChange={(e) => handleInputChange("headline", e.target.value)}
          required
        />

        <div className="mt-10">
          <h2 className="text-[#180D03] text-3xl font-bold mb-8">
            Which of these best describes your place?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {property?.data?.propertyTypes.map((type: any) => (
              <div
                key={type.id}
                className={`
                  border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-md
                  ${
                    selectedPropertyType === type._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }
                `}
                onClick={() => handlePropertyTypeSelect(type._id)}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  {type.icon && (
                    <div className="w-12 h-12 flex items-center justify-center">
                      <Image
                        width={48}
                        height={48}
                        src={type.icon || "/placeholder.svg"}
                        alt={type.name}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="capitalize  text-sm font-medium text-gray-700">
                    {type.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Status and Available From */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full">
            <div className="w-full">
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                required
              >
                <SelectTrigger className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 w-full py-6 cursor-pointer">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full">
              <Input
                placeholder="Available from"
                type="date"
                className="h-12"
                value={formData.availableFrom}
                onChange={(e) =>
                  handleInputChange("availableFrom", e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Room Details */}
          <div className="mb-6 w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              List number of each rooms:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="w-full">
                <Select
                  value={formData.bedrooms}
                  onValueChange={(value) =>
                    handleInputChange("bedrooms", value)
                  }
                  required
                >
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Select
                  value={formData.baths}
                  onValueChange={(value) => handleInputChange("baths", value)}
                  required
                >
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Baths" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Select
                  value={formData.livingRoom}
                  onValueChange={(value) =>
                    handleInputChange("livingRoom", value)
                  }
                >
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Living room" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <Select
                  value={formData.kitchen}
                  onValueChange={(value) => handleInputChange("kitchen", value)}
                >
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Kitchen" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4 mb-6">
            <Input
              placeholder="Flat or House Number ( kept private)*"
              className="h-12"
              value={formData.flatNumber}
              onChange={(e) => handleInputChange("flatNumber", e.target.value)}
            />

            <Input
              placeholder="Address 1"
              className="h-12"
              value={formData.address1}
              onChange={(e) => handleInputChange("address1", e.target.value)}
              required
            />

            <Input
              placeholder="Address 2"
              className="h-12"
              value={formData.address2}
              onChange={(e) => handleInputChange("address2", e.target.value)}
            />
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full">
            <div className="w-full">
              <Input
                placeholder="State"
                className="h-12 w-full"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                required
              />
            </div>

            <div className="w-full">
              <Input
                placeholder="City"
                className="h-12 w-full"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </div>

            <div className="w-full">
              <Input
                placeholder="Town"
                className="h-12 w-full"
                value={formData.town}
                onChange={(e) => handleInputChange("town", e.target.value)}
              />
            </div>

            <div className="w-full">
              <Input
                placeholder="Area code"
                className="h-12 w-full"
                value={formData.areaCode}
                onChange={(e) => handleInputChange("areaCode", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <Textarea
              placeholder="Write Description Now"
              className="min-h-[120px] resize-none"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
          </div>
          <div className="flex justify-center pt-4 pb-18 gap-4">
            <button
              className="font-light rounded-[8px] text-base px-4 py-2 border border-[#A2A1A833]"
              onClick={() => {
                localStorage.removeItem("propertyFormData");
                setFormData({
                  headline: "",
                  status: "",
                  availableFrom: "",
                  bedrooms: "",
                  baths: "",
                  livingRoom: "",
                  kitchen: "",
                  flatNumber: "",
                  address1: "",
                  address2: "",
                  state: "",
                  city: "",
                  town: "",
                  areaCode: "",
                  description: "",
                  propertyType: "",
                });
                setSelectedPropertyType(null);
                toast.success("Form cleared!");
              }}
            >
              Cancel
            </button>
            <button
              className="font-light rounded-[8px] hover:bg-[#B07E50]/80  px-5 text-white py-2 bg-[#B07E50]"
              onClick={handleNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

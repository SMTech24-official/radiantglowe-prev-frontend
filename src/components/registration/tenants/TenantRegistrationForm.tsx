/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import CityInput from "@/components/shared/input/CityInput";
import StateInput from "@/components/shared/input/StateInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePropertyElementQuery } from "@/redux/api/propertyApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export interface IAddress {
  flatOrHouseNo?: string;
  address?: string;
  state?: string;
  city?: string;
  town?: string;
  area?: string;
}

export interface IGuarantor {
  name?: string;
  telephone?: string;
  email?: string;
  profession?: string;
  address?: Omit<IAddress, "flatOrHouseNo">;
}

export interface IReference {
  name?: string;
  telephone?: string;
  email?: string;
  profession?: string;
  address?: Omit<IAddress, "flatOrHouseNo">;
}

const tenantRegistrationSchema = z.object({
  forename: z.string().min(1, "Forename is required"),
  otherNames: z.string().optional(),
  surname: z.string().min(1, "Surname is required"),
  telephone: z.string().min(10, "Telephone must be at least 10 digits").max(15),
  email: z.string().email("Please enter a valid email address"),
  lookingPropertyForTenant: z.array(z.string()).optional(),
  currentAddress: z
    .object({
      flatOrHouseNo: z.string().optional(),
      address: z.string().optional(),
      state: z.string().optional(),
      city: z.string().optional(),
      town: z.string().optional(),
      area: z.string().optional(),
    })
    .optional(),
  guarantor: z
    .object({
      name: z.string().optional(),
      telephone: z.string().optional(),
      email: z.string().optional(),
      profession: z.string().optional(),
      address: z
        .object({
          address: z.string().optional(),
          state: z.string().optional(),
          city: z.string().optional(),
          town: z.string().optional(),
          area: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  references: z
    .array(
      z.object({
        name: z.string().optional(),
        telephone: z.string().optional(),
        email: z.string().optional(),
        profession: z.string().optional(),
        address: z
          .object({
            address: z.string().optional(),
            state: z.string().optional(),
            city: z.string().optional(),
            town: z.string().optional(),
            area: z.string().optional(),
          })
          .optional(),
      })
    )
    .length(2, "Exactly two references are required")
    .optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface TenantRegistrationFormProps {
  onNext: (data: TenantRegistrationFormData) => void;
}

type TenantRegistrationFormData = z.infer<typeof tenantRegistrationSchema>;

export default function TenantRegistrationForm({ onNext }: TenantRegistrationFormProps) {
  const [expandedSections, setExpandedSections] = useState({
    currentAddress: false,
    guarantor: false,
    reference1: false,
    reference2: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const registerData = JSON.parse(localStorage.getItem("registerData") || "{}");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = usePropertyElementQuery();

  // Transform API data to match the expected format
  const propertyTypes = data?.data?.propertyTypes?.map((type: any) => ({
    id: type._id,
    name: type.title.charAt(0).toUpperCase() + type.title.slice(1),
    icon: type.icon,
  })) || [];

  const form = useForm<TenantRegistrationFormData>({
    resolver: zodResolver(tenantRegistrationSchema),
    defaultValues: {
      forename: "",
      otherNames: "",
      surname: "",
      telephone: "",
      email: registerData.email || "",
      lookingPropertyForTenant: ["Room"],
      currentAddress: {
        flatOrHouseNo: "",
        address: "",
        state: "",
        city: "",
        town: "",
        area: "",
      },
      guarantor: {
        name: "",
        telephone: "",
        email: "",
        profession: "",
        address: {
          address: "",
          state: "",
          city: "",
          town: "",
          area: "",
        },
      },
      references: [
        {
          name: "",
          telephone: "",
          email: "",
          profession: "",
          address: {
            address: "",
            state: "",
            city: "",
            town: "",
            area: "",
          },
        },
        {
          name: "",
          telephone: "",
          email: "",
          profession: "",
          address: {
            address: "",
            state: "",
            city: "",
            town: "",
            area: "",
          },
        },
      ],
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const selectedPropertyTypes = watch("lookingPropertyForTenant") || [];

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPropertyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSubmit = (data: TenantRegistrationFormData) => {
    onNext(data);
  };

  const handleCancel = () => {
    // Handle cancel logic
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePropertyTypeChange = (value: string) => {
    const currentValues = selectedPropertyTypes || [];
    let updatedValues: string[];
    if (currentValues.includes(value)) {
      updatedValues = currentValues.filter((type) => type !== value);
    } else {
      updatedValues = [...currentValues, value];
    }
    setValue("lookingPropertyForTenant", updatedValues, { shouldValidate: true });
  };

  return (
    <div className="container mx-auto px-6 py-16 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Tenant&apos;s registration form</h1>
        <p className="text-gray-600 text-sm">Register to Find Your Perfect Home - Easy, Quick, and Secure</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-900">Forename</Label>
              <Input
                {...register("forename")}
                placeholder="Forename"
                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
              />
              {errors.forename && <p className="text-xs text-red-500">{errors.forename.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-900">Other Name</Label>
              <Input
                {...register("otherNames")}
                placeholder="Other names"
                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
              />
              {errors.otherNames && <p className="text-xs text-red-500">{errors.otherNames.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-900">Surname</Label>
              <Input
                {...register("surname")}
                placeholder="Surname"
                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
              />
              {errors.surname && <p className="text-xs text-red-500">{errors.surname.message}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-900 mb-1">Telephone</Label>
            <Input
              {...register("telephone")}
              placeholder="Telephone"
              className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
            />
            {errors.telephone && <p className="text-xs text-red-500">{errors.telephone.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-900 mb-1">Email</Label>
            <Input
              readOnly
              {...register("email")}
              type="email"
              placeholder="Email"
              className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="relative">
              <Label className="text-sm font-medium text-gray-900 mb-1">Password</Label>
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 top-5 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <div className="relative">
              <Label className="text-sm font-medium text-gray-900 mb-1">Confirm Password</Label>
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 top-5 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <div className="space-y-2" ref={dropdownRef}>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-900 mb-1">Looking Property</Label>
            <div className="relative">
              <Input
                readOnly
                value={selectedPropertyTypes.join(", ") || "Select property types"}
                onClick={() => !isLoading && !isError && setIsPropertyDropdownOpen(!isPropertyDropdownOpen)}
                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary cursor-pointer"
                placeholder={isLoading ? "Loading..." : isError ? "Error loading property types" : "Select property types"}
                disabled={isLoading || isError}
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            {isPropertyDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {propertyTypes.map((type: { id: string; name: string; icon?: string }) => (
                  <div
                    key={type.id}
                    className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                      selectedPropertyTypes.includes(type.name) ? "bg-primary/10" : ""
                    }`}
                    onClick={() => handlePropertyTypeChange(type.name)}
                  >
                    {/* {type.icon && <span className="mr-2">{type.icon}</span>} */}
                    <span>{type.name}</span>
                    {selectedPropertyTypes.includes(type.name) && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {errors.lookingPropertyForTenant && (
              <p className="text-xs text-red-500">{errors.lookingPropertyForTenant.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {!expandedSections.currentAddress ? (
            <button
              type="button"
              onClick={() => toggleSection("currentAddress")}
              className="cursor-pointer flex items-center justify-between transition-colors text-left"
            >
              <span className="text-gray-700">
                Current Address <span className="text-gray-500">(optional)</span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Current Address <span className="text-gray-500">(optional)</span>
                </Label>
                <button
                  type="button"
                  onClick={() => toggleSection("currentAddress")}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Flat or House Number</Label>
                  <Input
                    {...register("currentAddress.flatOrHouseNo")}
                    placeholder="Flat or House Number"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.currentAddress?.flatOrHouseNo && (
                    <p className="text-xs text-red-500">{errors.currentAddress.flatOrHouseNo.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Address</Label>
                  <Input
                    {...register("currentAddress.address")}
                    placeholder="Address"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.currentAddress?.address && (
                    <p className="text-xs text-red-500">{errors.currentAddress.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">State</Label>
                    <StateInput
                      form={form}
                      placeholder="State"
                      name="currentAddress.state"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.currentAddress?.state && (
                      <p className="text-xs text-red-500">{errors.currentAddress.state.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">City</Label>
                    <CityInput
                      form={form}
                      name="currentAddress.city"
                      placeholder="City"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.currentAddress?.city && (
                      <p className="text-xs text-red-500">{errors.currentAddress.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">Town</Label>
                    <Input
                      {...register("currentAddress.town")}
                      placeholder="Town"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.currentAddress?.town && (
                      <p className="text-xs text-red-500">{errors.currentAddress.town.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Area</Label>
                  <Input
                    {...register("currentAddress.area")}
                    placeholder="Area code"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.currentAddress?.area && (
                    <p className="text-xs text-red-500">{errors.currentAddress.area.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!expandedSections.guarantor ? (
            <button
              type="button"
              onClick={() => toggleSection("guarantor")}
              className="cursor-pointer flex items-center justify-between transition-colors text-left"
            >
              <span className="text-gray-700">
                Guarantor <span className="text-gray-500">(optional)</span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Guarantor <span className="text-gray-500">(optional)</span>
                </Label>
                <button
                  type="button"
                  onClick={() => toggleSection("guarantor")}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Name</Label>
                  <Input
                    {...register("guarantor.name")}
                    placeholder="Guarantor Name"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.guarantor?.name && <p className="text-xs text-red-500">{errors.guarantor.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Telephone</Label>
                  <Input
                    {...register("guarantor.telephone")}
                    placeholder="Guarantor Telephone"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.guarantor?.telephone && (
                    <p className="text-xs text-red-500">{errors.guarantor.telephone.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Email</Label>
                  <Input
                    {...register("guarantor.email")}
                    placeholder="Guarantor Email"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.guarantor?.email && <p className="text-xs text-red-500">{errors.guarantor.email.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Profession</Label>
                  <Input
                    {...register("guarantor.profession")}
                    placeholder="Guarantor Profession"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.guarantor?.profession && (
                    <p className="text-xs text-red-500">{errors.guarantor.profession.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Address</Label>
                  <Input
                    {...register("guarantor.address.address")}
                    placeholder="Address"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.guarantor?.address?.address && (
                    <p className="text-xs text-red-500">{errors.guarantor.address.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">State</Label>
                    <StateInput
                      form={form}
                      placeholder="State"
                      name="guarantor.address.state"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.guarantor?.address?.state && (
                      <p className="text-xs text-red-500">{errors.guarantor.address.state.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">City</Label>
                    <CityInput
                      form={form}
                      name="guarantor.address.city"
                      placeholder="City"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.guarantor?.address?.city && (
                      <p className="text-xs text-red-500">{errors.guarantor.address.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">Town</Label>
                    <Input
                      {...register("guarantor.address.town")}
                      placeholder="Town"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.guarantor?.address?.town && (
                      <p className="text-xs text-red-500">{errors.guarantor.address.town.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Area</Label>
                  <Input
                    {...register("guarantor.address.area")}
                    placeholder="Area code"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.guarantor?.address?.area && (
                    <p className="text-xs text-red-500">{errors.guarantor.address.area.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!expandedSections.reference1 ? (
            <button
              type="button"
              onClick={() => toggleSection("reference1")}
              className="cursor-pointer flex items-center justify-between transition-colors text-left"
            >
              <span className="text-gray-700">
                Reference 1 <span className="text-gray-500">(optional)</span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Reference 1 <span className="text-gray-500">(optional)</span>
                </Label>
                <button
                  type="button"
                  onClick={() => toggleSection("reference1")}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Name</Label>
                  <Input
                    {...register("references.0.name")}
                    placeholder="Reference 1 Name"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[0]?.name && (
                    <p className="text-xs text-red-500">{errors.references[0].name.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Telephone</Label>
                  <Input
                    {...register("references.0.telephone")}
                    placeholder="Reference 1 Telephone"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[0]?.telephone && (
                    <p className="text-xs text-red-500">{errors.references[0].telephone.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Email</Label>
                  <Input
                    {...register("references.0.email")}
                    placeholder="Reference 1 Email"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[0]?.email && (
                    <p className="text-xs text-red-500">{errors.references[0].email.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Profession</Label>
                  <Input
                    {...register("references.0.profession")}
                    placeholder="Reference 1 Profession"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[0]?.profession && (
                    <p className="text-xs text-red-500">{errors.references[0].profession.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Address</Label>
                  <Input
                    {...register("references.0.address.address")}
                    placeholder="Address"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[0]?.address?.address && (
                    <p className="text-xs text-red-500">{errors.references[0].address.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">State</Label>
                    <StateInput
                      form={form}
                      placeholder="State"
                      name="references.0.address.state"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.references?.[0]?.address?.state && (
                      <p className="text-xs text-red-500">{errors.references[0].address.state.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">City</Label>
                    <CityInput
                      form={form}
                      name="references.0.address.city"
                      placeholder="City"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.references?.[0]?.address?.city && (
                      <p className="text-xs text-red-500">{errors.references[0].address.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">Town</Label>
                    <Input
                      {...register("references.0.address.town")}
                      placeholder="Town"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.references?.[0]?.address?.town && (
                      <p className="text-xs text-red-500">{errors.references[0].address.town.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Area</Label>
                  <Input
                    {...register("references.0.address.area")}
                    placeholder="Area code"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[0]?.address?.area && (
                    <p className="text-xs text-red-500">{errors.references[0].address.area.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {!expandedSections.reference2 ? (
            <button
              type="button"
              onClick={() => toggleSection("reference2")}
              className="cursor-pointer flex items-center justify-between transition-colors text-left"
            >
              <span className="text-gray-700">
                Reference 2 <span className="text-gray-500">(optional)</span>
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium text-gray-700">
                  Reference 2 <span className="text-gray-500">(optional)</span>
                </Label>
                <button
                  type="button"
                  onClick={() => toggleSection("reference2")}
                  className="cursor-pointer text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Name</Label>
                  <Input
                    {...register("references.1.name")}
                    placeholder="Reference 2 Name"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[1]?.name && (
                    <p className="text-xs text-red-500">{errors.references[1].name.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Telephone</Label>
                  <Input
                    {...register("references.1.telephone")}
                    placeholder="Reference 2 Telephone"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[1]?.telephone && (
                    <p className="text-xs text-red-500">{errors.references[1].telephone.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Email</Label>
                  <Input
                    {...register("references.1.email")}
                    placeholder="Reference 2 Email"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[1]?.email && (
                    <p className="text-xs text-red-500">{errors.references[1].email.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Profession</Label>
                  <Input
                    {...register("references.1.profession")}
                    placeholder="Reference 2 Profession"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[1]?.profession && (
                    <p className="text-xs text-red-500">{errors.references[1].profession.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Address</Label>
                  <Input
                    {...register("references.1.address.address")}
                    placeholder="Address"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[1]?.address?.address && (
                    <p className="text-xs text-red-500">{errors.references[1].address.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">State</Label>
                    <StateInput
                      form={form}
                      placeholder="State"
                      name="references.1.address.state"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.references?.[1]?.address?.state && (
                      <p className="text-xs text-red-500">{errors.references[1].address.state.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">City</Label>
                    <CityInput
                      form={form}
                      name="references.1.address.city"
                      placeholder="City"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.references?.[1]?.address?.city && (
                      <p className="text-xs text-red-500">{errors.references[1].address.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-500 mb-1">Town</Label>
                    <Input
                      {...register("references.1.address.town")}
                      placeholder="Town"
                      className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                    />
                    {errors.references?.[1]?.address?.town && (
                      <p className="text-xs text-red-500">{errors.references[1].address.town.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500 mb-1">Area</Label>
                  <Input
                    {...register("references.1.address.area")}
                    placeholder="Area code"
                    className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                  />
                  {errors.references?.[1]?.address?.area && (
                    <p className="text-xs text-red-500">{errors.references[1].address.area.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-4 pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="cursor-pointer px-8 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg bg-transparent"
          >
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer px-8 h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg">
            Next
          </Button>
        </div>
      </form>
    </div>
  );
}
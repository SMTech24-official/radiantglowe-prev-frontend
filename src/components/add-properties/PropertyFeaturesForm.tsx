/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { propertySchema } from "@/app/(defaultLayout)/add-properties/component/schemas";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import CustomToggle from "./CustomToggle";

interface PropertyFeaturesFormProps {
  form: UseFormReturn<z.infer<typeof propertySchema>>;
}

export default function PropertyFeaturesForm({ form }: PropertyFeaturesFormProps) {
  const { setValue, watch, formState: { errors } } = form;

  const features = watch("features") || [];
  const accessYourProperty = watch("accessYourProperty") || [];

  const handleFeatureChange = (feature: string, value: boolean) => {
    const updatedFeatures = value
      ? [...features, feature]
      : features.filter((f) => f !== feature);
    setValue("features", updatedFeatures);
  };

  const handleAccessChange = (access: string, value: boolean) => {
    const updatedAccess = value
      ? [...accessYourProperty, access]
      : accessYourProperty.filter((a) => a !== access);
    setValue("accessYourProperty", updatedAccess);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-lg space-y-12">
      {/* Property Features */}
      <div>
        <h2 className="text-xl font-medium text-gray-900 text-center mb-8">
          Please indicate any features of your property
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
          {['bills included', 'parking', 'garden access', 'gym', 'roof terrace', 'air conditioning', 'balcony', 'washing machine', "pool", "church", "mosque", "24/7 electricity", , "garage", "security"].map((feature: any) => (
            <CustomToggle
              key={feature}
              label={feature}
              checked={features.includes(feature)}
              onChange={(value) => handleFeatureChange(feature, value)}
            />
          ))}
        </div>
        {errors.features && (
          <p className="text-red-500 text-sm mt-1">{errors.features.message || "At least one feature is required"}</p>
        )}
      </div>

      {/* Tenant Preferences */}
      <div>
        <h2 className="text-xl font-medium text-gray-900 text-center mb-8">
          Please tell us about who can apply for your property
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2">
          {['students', 'families', 'single', 'couple', 'unemployed', 'smoker', 'professional', 'pets'].map((access: any) => (
            <CustomToggle
              key={access}
              label={access}
              checked={accessYourProperty.includes(access)}
              onChange={(value) => handleAccessChange(access, value)}
            />
          ))}
        </div>
        {errors.accessYourProperty && (
          <p className="text-red-500 text-sm mt-1">{errors.accessYourProperty.message || "At least one preference is required"}</p>
        )}
      </div>
    </div>
  );
}
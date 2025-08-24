"use client";

import { propertySchema } from "@/app/(defaultLayout)/add-properties/component/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

interface SocialMediaFormProps {
  form: UseFormReturn<z.infer<typeof propertySchema>>;
}

export default function SocialMediaForm({ form }: SocialMediaFormProps) {
  const { register, setValue, watch, formState: { errors } } = form;

  return (
    <div className="container mx-auto bg-white rounded-lg space-y-6 pb-12">
      <div>
        <label className="block text-base font-medium text-gray-900 mb-4">
          Social Media Link/Website Link:
        </label>
        <Input
          placeholder="Add social media link to the property (Optional)"
          {...register("mediaLink")}
          className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
        />
        {errors.mediaLink && (
          <p className="text-red-500 text-sm mt-1">{errors.mediaLink.message}</p>
        )}
      </div>
      <div className="flex items-start space-x-3">
        <Checkbox
          id="isAcceptTermsAndCondition"
          checked={watch("isAcceptTermsAndCondition")}
          onCheckedChange={(checked) => setValue("isAcceptTermsAndCondition", checked as boolean)}
        />
        <label className="text-sm text-gray-600">
          I confirm that I, as the landlord, do not charge tenants commission fees, have the right to rent this
          property, and agree to simplerooms <a
            href="/terms&conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary cursor-pointer"
          >
            Terms & Conditions
          </a> and <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary cursor-pointer"
          >
            Privacy Policy
          </a>.
        </label>
      </div>
      {errors.isAcceptTermsAndCondition && (
        <p className="text-red-500 text-sm mt-1">{errors.isAcceptTermsAndCondition.message || "You must accept the terms and conditions"}</p>
      )}
    </div>
  );
}
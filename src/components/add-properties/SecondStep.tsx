"use client";

import { propertySchema } from "@/app/(defaultLayout)/add-properties/component/schemas";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import PhotoOrVideos from "./PhotoOrVideos";
import PropertyFeaturesForm from "./PropertyFeaturesForm";
import RentalPropertyForm from "./RentalPropertyForm";
import SocialMediaForm from "./SocialMediaForm";
import { useEffect } from "react";

interface SecondStepProps {
  form: UseFormReturn<z.infer<typeof propertySchema>>;
  clearLocalStorage: () => void;
  handleBack?: () => void;
}

export default function SecondStep({ form, clearLocalStorage, handleBack }: SecondStepProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="">
      <RentalPropertyForm form={form} clearLocalStorage={clearLocalStorage} handleBack={handleBack} />
      <PropertyFeaturesForm form={form} />
      <PhotoOrVideos form={form} />
      <SocialMediaForm form={form} />
    </div>
  );
}
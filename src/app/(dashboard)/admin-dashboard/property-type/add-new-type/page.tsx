/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddPropertyElementMutation } from "@/redux/api/propertyApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Define the schema for form validation using Zod
const formSchema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file !== null, { message: "An image file is required." })
    .refine((file) => file?.type.startsWith("image/"), { message: "Only image files are allowed." })
    .refine((file) => file?.size <= 5 * 1024 * 1024, { message: "Image size must be less than 5MB." }),
  propertyTypeTitle: z
    .string()
    .min(1, { message: "Property Type Title is required." }),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminAddNewTypePage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [addPropertyElement, { isLoading: isSubmitting, isError: isSubmitError }] = useAddPropertyElementMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Handle file input change for preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file); // Set file in form data
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      // setValue("image", File); // Reset if no file is selected
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Upload the image
      const uploadFormData = new FormData();
      uploadFormData.append('images', data.image);
      const uploadResponse = await uploadFile(uploadFormData).unwrap();
      const uploadedImageUrl = uploadResponse.data[0];

      // Prepare payload for adding property type
      const payload = {
        propertyTypes: [
          {
            icon: uploadedImageUrl,
            title: data.propertyTypeTitle,
          },
        ],
      };

      // Submit property type
      await addPropertyElement(payload).unwrap();
      toast.success("Property type added successfully!");
      // handleReset();
      // redirect("/admin-dashboard/property-type");
    } catch (error) {
      // console.error("Failed to add property type:", error);
      toast.error("Failed to add property type.");
    }
  };

  const handleReset = () => {
    reset();
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    redirect("/admin-dashboard/property-type");
  };

  return (
    <div className="w-full max-w-md bg-white lg:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Loading Overlay */}
        {(isSubmitting || isUploading) && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Property Type Image
          </label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            disabled={isSubmitting || isUploading}
            aria-required="true"
          />
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
          )}
          {previewUrl && (
            <Image
              src={previewUrl}
              alt="Icon preview"
              className="mt-2 h-16 w-16 object-contain"
              width={64}
              height={64}
            />
          )}
        </div>

        {/* Properties Type Title */}
        <div>
          <label htmlFor="propertyTypeTitle" className="block text-sm font-medium text-gray-700">
            Property Type Title
          </label>
          <Input
            id="propertyTypeTitle"
            placeholder="Properties Type Title"
            {...register("propertyTypeTitle")}
            className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            disabled={isSubmitting || isUploading}
            aria-required="true"
          />
          {errors.propertyTypeTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.propertyTypeTitle.message}</p>
          )}
        </div>

        {/* Error Message */}
        {isSubmitError && (
          <div className="text-red-500 text-sm text-center">
            Failed to add property type. Please try again.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="cursor-pointer px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="cursor-pointer px-6 py-2 bg-primary hover:bg-primary/80 text-white"
            disabled={isSubmitting || isUploading}
          >
            Add
          </Button>
        </div>
      </form>
    </div>
  );
}
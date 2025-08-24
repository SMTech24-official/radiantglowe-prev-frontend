/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoEllipsisHorizontal } from "react-icons/io5";
import * as z from "zod";
import { toast } from "sonner";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { useDeletePropertyElementMutation, useUpdatePropertyElementMutation } from "@/redux/api/propertyApi";

// Zod schema for edit form validation
const editSchema = z.object({
  icon: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.type.startsWith("image/"), { message: "Only image files are allowed." })
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, { message: "Image size must be less than 5MB." }),
  title: z.string().min(1, { message: "Property Type Title is required." }),
});

type EditFormData = z.infer<typeof editSchema>;

interface PropertyTypeCardProps {
  id: string;
  name: string;
  icon: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onMenuClick?: (id: string) => void;
}

export default function PropertyTypeCard({
  id,
  name,
  icon,
  isSelected = false,
  onSelect,
  onMenuClick,
}: PropertyTypeCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(icon);

  const [updatePropertyElement, { isLoading: isUpdating }] = useUpdatePropertyElementMutation();
  const [deletePropertyElement, { isLoading: isDeleting }] = useDeletePropertyElementMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: { title: name },
  });

  // Toggle menu visibility
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
    onMenuClick?.(id);
  };

  // Handle delete action
  const handleDelete = async () => {
    try {
      await deletePropertyElement({ type: "propertyTypes", value: name }).unwrap();
      toast.success("Property type deleted successfully!");
      setIsMenuOpen(false);
    } catch (error:any) {
      toast.error("Failed to delete property type.");
    }
  };

  // Open edit modal
  const handleEdit = () => {
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    reset({ title: name });
    setPreviewUrl(icon);
    if (previewUrl && previewUrl !== icon) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Handle file input change for preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("icon", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setValue("icon", undefined);
      setPreviewUrl(icon);
    }
  };

  // Handle edit form submission
  const onEditSubmit = async (data: EditFormData) => {
    try {
      let uploadedImageUrl = icon; // Default to existing icon
      if (data.icon) {
        const uploadFormData = new FormData();
        uploadFormData.append("images", data.icon);
        const uploadResponse = await uploadFile(uploadFormData).unwrap();
        uploadedImageUrl = uploadResponse.data[0];
      }

      const payload = {
        propertyTypes: [{ icon: uploadedImageUrl, title: data.title }],
      };

      await updatePropertyElement({ id, ...payload }).unwrap();
      toast.success("Property type updated successfully!");
      closeEditModal();
    } catch (error) {
      toast.error("Failed to update property type.");
    }
  };

  return (
    <>
      <Card
        className={`w-full h-full cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected ? "border-2 border-primary" : "border border-gray-200"
        }`}
        onClick={() => onSelect?.(id)}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center h-full relative">
          {/* Three Dots Menu */}
          <div className="absolute top-4 right-4">
            <button
              onClick={handleMenuToggle}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Open property type options"
            >
              <IoEllipsisHorizontal className="w-5 h-5 text-gray-400" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={handleEdit}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  aria-label="Edit property type"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${
                    isDeleting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Delete property type"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>

          {/* Property Icon */}
          <div className="mb-4 flex items-center justify-center">
            <div className="relative w-12 h-12">
              <Image src={icon || "/placeholder.svg"} alt={name} fill className="object-cover" />
            </div>
          </div>

          {/* Property Name */}
          <h3 className="text-lg font-medium text-gray-900 text-center leading-tight">{name}</h3>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
          <div className="max-w-lg w-full mx-4 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Property Type</h2>
            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-6">
              {/* Loading Overlay */}
              {(isUpdating || isUploading) && (
                <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type Image
                </label>
                <Input
                  id="icon"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
                  disabled={isUpdating || isUploading}
                  aria-required="false"
                />
                {errors.icon && (
                  <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>
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

              {/* Property Type Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type Title
                </label>
                <Input
                  id="title"
                  placeholder="Property Type Title"
                  {...register("title")}
                  className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
                  disabled={isUpdating || isUploading}
                  aria-required="true"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  disabled={isUpdating || isUploading}
                  aria-label="Cancel editing"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary/80 text-white"
                  disabled={isUpdating || isUploading}
                  aria-label="Save changes"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
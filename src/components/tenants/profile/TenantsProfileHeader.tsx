/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useGetMeQuery, useUpdateUserMutation } from "@/redux/api/authApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { VerifiedIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiEdit } from "react-icons/fi"; 
import { toast } from "sonner";

export default function TenantsProfileHeader() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Fetch user profile data
  const { data: profileData, isLoading: isProfileLoading } = useGetMeQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const pathname = usePathname();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Create FormData for file upload
        const uploadFormData = new FormData();
        uploadFormData.append("images", file);

        // Upload the file
        const uploadResponse = await uploadFile(uploadFormData).unwrap();
        const uploadedImageUrl = uploadResponse.data[0];

        if (uploadedImageUrl) {
          // Update user profile with new image URL
          await updateUser({ image: uploadedImageUrl }).unwrap();
          setProfileImage(uploadedImageUrl);
          toast.success("Profile image updated successfully!");
        }
      } catch (error) {
        toast.error("Failed to upload image. Please try again.");
      }
    }
  };

  // Determine which image to show
  const displayImage =
    profileImage || profileData?.data?.image || "/placeholder.svg";

  return (
    <div className="flex items-center justify-center bg-white p-4">
      <div className="w-96 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {pathname.split("/")[1] === "tenants" ? "Tenants" : "Landlord"} Profile
        </h1>
        <p className="text-gray-600 text-base mb-6">
          Manage Your Personal Details Service
        </p>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden relative">
              {isProfileLoading || isUploading || isUpdating ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
                </div>
              ) : (
                <Image
                  src={displayImage}
                  alt="Profile"
                  fill
                  className="w-full h-full object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading || isUpdating}
              />
    
            </div>
              {/* Verified Badge */}
            { profileData?.data?.isVerified && !isProfileLoading&& (
              <div className="absolute top-0 -right-1 bg-blue-500 text-white rounded-full p-1" title="Verified User">
                <VerifiedIcon className="w-5 h-5" />
              </div>
            )}
            <button
              className="absolute cursor-pointer flex items-center justify-center bottom-0 -right-2 h-10 w-10 rounded-full shadow-lg bg-white"
              disabled={isUploading || isUpdating}
            >
              <FiEdit />
            </button>
          </div>
          <div className="text-left">
            {isProfileLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <p className="text-gray-800 text-lg font-medium">
                  {profileData?.data?.name || "Unknown User"}
                </p>
                <p className="text-gray-600 text-sm">
                  {profileData?.data?.email || "No email provided"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
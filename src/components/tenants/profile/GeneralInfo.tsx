/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetMeQuery, useUpdateUserMutation } from "@/redux/api/authApi";
import { useEffect } from "react";
import { toast } from "sonner";

// Define form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function GeneralInfo() {
  // Fetch user profile data and update mutation
  const { data: profileData, isLoading: isProfileLoading } = useGetMeQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profileData?.data?.name || "Unknown User", // Prefill with API data
    },
  });

  // Update form default values when profile data loads
  useEffect(() => {
    if (profileData?.data?.name) {
      reset({ name: profileData.data.name });
    }
  }, [profileData, reset]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      await updateUser({ name: data.name }).unwrap();
      toast.success("Name updated successfully!");
    } catch (error) {
      toast.error("Failed to update name. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#efefef] p-4 rounded-xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        General Information
      </h2>
      {isProfileLoading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-md w-32"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Name
            </label>
            <input
              {...register("name")}
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 w-full"
              placeholder="Name"
              disabled={isUpdating}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-primary cursor-pointer text-white p-3 rounded-md hover:bg-primary/80 transition duration-200"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span className="ml-2">Updating...</span>
              </div>
            ) : (
              "Update name"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
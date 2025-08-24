/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetMeQuery, useChangePasswordMutation, useUpdateUserMutation } from "@/redux/api/authApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

// Define form schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SecurityInfo() {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch user profile data and password change mutation
  const { data: profileData, isLoading: isProfileLoading } = useGetMeQuery();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Initialize main form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: profileData?.data?.email || "Unknown Email",
      phoneNumber: profileData?.data?.phoneNumber || "",
    },
  });

  // Initialize password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update form default values when profile data loads
  useEffect(() => {
    if (profileData?.data) {
      reset({
        email: profileData.data.email,
        phoneNumber: profileData.data.phoneNumber,
      });
    }
  }, [profileData, reset]);

  // Handle main form submission (for phone number updates)
  const onSubmit = async (data: FormData) => {
    try {
      await updateUser({ phoneNumber: data.phoneNumber }).unwrap();
      toast.success("Phone number updated successfully!");
    } catch (error) {
      toast.error("Failed to update phone number. Please try again.");
    }
  };

  // Handle password change submission
  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success("Password changed successfully!");
      resetPassword(); // Clear password fields
      setShowPasswordFields(false); // Hide password fields
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      toast.error("Failed to change password. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#efefef] p-4 rounded-xl">
      <div className="flex justify-between gap-2 items-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Security</h2>
        <button
          type="button"
          onClick={() => setShowPasswordFields(!showPasswordFields)}
          className="p-2 text-sm border rounded-md bg-primary text-white hover:bg-primary/80 transition duration-200"
          disabled={isChangingPassword || isUpdating}
        >
          {showPasswordFields ? "Cancel" : "Change Password"}
        </button>
      </div>
      {isProfileLoading ? (
        <div className="animate-pulse">
          <div className="flex justify-between space-x-4">
            <div className="w-1/3 h-10 bg-gray-200 rounded-md"></div>
            <div className="w-1/3 h-10 bg-gray-200 rounded-md"></div>
            <div className="w-1/3 h-10 bg-gray-200 rounded-md"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-md w-1/2 mt-4"></div>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-between space-x-4">
              {/* Email */}
              <div className="w-1/3">
                <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                <input
                  {...register("email")}
                  className="w-full p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="Email"
                  readOnly
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="w-1/3">
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                <input
                  {...register("phoneNumber")}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                  placeholder="Phone Number"
                  disabled={isChangingPassword || isUpdating}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Save Changes Button */}
              <div className="w-1/3 flex items-end">
                <button
                  type="submit"
                  className="cursor-pointer w-full bg-primary text-sm text-white px-3 py-2 rounded-md hover:bg-primary/80 transition duration-200"
                  disabled={isChangingPassword || isUpdating}
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span className="ml-2">Saving...</span>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Password Change Form */}
          {showPasswordFields && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 mt-4">
              <div className="flex justify-between space-x-4">
                {/* Old Password */}
                <div className="w-1/3 relative">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Old Password</label>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    {...registerPassword("oldPassword")}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white pr-10"
                    placeholder="Old Password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-2 top-10 text-gray-500 hover:text-gray-700"
                    disabled={isChangingPassword}
                  >
                    {showOldPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                  {passwordErrors.oldPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.oldPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="w-1/3 relative">
                  <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    {...registerPassword("newPassword")}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white pr-10"
                    placeholder="New Password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-10 text-gray-500 hover:text-gray-700"
                    disabled={isChangingPassword}
                  >
                    {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="w-1/3 relative">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerPassword("confirmPassword")}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white pr-10"
                    placeholder="Confirm Password"
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-10 text-gray-500 hover:text-gray-700"
                    disabled={isChangingPassword}
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="cursor-pointer bg-primary text-white px-3 py-2 text-sm rounded-md hover:bg-primary/80 transition duration-200"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span className="ml-2">Changing...</span>
                    </div>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
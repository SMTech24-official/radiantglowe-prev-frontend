/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/redux/api/authApi";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";
import banner from "@/assets/home/Banner.png";
import Image from "next/image";

// Define schema for reset password
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    try {
      await resetPassword({ token, password: data.password }).unwrap();
      toast.success("Password reset successfully! Please log in.");
      reset();
      router.push("/");
    } catch (error) {
      toast.error("Failed to reset password. The link may be invalid or expired.");
    }
  };

  return (
    <div className=" min-h-screen p-4 relative"
    >
      <Image
        src={banner}
        alt="Reset Password Banner"
        fill
        className="absolute inset-0 object-cover opacity-20"
        priority
      />
      {/* Backdrop with blur and low opacity */}
      {/* <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" /> */}

      {/* Form Card */}
    <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative bg-white/90 rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-600 text-sm mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter new password"
                className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary pr-10"
                disabled={isLoading}
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm new password"
                className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary pr-10"
                disabled={isLoading}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="cursor-pointer w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg mt-1"
            disabled={isLoading}
            aria-label="Reset password"
          >
            {isLoading ? (
              <>
                Reset Password <LoaderIcon className="animate-spin ml-2" />
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          {/* Back to Login */}
          <p className="text-center text-sm text-gray-600 mt-1">
            Back to{" "}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
              disabled={isLoading}
              aria-label="Back to login"
            >
              Home
            </button>
          </p>
        </form>
      </div>
    </div>
    </div>
  );
}
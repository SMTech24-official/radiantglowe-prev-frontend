/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginModal } from "@/context/LoginModalProvider";
import { useLoginHelper } from "@/hooks/useLoginHelper";
import { useForgotPasswordMutation, useLoginMutation } from "@/redux/api/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { z } from "zod";
import RegistrationModal from "./RegistrationModal";

// Define schemas for login and forgot password
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [forgotPassword, { isLoading: isForgotPasswordLoading }] = useForgotPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { requireAuth } = useLoginModal();
  const { loginHelper } = useLoginHelper();
  // Login form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Forgot password form
  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgot,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const newData = {
        email: data.email,
        password: data.password,
      };
      await loginHelper(newData, login);
      resetLogin();
      onClose();
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      toast.success("Password reset link sent to your email!");
      resetForgot();
      setIsForgotPasswordOpen(false);
    } catch (error) {
      toast.error("Failed to send password reset link. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPasswordOpen(true);
  };

  const closeForgotPassword = () => {
    setIsForgotPasswordOpen(false);
    resetForgot();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Login Modal */}
      {!isForgotPasswordOpen ? (
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-auto p-6">
          {/* Close Button */}
          <button
            onClick={() => {
              onClose();
              if (requireAuth) {
                window.location.href = "/";
              }
            }}
            className="cursor-pointer absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close login modal"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome 👋🏾</h2>
            <p className="text-gray-600 text-sm">Please Sign In here</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="cameron.williamson@example.com"
                className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary"
                disabled={isLoggingIn}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••••"
                  className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary pr-10"
                  disabled={isLoggingIn}
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={watchedValues.rememberMe}
                  onCheckedChange={(checked) => setValue("rememberMe", checked as boolean)}
                  disabled={isLoggingIn}
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember Me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="cursor-pointer text-sm text-primary hover:text-primary/80 transition-colors"
                disabled={isLoggingIn}
              >
                Forgot Password?
              </button>
            </div>

            {/* Log in Button */}
            <Button
              type="submit"
              className="cursor-pointer w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg mt-1"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  Log in <LoaderIcon className="animate-spin ml-2" />
                </>
              ) : (
                "Log in"
              )}
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-600 mt-1">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsRegistrationOpen(true)}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
                disabled={isLoggingIn}
              >
                Register
              </button>
            </p>
          </form>
        </div>
      ) : (
        /* Forgot Password Modal */
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-auto p-6">
          {/* Close Button */}
          <button
            onClick={closeForgotPassword}
            className="cursor-pointer absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close forgot password modal"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
            <p className="text-gray-600 text-sm">Enter your email to receive a password reset link.</p>
          </div>

          {/* Forgot Password Form */}
          <form onSubmit={handleForgotSubmit(onForgotPasswordSubmit)} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="forgotEmail" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="forgotEmail"
                type="email"
                {...registerForgot("email")}
                placeholder="cameron.williamson@example.com"
                className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary"
                disabled={isForgotPasswordLoading}
                aria-invalid={forgotErrors.email ? "true" : "false"}
              />
              {forgotErrors.email && <p className="text-xs text-red-500">{forgotErrors.email.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="cursor-pointer w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg mt-1"
              disabled={isForgotPasswordLoading}
            >
              {isForgotPasswordLoading ? (
                <>
                  Sending <LoaderIcon className="animate-spin ml-2" />
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </div>
      )}

      <RegistrationModal
        isOpen={isRegistrationOpen}
        onClose={() => setIsRegistrationOpen(false)}
      />
    </div>
  );
}
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { z } from "zod";
// import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/redux/api/authApi";
import { loginHelper } from "@/utils/helper/login.helper";
import {  ArrowBigRight, LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import banner from "@/assets/home/Banner.png";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: LoginFormData) => {
    const newData = {
      email: data.email,
      password: data.password,
    };

    loginHelper(newData, login)
  };

  // const handleGoogleLogin = () => {
  //   console.log("Google login clicked");
  // };

  const handleRegisterClick = () => {
    router.push("/register");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      <Image
        src={banner}
        alt="Reset Password Banner"
        fill
        className="absolute inset-0 object-cover opacity-20"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-auto p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome 👋🏾</h2>
            <p className="text-gray-600 text-sm">Please Sign In here</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="cameron.williamson@example.com"
                className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••••"
                  className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={watchedValues.rememberMe}
                  onCheckedChange={(checked) =>
                    setValue("rememberMe", checked as boolean)
                  }
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                  Remember Me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Log in Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg mt-6"
            >
              {isLoading ? (
                <>
                  Log in <LoaderIcon className="animate-spin ml-2" />
                </>
              ) : (
                "Log in"
              )}
            </Button>

            {/* Register Link */}
             {/* Register Link */}
            <p className="text-center text-sm text-gray-600 mt-1">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={handleRegisterClick}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
                // disabled={isLoggingIn}
              >
                Register
              </button>
            </p>

            {/* back to home */}
            <div className="text-center text-sm text-gray-600 mt-1 flex items-center justify-center">
              <ArrowBigRight className="inline-block mr-1" />
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Back to Home
              </button>
            </div>

            {/* Divider */}
            {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or Sign In With</span>
            </div>
          </div> */}

            {/* Google Login */}
            {/* <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 border-gray-200 hover:bg-gray-50 font-medium rounded-lg flex items-center justify-center space-x-2"
          >
            <FcGoogle className="w-5 h-5" />
            <span className="text-gray-700">Login with Google</span>
          </Button> */}
          </form>
        </div>
      </div>
    </div>
  );
}

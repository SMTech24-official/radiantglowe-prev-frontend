/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import LoginModal from "@/components/auth/LoginModal";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/redux/api/authApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import LandlordProfileVerification from "./LandlordProfileVerification";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import CityInput from "@/components/shared/input/CityInput";
import StateInput from "@/components/shared/input/StateInput";


const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(10, "Telephone must be at least 10 digits").max(15),
  email: z.string().email("Invalid email address"),
  websiteUrl: z.string().optional(),
  flatOrHouseNo: z.string().min(1, "Flat/House Number is required"),
  address: z.string().min(1, "Address Line 1 is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  town: z.string().optional(),
  area: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

export default function LandlordRegistrationForm() {
  const registerData = JSON.parse(localStorage.getItem("registerData") || "{}");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [registerMutate, { isLoading: isRegistering }] = useRegisterMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const [captchaValue, setCaptchaValue] = useState<string | null>(null);


  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: registerData.email || "",
      password: "",
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: FormData) => {
    // if (selectedFiles.length === 0) {
    //   toast.error("Please upload at least one verification image.");
    //   return;
    // }

    if (!captchaValue) {
      toast.error("❌ Please verify that you are a human!");
      return;
    }

    const res = await fetch("/api/verify-recaptcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recaptchaToken: captchaValue }),
    });

    const recaptchaResult = await res.json();
    if (recaptchaResult.success) {
      setCaptchaValue(null);
    } else {
      toast.error("❌ Verification failed: " + recaptchaResult.message);
      return;
    }
    // Upload images
    let profileVerificationImages: string[] = [];
    if (selectedFiles.length !== 0) {
      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("images", file));
        const uploadResponse = await uploadFile(formData).unwrap();
        profileVerificationImages = uploadResponse.data;
      } catch (error) {
        toast.error("Image upload failed");
        return;
      }
    }


    // Prepare registration payload
    const payload = {
      email: data.email,
      name: data.name,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phoneNumber: data.phoneNumber,
      address: {
        flatOrHouseNo: data.flatOrHouseNo,
        address: data.address,
        state: data.state,
        city: data.city,
        town: data.town,
        area: data.area,
      },
      role: "landlord",
      // image: "",
      profileVerificationImage: profileVerificationImages || [],
      websiteUrl: data.websiteUrl || "",
    };

    // Submit registration
    try {
      await registerMutate(payload).unwrap();
      toast.success("Registration successful! Wait for admin approval.");
      // Clear form
      setSelectedFiles([]);
      localStorage.removeItem("registerData");
      // setIsLoginOpen(true);
      router.push("/login");
      // Optionally, redirect or clear form
    } catch (error) {
      toast.error((error as any)?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="bg-white flex items-center justify-center p-4 py-8">
      <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-6">Landlord&apos;s Registration Form</h1>
        <p className="text-center text-gray-600 mb-8">Register to Find Your Perfect Tenants - Easy, Quick, and Secure</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <input
                {...register("name")}
                className="p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                readOnly
                {...register("email")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">Telephone</label>
              <input
                {...register("phoneNumber")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Phone Number"
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
            </div>
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">Website</label>
              <input
                {...register("websiteUrl")}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Website"
              />
              {errors.websiteUrl && <p className="text-red-500 text-xs mt-1">{errors.websiteUrl.message}</p>}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className="p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Current Address</label>
            <label className="block text-gray-500 text-sm  mb-2">Flat or House Number</label>
            <input
              {...register("flatOrHouseNo")}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 mb-2"
              placeholder="Flat or House Number"
            />
            {errors.flatOrHouseNo && <p className="text-red-500 text-xs mt-1">{errors.flatOrHouseNo.message}</p>}
            <label className="block text-gray-500 text-sm  mb-2">Address</label>
            <input
              {...register("address")}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 mb-2"
              placeholder="Address"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label className="block text-gray-500 text-sm  mb-2">State</label>
               <StateInput
                 form={form}
                 className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                 placeholder="State"
                 name="state"
               />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-gray-500 text-sm  mb-2">City</label>
               <CityInput
                 form={form}
                 className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                 placeholder="City"
                 name="city"
               />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-gray-500 text-sm  mb-2">Town</label>
                <input
                  {...register("town")}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="Town"
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-gray-500 text-sm  mb-2">Area</label>
                <input
                  {...register("area")}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="Area code"
                />
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
              </div>
            </div>
          </div>
          <LandlordProfileVerification setSelectedFiles={setSelectedFiles} />
          {/* captcha */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(value) => setCaptchaValue(value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent"
              disabled={isUploading || isRegistering}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer px-8 py-3 bg-primary hover:bg-primary/80 text-white"
              disabled={isUploading || isRegistering}
            >
              {isUploading ? "Uploading..." : isRegistering ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
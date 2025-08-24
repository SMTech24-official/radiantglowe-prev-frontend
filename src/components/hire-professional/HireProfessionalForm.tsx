/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateHireMutation } from "@/redux/api/hireApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import CityInput from "../shared/input/CityInput";
import StateInput from "../shared/input/StateInput";



// Define the schema for form validation using Zod
const formSchema = z.object({
  forename: z.string().min(1, { message: "Forename is required." }),
  surname: z.string().min(1, { message: "Surname is required." }),
  telephone: z.string().min(10, { message: "Telephone number must be at least 10 digits." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  flatOrHouseNumber: z.string().optional(),
  address: z.string().min(1, { message: "Address is required." }),
  state: z.string().min(1, { message: "State is required." }),
  city: z.string().min(1, { message: "City is required." }),
  town: z.string().min(1, { message: "Town is required." }),
  areaCode: z.string().optional(),
  briefMessage: z.string().min(1, { message: "Brief message is required." }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Conditions.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function HireProfessionalForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      termsAccepted: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;
  // const user = useDecodedToken(localStorage.getItem("accessToken"));
  const termsAccepted = watch("termsAccepted");
  const [createHire, { isLoading }] = useCreateHireMutation();
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const router = useRouter();
  const onSubmit = async (data: FormData) => {

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

    // Check for authenticated user
    // Prepare API payload
    const payload = {
      name: `${data.forename} ${data.surname}`,
      email: data.email,
      phoneNumber: data.telephone,
      address: {
        flatOrHouseNo: data.flatOrHouseNumber,
        address: data.address,
        state: data.state,
        city: data.city,
        town: data.town,
        area: data.areaCode,
      },
      briefMessage: data.briefMessage,
    };

    try {
      await createHire(payload).unwrap();
      toast.success("Submitted successfully! Please wait for confirmation.");
      reset();
      router.push("/");
    } catch (error) {
      toast.error((error as any)?.data?.message || "Failed to submit form. Please try again.");
    }
  };

  const handleCancel = () => {
    reset();
    toast.info("Form cancelled");
  };

  return (
    <div className="container mx-auto p-6 md:p-8 bg-white">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
        Hire a Professional
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Section */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="forename" className="block text-base font-medium text-gray-900 mb-2">
                Name:
              </label>
              <Input
                id="forename"
                placeholder="Forename"
                {...register("forename")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.forename && <p className="text-red-500 text-sm mt-1">{errors.forename.message}</p>}
            </div>
            <div>
              <label htmlFor="surname" className="block text-base font-medium text-gray-900 mb-2">
                Surname:
              </label>
              <Input
                id="surname"
                placeholder="Surname"
                {...register("surname")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname.message}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="telephone" className="block text-base font-medium text-gray-900 mb-2">
              Phone:
            </label>
            <Input
              id="telephone"
              type="tel"
              placeholder="Telephone"
              {...register("telephone")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-2">
              Email:
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              {...register("email")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
        </div>

        {/* Address Section */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-2">
            Location:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-4">
              <label className="block text-base font-medium text-gray-500 mb-2">
                Flat/House Number:
              </label>
              <Input
                id="flatOrHouseNumber"
                placeholder="Flat/House Number"
                {...register("flatOrHouseNumber")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.flatOrHouseNumber && <p className="text-red-500 text-sm mt-1">{errors.flatOrHouseNumber.message}</p>}
            </div>

            <div className="col-span-4">
              <label className="block text-base font-medium text-gray-500 mb-2">
                Address:
              </label>
              <Input
                id="address"
                placeholder="Address"
                {...register("address")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block text-base font-medium text-gray-500 mb-2">
                State:
              </label>
              <StateInput
                name="state"
                form={form}
                placeholder="State"
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <label className="block text-base font-medium text-gray-500 mb-2">
                City:
              </label>
              <CityInput
                name="city"
                form={form}
                placeholder="City"
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-base font-medium text-gray-500 mb-2">
                Town:
              </label>
              <Input
                id="town"
                placeholder="Town"
                {...register("town")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.town && <p className="text-red-500 text-sm mt-1">{errors.town.message}</p>}
            </div>
            <div>
              <label className="block text-base font-medium text-gray-500 mb-2">
                Area Code:
              </label>
              <Input
                id="areaCode"
                placeholder="Area code"
                {...register("areaCode")}
                className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
              />
              {errors.areaCode && <p className="text-red-500 text-sm mt-1">{errors.areaCode.message}</p>}
            </div>
          </div>
        </div>

        {/* Brief Message */}
        <div>
          <label htmlFor="briefMessage" className="block text-base font-medium text-gray-900 mb-2">
            Brief message:
          </label>
          <Textarea
            id="briefMessage"
            placeholder="Brief message"
            rows={5}
            {...register("briefMessage")}
            className="min-h-[120px] border-gray-300 focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
          />
          {errors.briefMessage && <p className="text-red-500 text-sm mt-1">{errors.briefMessage.message}</p>}
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="termsAccepted"
            checked={termsAccepted}
            onCheckedChange={(checked) => setValue("termsAccepted", checked as boolean)}
            className="mt-1"
          />
          <label className="text-sm text-gray-700 leading-relaxed cursor-pointer">
            Click to accept our <a href="/terms&conditions" target="_blank" className="text-primary inline-block">Terms and Conditions</a>.
          </label>
        </div>
        {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted.message}</p>}

        {/* Action Buttons */}
        <div className="flex justify-between gap-4 pt-6 items-center flex-wrap">
          <div className="">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
              onChange={(value) => setCaptchaValue(value)}
            />
          </div>
          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="cursor-pointer px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary/80 text-white"
              disabled={isLoading || !termsAccepted}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
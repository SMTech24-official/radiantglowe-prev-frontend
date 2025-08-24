/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import FirstStep from "@/components/add-properties/FirstStep";
import SecondStep from "@/components/add-properties/SecondStep";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { useGetMeQuery } from "@/redux/api/authApi";
import { useAddPropertyMutation } from "@/redux/api/propertyApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { propertySchema, PropertySchema } from "./component/schemas";

export default function AddPropertiesPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [addPropertyMutate, { isLoading: isPropertyLoading }] = useAddPropertyMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const { data: profileData } = useGetMeQuery();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create a properly typed resolver
  const resolver: Resolver<PropertySchema> = zodResolver(propertySchema);

  const form = useForm<PropertySchema>({
    resolver,
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      status: "available",
      headlineYourProperty: "",
      propertyType: "",
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
      kitchen: 0,
      location: {
        flatOrHouseNo: "",
        address: "",
        state: "",
        city: "",
        town: "",
        area: "",
      },
      description: "",
      images: [],
      furnished: undefined,
      features: [],
      formAvailable: "",
      isIncludeAllUtilityWithService: false,
      minimumLengthOfContract: undefined,
      isReferenceRequired: false,
      accessYourProperty: [],
      mediaLink: "",
      isAcceptTermsAndCondition: false,
      isRemoteVideoView: false,
      rentPerYear: 0,
      rentPerMonth: 0,
      rentPerDay: 0,
      serviceCharge: 0,
      depositAmount: 0,
      gender: undefined,
      ages: undefined,
    },
  });

  const { handleSubmit, formState: { errors, isValid }, trigger, getValues } = form;

  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  useEffect(() => {
    const savedData = localStorage.getItem("propertyFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
        localStorage.removeItem("propertyFormData");
      }
    }
  }, [form]);

  const saveToLocalStorage = () => {
    try {
      const formData = form.getValues();
      localStorage.setItem("propertyFormData", JSON.stringify(formData));
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("propertyFormData");
    form.reset({
      status: "available",
      headlineYourProperty: "",
      propertyType: "",
      bedrooms: 0,
      bathrooms: 0,
      livingRooms: 0,
      kitchen: 0,
      location: {
        flatOrHouseNo: "",
        address: "",
        state: "",
        city: "",
        town: "",
        area: "",
      },
      description: "",
      images: [],
      furnished: undefined,
      features: [],
      formAvailable: "",
      isIncludeAllUtilityWithService: false,
      minimumLengthOfContract: undefined,
      isReferenceRequired: false,
      accessYourProperty: [],
      mediaLink: "",
      isAcceptTermsAndCondition: false,
      isRemoteVideoView: false,
      rentPerYear: 0,
      rentPerMonth: 0,
      serviceCharge: 0,
      depositAmount: 0,
      gender: undefined,
      ages: undefined,
    });
  };

  const onSubmit = async (data: PropertySchema) => {
    setIsSubmitting(true);

    // Validate terms and conditions acceptance
    if (!data.isAcceptTermsAndCondition) {
      toast.error("❌ Please accept the terms and conditions!");
      setIsSubmitting(false);
      return;
    }

    // Validate required arrays
    if (!data.images || data.images.length === 0) {
      toast.error("❌ At least one image is required!");
      setIsSubmitting(false);
      return;
    }

    if (!data.features || data.features.length === 0) {
      toast.error("❌ At least one feature must be selected!");
      setIsSubmitting(false);
      return;
    }

    if (!data.accessYourProperty || data.accessYourProperty.length === 0) {
      toast.error("❌ At least one access preference must be selected!");
      setIsSubmitting(false);
      return;
    }

    if (!captchaValue) {
      toast.error("❌ Please verify that you are a human!");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recaptchaToken: captchaValue }),
      });

      const recaptchaResult = await res.json();
      if (!recaptchaResult.success) {
        toast.error("❌ Verification failed: " + recaptchaResult.message);
        setIsSubmitting(false);
        return;
      }

      const formData = { ...data };

      // Ensure arrays are properly set (handle optional arrays)
      if (!formData.images) formData.images = [];
      if (!formData.features) formData.features = [];
      if (!formData.accessYourProperty) formData.accessYourProperty = [];

      if (formData.images && formData.images.length > 0) {
        const uploadedImageUrls: string[] = [];
        const uploadFormData = new FormData();

        formData.images.forEach((base64Image, index) => {
          const file = base64ToFile(base64Image, `property_image_${index + 1}.jpg`);
          uploadFormData.append("images", file);
        });

        const uploadResponse = await uploadFile(uploadFormData).unwrap();

        if (uploadResponse?.data && Array.isArray(uploadResponse.data)) {
          uploadedImageUrls.push(...uploadResponse.data);
        }

        formData.images = uploadedImageUrls;
      }

      let landlordId: string | undefined;

      if (profileData?.data?.role === "admin") {
        landlordId = localStorage.getItem("landlordId") ?? undefined;
        if (!landlordId) {
          toast.error("Landlord ID not found");
          setIsSubmitting(false);
          return;
        }
      }

      await addPropertyMutate({ ...formData, landlordId }).unwrap();
      if (profileData?.data?.role === "admin") {
        router.push("/admin-dashboard/all-properties");
        return;
      }
      router.push("/all-properties");

      toast(
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-semibold text-green-800">
              Submission Successful
            </span>
            <span className="text-sm text-gray-600 text-center">
              Your property has been submitted successfully and is awaiting admin approval.
            </span>
          </div>
        </div>,
        {
          duration: 5000,
          style: {
            background: "#f0fdf4",
            color: "#1f3a28",
            padding: "20px 24px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            minWidth: "320px",
            border: "1px solid #dcfce7",
          },
        }
      );

      form.reset();
      clearLocalStorage();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.data?.message || "Failed to submit property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Define all required first step fields
      const firstStepFields: (keyof PropertySchema)[] = [
        "headlineYourProperty",
        "propertyType",
        "bedrooms",
        "bathrooms",
        "livingRooms",
        "kitchen",
        "description",
        "formAvailable"
      ];

      // Also validate location fields
      const locationFields = [
        "location.address",
        "location.state",
        "location.city",
        "location.town"
      ] as const;

      // Trigger validation for all fields
      const isValid = await trigger([...firstStepFields, ...locationFields]);

      if (isValid) {
        // Additional validation for required fields
        const values = getValues();

        if (!values.headlineYourProperty?.trim()) {
          toast.error("❌ Please enter a headline for your property");
          return;
        }

        if (!values.propertyType) {
          toast.error("❌ Please select a property type");
          return;
        }

        if (!values.location?.address?.trim()) {
          toast.error("❌ Please enter the property address");
          return;
        }

        if (!values.location?.state?.trim()) {
          toast.error("❌ Please select a state");
          return;
        }

        if (!values.location?.city?.trim()) {
          toast.error("❌ Please select a city");
          return;
        }

        if (!values.location?.town?.trim()) {
          toast.error("❌ Please enter the town");
          return;
        }

        if (!values.description?.trim()) {
          toast.error("❌ Please enter a property description");
          return;
        }

        if (!values.formAvailable) {
          toast.error("❌ Please select an available date");
          return;
        }

        saveToLocalStorage();
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Show specific error messages
        if (errors.headlineYourProperty) {
          toast.error("❌ " + errors.headlineYourProperty.message);
        } else if (errors.propertyType) {
          toast.error("❌ " + errors.propertyType.message);
        } else if (errors.location?.address) {
          toast.error("❌ " + errors.location.address.message);
        } else if (errors.location?.state) {
          toast.error("❌ " + errors.location.state.message);
        } else if (errors.location?.city) {
          toast.error("❌ " + errors.location.city.message);
        } else if (errors.location?.town) {
          toast.error("❌ " + errors.location.town.message);
        } else if (errors.description) {
          toast.error("❌ " + errors.description.message);
        } else if (errors.formAvailable) {
          toast.error("❌ " + errors.formAvailable.message);
        } else {
          toast.error("❌ Please fill in all required fields correctly.");
        }
      }
    }
  };

  const handleBack = () => {
    if (step === 2) {
      saveToLocalStorage();
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div>
      <Breadcrumb
        title="List your property"
        shortDescription="Your guide to resolving any issues and getting the most out of our platform. We're here to assist you at every step!"
      />

      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <h1 className="text-center text-2xl md:text-4xl font-semibold">
          List your property
        </h1>
        <p className="text-center">
          Ready to turn your property into a top listing? Fill out the form below
          and get started today!
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
        {step === 1 && <FirstStep form={form} clearLocalStorage={clearLocalStorage} />}
        {step === 2 && <SecondStep form={form} handleBack={handleBack} clearLocalStorage={clearLocalStorage} />}

        <div className="container mx-auto flex justify-center gap-4 pb-8 items-center flex-wrap">
          {step === 2 && (
            <>
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                  onChange={(value) => setCaptchaValue(value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
            </>
          )}

          {step === 1 && (
            <Button
              type="button"
              onClick={handleNext}
              className="px-8 py-2 bg-primary hover:bg-primary/80 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Next"}
            </Button>
          )}

          {step === 2 && (
            <Button
              type="submit"
              className="px-8 py-2 bg-primary hover:bg-primary/80 text-white"
              disabled={
                !form.watch("isAcceptTermsAndCondition") ||
                isPropertyLoading ||
                isUploading ||
                isSubmitting ||
                !captchaValue
              }
            >
              {isPropertyLoading || isUploading || isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          )}
        </div>

        {Object.keys(errors).length > 0 && step === 1 && (
          <div className="text-red-500 text-sm text-center pb-4">
            Please correct the errors in the form before proceeding.
          </div>
        )}

        {Object.keys(errors).length > 0 && step === 2 && (
          <div className="text-red-500 text-sm text-center pb-4">
            Please correct the errors in the form before submitting.
          </div>
        )}
      </form>
    </div>
  );
}
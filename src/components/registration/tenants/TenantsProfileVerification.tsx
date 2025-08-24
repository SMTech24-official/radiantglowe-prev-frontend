/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import LoginModal from "@/components/auth/LoginModal";
import { FileUploader } from "@/components/shared/FileUploader";
import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "@/redux/api/authApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  file?: File;
  preview: string;
  name: string;
  size: string;
  isExisting?: boolean;
  fileType?: string;
  isLoadingFileType?: boolean;
}

interface TenantsProfileVerificationProps {
  formData: any;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onBack: () => void;
}

export default function TenantsProfileVerification({
  formData,
  selectedFiles,
  setSelectedFiles,
  onBack,
}: TenantsProfileVerificationProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [registerMutate, { isLoading: isRegistering }] = useRegisterMutation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const router = useRouter();
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    setSelectedFiles(files);
    return [];
  };

  const handleSubmit = async () => {
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
      toast.error("❌ Verification failed: " + (recaptchaResult.message || "Unknown error"));
      return;
    }

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

    const payload = {
      email: formData.email,
      name: `${formData.forename} ${formData.otherNames || ""} ${formData.surname}`.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phoneNumber: formData.telephone,
      address: formData.currentAddress,
      role: "tenant",
      image: "", // Add logic if profile image is required
      profileVerificationImage: profileVerificationImages,
      websiteUrl: "",
      references: formData.references || [],
      guarantor: formData.guarantor || {},
      lookingPropertyForTenant: formData.lookingPropertyForTenant || ["Room"],
    };

    try {
      await registerMutate(payload).unwrap();
      toast.success("Tenant Registration successful!");
      setSelectedFiles([]);
      localStorage.removeItem("registerData");
      router.push("/login");
    } catch (error) {
      toast.error((error as any)?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Profile Verification – Boost Your Credibility!
          </h1>
          <p className="text-sm text-gray-600">Register to Find Your Perfect Home - Easy, Quick, and Secure</p>
        </div>

        <div className="mb-12 bg-background-secondary p-2 rounded-lg">
          <FileUploader
            files={uploadedFiles}
            setFiles={setUploadedFiles}
            maxFileSize={10 * 1024 * 1024} // 10MB
            maxFiles={25}
            accept="image/*,.pdf,.doc,.docx"
            isDisabled={isUploading || isRegistering}
            onUpload={handleUpload}
          />
        </div>

        <div className="rounded-lg py-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Get Verified?</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              A verified badge on your profile enhances trust and significantly increases your chances of receiving
              enquiries.
            </p>
            <p>
              <span className="font-medium">Requirement:</span> Upload a valid government-approved ID (e.g., passport,
              NIN, or bank statement showing your full name).
            </p>
            <p>Unverified profiles will remain active but may receive fewer enquiries.</p>
          </div>
        </div>

        <div className="flex justify-center pb-4">
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
            onClick={onBack}
            disabled={isUploading || isRegistering}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="cursor-pointer px-8 py-3 bg-primary hover:bg-primary/80 text-white"
            disabled={isUploading || isRegistering}
          >
            {isUploading ? "Uploading..." : isRegistering ? "Registering..." : "Submit"}
          </Button>
        </div>
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
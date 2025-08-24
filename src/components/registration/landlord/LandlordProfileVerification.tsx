"use client";

import { FileUploader } from "@/components/shared/FileUploader";
import type React from "react";
import { useState } from "react";

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

interface LandlordProfileVerificationProps {
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export default function LandlordProfileVerification({ setSelectedFiles }: LandlordProfileVerificationProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleUpload = async (files: File[]) => {
    setSelectedFiles(files);
    return [];
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
            isDisabled={false}
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
      </div>
    </div>
  );
}
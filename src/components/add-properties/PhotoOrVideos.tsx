/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { propertySchema } from "@/app/(defaultLayout)/add-properties/component/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useGetMeQuery } from "@/redux/api/authApi";
import { useGetLandlordSubscriptionQuery } from "@/redux/api/subscriptionApi";
import { Camera, Lock, RefreshCcw, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

interface PhotoOrVideosProps {
  form: UseFormReturn<z.infer<typeof propertySchema>>;
}

export const generateCustomFilename = (file: File, prefix: string, index: number) => {
  const extension = file.name.split('.').pop();
  return `${prefix}_image_${index + 1}.${extension}`;
};

export default function PhotoOrVideos({ form }: PhotoOrVideosProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { setValue, watch, formState: { errors } } = form;
  const { data, isLoading, isError, refetch } = useGetLandlordSubscriptionQuery();
  const { data: profileData, isLoading: isProfileLoading } = useGetMeQuery();

  const hasSubscription = !!data?.data?.[0]?.package;
  const canUpload = hasSubscription || profileData?.data?.role === 'admin';

  const defaultPackage = useMemo(
    () => ({
      title: "No Plan Subscribed",
      state: "FREE" as "PAID" | "FREE",
      bgColor: "bg-gray-50",
      description: "Subscribe to a plan to unlock image uploads and showcase your property to potential tenants.",
    }),
    []
  );

  const currentPackage = useMemo(() => {
    const packageData = data?.data?.[0]?.package || {};
    return {
      title: packageData?.name || defaultPackage.title,
      price: packageData?.price,
      state: (packageData?.state || defaultPackage.state) as "PAID" | "FREE",
      bgColor: packageData?.bgColor || defaultPackage.bgColor,
      description: packageData?.description || defaultPackage.description,
    };
  }, [data, defaultPackage]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!canUpload) {
        alert("Please subscribe to a plan to add images.");
        return;
      }

      if (!files) return;

      const newFiles: UploadedFile[] = [];
      const newImages: string[] = [];

      for (const [index, file] of Array.from(files).entries()) {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} size is exceeded. Maximum size is 10MB.`);
          continue;
        }

        if (uploadedFiles.length + newFiles.length >= 20) {
          alert("Maximum number of files is 20.");
          return;
        }

        const customName = generateCustomFilename(file, 'property', uploadedFiles.length + index);
        const renamedFile = new File([file], customName, { type: file.type });

        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(renamedFile);

        const reader = new FileReader();
        reader.readAsDataURL(renamedFile);
        await new Promise((resolve) => {
          reader.onload = () => {
            newImages.push(reader.result as string);
            resolve(null);
          };
        });

        newFiles.push({
          id,
          file: renamedFile,
          preview,
          name: customName,
          size: formatFileSize(renamedFile.size),
        });
      }

      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setValue("images", [...(watch("images") ?? []), ...newImages]);
    },
    [uploadedFiles.length, setValue, watch, canUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (canUpload) {
        handleFileUpload(e.dataTransfer.files);
      } else {
        alert("Please subscribe to a plan to add images.");
      }
    },
    [handleFileUpload, canUpload]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (canUpload) {
        setIsDragOver(true);
      }
    },
    [canUpload]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (id: string) => {
    if (!canUpload) {
      alert("Please subscribe to a plan to manage images.");
      return;
    }

    const fileIndex = uploadedFiles.findIndex((f) => f.id === id);
    if (fileIndex === -1) return;

    const fileToRemove = uploadedFiles[fileIndex];
    URL.revokeObjectURL(fileToRemove.preview);

    const updatedFiles = uploadedFiles.filter((f) => f.id !== id);
    const updatedImages = (watch("images") ?? []).filter((_, index) => index !== fileIndex);

    setUploadedFiles(updatedFiles);
    setValue("images", updatedImages);
  };

  return (
    <div className="py-4 px-4">
      <div className="container mx-auto">
        {/* Plan redirect */}
        <div className="mb-6">
          {isLoading ? (
            <Card className="p-6 max-w-md mx-auto shadow-md rounded-xl animate-pulse">
              <CardContent className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto" />
              </CardContent>
            </Card>
          ) : isError ? (
            <Card className="p-6 max-w-md mx-auto shadow-md rounded-xl bg-red-50">
              {profileData?.data?.role === 'admin' ? (
                <CardContent className="text-center">
                  <p className="text-green-600 mb-4">Admins can upload photos without a subscription.</p>
                </CardContent>
              ) : (
                <CardContent className="text-center">
                  <p className="text-red-600 mb-4">Failed to load subscription status.</p>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="flex items-center gap-2 mx-auto border-red-600 text-red-600 hover:bg-red-100"
                    aria-label="Retry loading subscription status"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    Retry
                  </Button>
                </CardContent>
              )}
            </Card>
          ) : (
            <Card
              className={cn(
                "p-6 max-w-md mx-auto shadow-lg rounded-xl transform transition-all duration-300 hover:scale-[1.02] relative",
                currentPackage.bgColor,
                currentPackage.state === "PAID" ? "ring-2 ring-primary" : ""
              )}
              role="region"
              aria-label={hasSubscription ? "Current Subscription Plan" : "Subscription Prompt"}
            >
              <p className="absolute bg-primary text-white text-sm px-2 py-1 rounded top-8 -left-2 -rotate-45 tracking-widest">Current Plan</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                className="flex items-center gap-2 mx-auto text-primary hover:bg-red-100 absolute top-2 right-2"
                aria-label="Retry loading subscription status"
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Lock
                    className={cn(
                      "w-12 h-12",
                      hasSubscription || profileData?.data?.role === 'admin' ? "text-primary" : "text-gray-400"
                    )}
                    aria-hidden="true"
                  />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  {currentPackage.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasSubscription && (
                  <div className="text-center space-y-2">
                    {currentPackage.price && (
                      <p className="text-gray-600 text-base font-medium">
                        Price: {currentPackage.price}
                      </p>
                    )}
                    <p className="text-gray-500">
                      Status: <span className="bg-primary px-3 text-white text-sm py-1">{currentPackage.state}</span>
                    </p>
                  </div>
                )}
                <p className="text-gray-600 text-base leading-relaxed text-center">
                  {profileData?.data?.role === 'admin'
                    ? "As an admin, you can upload images without a subscription."
                    : currentPackage.description}
                </p>
                <Link
                  target="_blank"
                  href="/packages?from=add-properties"
                  aria-label={hasSubscription ? "Update subscription plan" : "Choose a subscription plan"}
                >
                  <Button
                    type="button"
                    variant={hasSubscription ? "outline" : "default"}
                    className={cn(
                      "w-full font-medium py-3 rounded-lg transition-all duration-200",
                      hasSubscription
                        ? "border-primary text-primary hover:bg-primary hover:text-white"
                        : "bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary"
                    )}
                  >
                    {hasSubscription ? "Update Plan" : "Choose a Plan"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12 bg-background-secondary p-2 rounded-lg">
          <div className="space-y-6">
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-1 text-center transition-colors",
                isDragOver && canUpload ? "border-primary" : "border-gray-300"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
                disabled={!canUpload}
                aria-disabled={!canUpload}
              />
              <div className="space-y-4 py-16">
                <div className="w-24 h-24 mx-auto border border-primary rounded-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "border-primary text-primary hover:bg-primary",
                    !canUpload ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  onClick={() => canUpload && document.getElementById("file-upload")?.click()}
                  disabled={!canUpload}
                  aria-label="Add photos"
                >
                  Add photos
                </Button>
                <p className="text-gray-500">or drop files here</p>
                <p className="text-sm text-gray-500 text-center">
                  Maximum size per file is 10MB & Number of files 25
                </p>
                {!canUpload && (
                  <p className="text-red-500 text-sm mt-2">
                    Please subscribe to a plan to add images.
                  </p>
                )}
              </div>
            </div>
            {errors.images && (
              <p className="text-red-500 text-sm mt-1">{errors.images.message || "At least one image is required"}</p>
            )}
          </div>
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-primary"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src={file.preview}
                    alt={file.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.size}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-primary hover:text-primary/80"
                  disabled={!canUpload}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ))}
            {uploadedFiles.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                <p>No files uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
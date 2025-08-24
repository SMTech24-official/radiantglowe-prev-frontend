/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { FileUploader } from "@/components/shared/FileUploader";
import CityInput from "@/components/shared/input/CityInput";
import StateInput from "@/components/shared/input/StateInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetMeQuery, useUpdateUserMutation } from "@/redux/api/authApi";
import { usePropertyElementQuery } from "@/redux/api/propertyApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export interface IAddress {
    flatOrHouseNo?: string;
    address?: string;
    state?: string;
    city?: string;
    town?: string;
    area?: string;
}

export interface IGuarantor {
    name?: string;
    telephone?: string;
    email?: string;
    profession?: string;
    address?: Omit<IAddress, "flatOrHouseNo">;
}

export interface IReference {
    name?: string;
    telephone?: string;
    email?: string;
    profession?: string;
    address?: Omit<IAddress, "flatOrHouseNo">;
}

const profileVerificationSchema = z.object({
    email: z.string().optional(),
    address: z.object({
        flatOrHouseNo: z.string().optional(),
        address: z.string().optional(),
        state: z.string().optional(),
        city: z.string().optional(),
        town: z.string().optional(),
        area: z.string().optional(),
    }).optional(),
    lookingPropertyForTenant: z.array(z.string()).optional(),
    guarantor: z.object({
        name: z.string().optional(),
        telephone: z.string().optional(),
        email: z.string().optional(),
        profession: z.string().optional(),
        address: z.object({
            address: z.string().optional(),
            state: z.string().optional(),
            city: z.string().optional(),
            town: z.string().optional(),
            area: z.string().optional(),
        }).optional(),
    }).optional(),
    references: z.array(
        z.object({
            name: z.string().optional(),
            telephone: z.string().optional(),
            email: z.string().optional(),
            profession: z.string().optional(),
            address: z.object({
                address: z.string().optional(),
                state: z.string().optional(),
                city: z.string().optional(),
                town: z.string().optional(),
                area: z.string().optional(),
            }).optional(),
        })
    ).length(2, "Exactly two references are required").optional(),
});

type FormData = z.infer<typeof profileVerificationSchema>;

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
    formData: {
        email: string;
        address: {
            flatOrHouseNo: string;
            address: string;
            state: string;
            city: string;
            town: string;
            area: string;
        };
        lookingPropertyForTenant: string[];
        guarantor?: IGuarantor;
        references?: IReference[];
    };
    selectedFiles: File[];
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    onBack: () => void;
}

export function LandlordVerificationSubmitForm({
    formData,
    selectedFiles,
    setSelectedFiles,
    onBack,
}: LandlordProfileVerificationProps) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserMutation();
    const { data: profileData, isLoading: isProfileLoading } = useGetMeQuery();
    const { data, isLoading: isPropertyLoading, isError: isPropertyError } = usePropertyElementQuery();
    const router = useRouter();
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userData = profileData?.data || {};

    // Transform API data to match the expected format
    const propertyTypes = data?.data?.propertyTypes?.map((type: any) => ({
        id: type._id,
        name: type.title.charAt(0).toUpperCase() + type.title.slice(1),
        icon: type.icon,
    })) || [];

    // Initialize form with react-hook-form
    const form = useForm<FormData>({
        resolver: zodResolver(profileVerificationSchema),
        defaultValues: {
            email: formData.email || userData.email || "",
            address: {
                flatOrHouseNo: formData.address?.flatOrHouseNo || userData.address?.flatOrHouseNo || "",
                address: formData.address?.address || userData.address?.address || "",
                state: formData.address?.state || userData.address?.state || "",
                city: formData.address?.city || userData.address?.city || "",
                town: formData.address?.town || userData.address?.town || "",
                area: formData.address?.area || userData.address?.area || "",
            },
            lookingPropertyForTenant: formData.lookingPropertyForTenant || [],
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = form;

    // Update email and address fields when profileData changes
    useEffect(() => {
        if (profileData?.data) {
            setValue("email", profileData.data.email || "", { shouldValidate: true });
            setValue("address.flatOrHouseNo", profileData.data.address?.flatOrHouseNo || "", { shouldValidate: true });
            setValue("address.address", profileData.data.address?.address || "", { shouldValidate: true });
            setValue("address.state", profileData.data.address?.state || "", { shouldValidate: true });
            setValue("address.city", profileData.data.address?.city || "", { shouldValidate: true });
            setValue("address.town", profileData.data.address?.town || "", { shouldValidate: true });
            setValue("address.area", profileData.data.address?.area || "", { shouldValidate: true });
        }
    }, [profileData, setValue]);

    // Handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsPropertyDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedPropertyTypes = watch("lookingPropertyForTenant") || [];

    const handleUpload = async (files: File[]): Promise<string[]> => {
        setSelectedFiles(files);
        // Return an empty array or the uploaded file URLs if available
        return [];
    };

    const onSubmit = async (data: FormData) => {
        setIsSubmitLoading(true);
        if (!captchaValue) {
            toast.error("❌ Please verify that you are a human!");
            setIsSubmitLoading(false);
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
                toast.error("❌ Verification failed: " + (recaptchaResult.message || "Unknown error"));
                setIsSubmitLoading(false);
                return;
            }

            let profileVerificationImages: string[] = uploadedFiles
                .filter((file) => file.isExisting)
                .map((file) => file.preview);

            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach((file) => formData.append("images", file));
                const uploadResponse = await uploadFile(formData).unwrap();
                profileVerificationImages = [...profileVerificationImages, ...(uploadResponse.data || [])];
            }

            const payload = {
                email: data.email || profileData?.data?.email || "",
                address: {
                    flatOrHouseNo: data.address?.flatOrHouseNo || "",
                    address: data.address?.address || "",
                    state: data.address?.state || "",
                    city: data.address?.city || "",
                    town: data.address?.town || "",
                    area: data.address?.area || "",
                },
                profileVerificationImage: profileVerificationImages,
            };

            await updateProfile(payload).unwrap();
            toast.success("Profile updated successfully! Wait for admin approval.");
            setSelectedFiles([]);
            setUploadedFiles([]);
            setIsSubmitLoading(false);
            router.push("/landlord/profile");
        } catch (error) {
            toast.error("Profile update failed. Please try again.");
            console.error("Submission error:", error);
            setIsSubmitLoading(false);
        }
    };

    const isVerified = userData.isVerified || false;

    // Render loading state while profile data is being fetched
    if (isProfileLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="bg-gray-50 py-8 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Profile Verification – Boost Your Credibility!
                    </h1>
                    <p className="text-sm text-gray-600">Update Your Profile - Easy, Quick, and Secure</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-900">Email</Label>
                            <Input
                                {...register("email")}
                                readOnly
                                type="email"
                                placeholder="Email"
                                className="h-12 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium text-gray-700">Location:</Label>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-gray-500 mb-1">Flat or House Number</Label>
                                        <Input
                                            {...register("address.flatOrHouseNo")}
                                            placeholder="Flat or House Number"
                                            className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                                        />
                                        {errors.address?.flatOrHouseNo && (
                                            <p className="text-xs text-red-500">{errors.address.flatOrHouseNo.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-gray-500 mb-1">Address</Label>
                                        <Input
                                            {...register("address.address")}
                                            placeholder="Address"
                                            className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                                        />
                                        {errors.address?.address && (
                                            <p className="text-xs text-red-500">{errors.address.address.message}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium text-gray-500 mb-1">State</Label>
                                            <StateInput
                                                form={form}
                                                name="address.state"
                                                placeholder="State"
                                                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                                            />
                                            {errors.address?.state && (
                                                <p className="text-xs text-red-500">{errors.address.state.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium text-gray-500 mb-1">City</Label>
                                            <CityInput
                                                form={form}
                                                name="address.city"
                                                placeholder="City"
                                                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                                            />
                                            {errors.address?.city && (
                                                <p className="text-xs text-red-500">{errors.address.city.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium text-gray-500 mb-1">Town</Label>
                                            <Input
                                                {...register("address.town")}
                                                placeholder="Town"
                                                className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                                            />
                                            {errors.address?.town && (
                                                <p className="text-xs text-red-500">{errors.address.town.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium text-gray-500 mb-1">Area</Label>
                                        <Input
                                            {...register("address.area")}
                                            placeholder="Area code"
                                            className="h-12 border-gray-300 rounded-lg focus:border-primary focus:ring-primary"
                                        />
                                        {errors.address?.area && (
                                            <p className="text-xs text-red-500">{errors.address.area.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-12 bg-background-secondary p-2 rounded-lg">
                            <FileUploader
                                files={uploadedFiles}
                                setFiles={setUploadedFiles}
                                existingFiles={userData.profileVerificationImage || []}
                                maxFileSize={10 * 1024 * 1024} // 10MB
                                maxFiles={25}
                                accept="image/*,.pdf,.doc,.docx"
                                isDisabled={isUploading || isUpdating || isVerified}
                                onUpload={handleUpload}
                            />
                        </div>

                        <div className="mb-6">
                            <p className={`font-medium ${isVerified ? "text-green-600" : "text-red-600"}`}>
                                Status: {isVerified ? "Verified" : "Not Verified"}
                            </p>
                            {userData.profileVerificationImage?.length > 0 && !isVerified && (
                                <p className="text-sm text-gray-600 mt-2">
                                    Already submitted your document. Please wait for admin approval.
                                </p>
                            )}
                        </div>

                        <div className="rounded-lg py-8 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Get Verified?</h2>
                            <div className="space-y-4 text-gray-600">
                                <p>
                                    A verified badge on your profile enhances trust and significantly increases your chances of receiving
                                    enquiries.
                                </p>
                                <p>
                                    <span className="font-medium">Optional:</span> Upload a valid government-approved ID (e.g., passport,
                                    NIN, or bank statement showing your full name) to get verified.
                                </p>
                                <p>Unverified profiles will remain active but may receive fewer enquiries.</p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                                onChange={(value) => setCaptchaValue(value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                type="submit"
                                className="cursor-pointer px-8 py-3 bg-primary hover:bg-primary/80 text-white"
                                disabled={isUploading || isUpdating || isVerified || isSubmitLoading}
                            >
                                {isUploading ? "Uploading..." : isUpdating ? "Updating..." : isSubmitLoading ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
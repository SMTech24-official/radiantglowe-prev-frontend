/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import ReusableTable from "@/components/shared/ReusableTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTenancyAgreementQuery, useUpdateTenancyAgreementMutation } from "@/redux/api/tenancyAgreementApi";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

// Define TypeScript interfaces for the data structure
interface Address {
    flatOrHouseNo: string;
    address: string;
    state: string;
    city: string;
    town: string;
    area: string;
    _id: string;
}

interface Landlord {
    _id: string;
    email: string;
    name: string;
    phoneNumber: string;
    address: Address;
    role: string;
    isDeleted: boolean;
    registerBy: string;
    isVerified: boolean;
    image: string;
    profileVerificationImage: string[];
    websiteUrl: string;
    lookingPropertyForTenant: string[];
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    uid: string;
    references: any[];
}

interface Tenant {
    _id: string;
    email: string;
    name: string;
    phoneNumber: string;
    address: Address;
    role: string;
    isDeleted: boolean;
    registerBy: string;
    isVerified: boolean;
    isActive: boolean;
    image: string;
    profileVerificationImage: string[];
    websiteUrl: string;
    lookingPropertyForTenant: string[];
    guarantor: any;
    references: any[];
    createdAt: string;
    updatedAt: string;
    uid: string;
    __v: number;
}

interface Property {
    _id: string;
    landlordId: string;
    headlineYourProperty: string;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    livingRooms: number;
    kitchen: number;
    description: string;
    images: string[];
    status: string;
    gender: string;
    features: string[];
    formAvailable: string;
    furnished: string;
    ages: string;
    rentPerYear: number;
    rentPerMonth: number;
    serviceCharge: number;
    depositAmount: number;
    isIncludeAllUtilityWithService: boolean;
    minimumLengthOfContract: number;
    isReferenceRequired: boolean;
    accessYourProperty: string[];
    mediaLink: string;
    isAcceptTermsAndCondition: boolean;
    isRemoteVideoView: boolean;
    isHomePageView: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    PID: number;
    __v: number;
}

interface TenancyAgreement {
    _id: string;
    propertyId: Property;
    landlordId: Landlord;
    tenantId: Tenant;
    tenancyPeriod: string;
    renewalNoticeDays: string;
    terminationNoticeWeeks: string;
    arbitrationState: string;
    governingLawState: string;
    landlordSignature: string;
    tenantSignature: string;
    witnessSignature: string;
    isActiveLandlord: boolean;
    isActiveTenant: boolean;
    status: string;
    agreementDate: string;
    rejectionReason: string;
    createdAt: string;
    updatedAt: string;
    agreementId: number;
    __v: number;
}

// Define a Column type for table columns
type Column<T> = {
    header: string;
    accessor: (row: T) => React.ReactNode;
    minWidth?: string;
    className?: string;
};

// Define the TenancyAgreementPage component
const TenancyAgreementPage: React.FC = () => {
    const { data, isLoading } = useGetTenancyAgreementQuery({
        status: "",
        otherId: "",
        propertyId: "",
        page: "1",
        limit: "10",
    });
    const [updateTenancyAgreement, { isLoading: isUpdating }] = useUpdateTenancyAgreementMutation();
    const [updatingRowId, setUpdatingRowId] = useState<string | null>(null);

    const router = useRouter();
    // Extract agreements from the response
    const agreements: TenancyAgreement[] = data?.data?.agreements || [];

    // Handle status update
    const handleStatusChange = async (row: TenancyAgreement, newStatus: string) => {
        try {
            setUpdatingRowId(row._id);
            await updateTenancyAgreement({
                id: row._id,
                data: { status: newStatus },
            }).unwrap();
            toast.success("Tenancy agreement status updated successfully!");
        } catch (error) {
            toast.error((error as any)?.data?.message || "Failed to update tenancy agreement status.");
        } finally {
            setUpdatingRowId(null);
        }
    };

    // Define table columns
    const columns: Column<TenancyAgreement>[] = [
        {
            header: "Landlord Email",
            accessor: (row) => row.landlordId.email,
            minWidth: "200px",
        },
        {
            header: "Tenant Email",
            accessor: (row) => row.tenantId.email,
            minWidth: "200px",
        },
        {
            header: "Property Headline",
            accessor: (row) => row.propertyId.headlineYourProperty,
            minWidth: "250px",
        },
        {
            header: "Status",
            accessor: (row) => (
                row.status === "complete" ? (
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Completed
                    </span>
                ) : (
                    <Select
                        value={row.status}
                        onValueChange={(value) => handleStatusChange(row, value)}
                        disabled={updatingRowId === row._id && isUpdating}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="enable">Enable</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                        </SelectContent>
                    </Select>
                )
            ),
            minWidth: "150px",
        },
        {
            header: "Actions",
            accessor: (row) => (
                <>
                    <button title="View" onClick={() => router.push(`/tenancy-agreement?id=${row._id}`)}>
                        <Eye className="w-4 h-4" />
                    </button>
                </>
            ),
            minWidth: "250px",
        },
    ];

    // Render loading state
    if (isLoading) {
        return (
            <div className="w-full space-y-4 p-4">
                <Skeleton className="h-12 w-full" /> {/* Header skeleton */}
                {[...Array(5)].map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" /> // Row skeletons
                ))}
            </div>
        );
    }

    return (
        <div className="w-full bg-white mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Tenancy Agreements</h1>
            <ReusableTable
                data={agreements}
                columns={columns}
                itemsPerPage={10}
                className="rounded-lg border border-gray-200 shadow-sm"
                firstColumnWidth="200px"
                total={data?.data?.total || 0}
                isLoading={isLoading}
                currentPage={parseInt(data?.data?.page || "1")}
                onPageChange={() => { }}
            />
        </div>
    );
};

export default TenancyAgreementPage;
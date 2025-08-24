/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Breadcrumb from "@/components/shared/Breadcrumb";
import TenantsProfileCard from "@/components/tenants/TenantsProfileCard";
import React, { useState } from "react";
import { useGetMyTenancyAgreementsQuery, useAcceptRejectTenancyAgreementMutation } from "@/redux/api/tenancyAgreementApi";
import ReusableTable from "@/components/shared/ReusableTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Define interfaces for the API response
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
  location: Address;
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
  tenantId: string;
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

export default function TenantTenancyAgreementPage() {
  const router = useRouter();
  const { data, isLoading } = useGetMyTenancyAgreementsQuery(undefined);
  const [acceptRejectTenancy, { isLoading: isProcessing }] = useAcceptRejectTenancyAgreementMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);

  // Extract agreements from the response
  const agreements: TenancyAgreement[] = data?.data?.agreements || [];

  // Handle accept/reject action
  const handleAcceptReject = async (agreementId: string, action: "accept" | "reject") => {
    try {
      const payload: { action: "accept" | "reject"; reason?: string } = { action };
      if (action === "reject") {
        payload.reason = rejectionReason;
      }
      await acceptRejectTenancy({ id: agreementId, data: payload }).unwrap();
      toast.success(`Tenancy agreement ${action}ed successfully!`);
      setIsModalOpen(false);
      setRejectionReason("");
      setSelectedAgreementId(null);
    } catch (error) {
      toast.error((error as any)?.data?.message || `Failed to ${action} tenancy agreement.`);
    }
  };

  // Handle reject button click to open modal
  const handleRejectClick = (agreementId: string) => {
    setSelectedAgreementId(agreementId);
    setIsModalOpen(true);
  };

  // Define table columns
  const columns: Column<TenancyAgreement>[] = [
    {
      header: "Property Headline",
      accessor: (row) => row.propertyId.headlineYourProperty,
      minWidth: "250px",
    },
    {
      header: "Landlord Email",
      accessor: (row) => row.landlordId.email,
      minWidth: "200px",
    },
    {
      header: "Agreement Status",
      accessor: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.status === "enable" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
          }`}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
      minWidth: "150px",
    },
    {
      header: "Agreement Date",
      accessor: (row) => new Date(row.agreementDate).toLocaleDateString(),
      minWidth: "150px",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/tenancy-agreement?id=${row._id}`)}
            title="View Agreement"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!row.isActiveTenant && (
            <Select
              onValueChange={(value) => {
                if (value === "accept") {
                  handleAcceptReject(row._id, "accept");
                } else if (value === "reject") {
                  handleRejectClick(row._id);
                }
              }}
              disabled={isProcessing && selectedAgreementId === row._id}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accept">Accept</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      ),
      minWidth: "150px",
    },
  ];

  // Render loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-4">
        <Skeleton className="h-12 w-full" />
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        title="Tenancy Agreement"
        shortDescription="Manage Your Tenancy Agreement"
      />
      <div className="container mx-auto py-10 space-y-10">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <TenantsProfileCard />
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-center md:text-start">
              Your Tenancy Agreement
            </h1>
            <p className="pt-4 text-center md:text-start">Manage Your Tenancy Agreement</p>
          </div>
        </div>

        <div>
          <ReusableTable
            data={agreements}
            columns={columns}
            itemsPerPage={10}
            className="rounded-lg border border-gray-200 shadow-sm"
            firstColumnWidth="250px"
            total={data?.data?.total || 0}
            isLoading={isLoading}
            currentPage={parseInt(data?.data?.page || "1")}
            onPageChange={() => {}}
          />
        </div>

        {/* Rejection Reason Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reason for Rejection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="rejectionReason">Please provide a reason for rejecting the tenancy agreement</Label>
              <Input
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setRejectionReason("");
                  setSelectedAgreementId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedAgreementId && handleAcceptReject(selectedAgreementId, "reject")}
                disabled={!rejectionReason || isProcessing}
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
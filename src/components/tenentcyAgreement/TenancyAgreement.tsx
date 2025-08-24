/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useGetSingleTenancyAgreementQuery, useSignTenancyAgreementMutation, useUpdateTenancyAgreementMutation } from "@/redux/api/tenancyAgreementApi";
import { useUploadFileMutation } from "@/redux/api/uploaderApi";
import { RootState } from "@/redux/store";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

// Define interfaces for API response
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
}

interface Tenant {
  _id: string;
  email: string;
  name: string;
  phoneNumber: string;
  address: Address;
}

interface Property {
  _id: string;
  headlineYourProperty: string;
  propertyType: string;
  furnished: string;
  rentPerYear: number;
  depositAmount: number;
  location: Address;
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
  status: string;
  agreementDate: string;
}

// Define the type for formData
interface FormData {
  landlordName: string;
  landlordEmail: string;
  landlordPhone: string;
  landlordFlatHouseNumber: string;
  landlordAddress: string;
  landlordState: string;
  landlordCity: string;
  landlordTown: string;
  landlordAreaCode: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  tenantFlatHouseNumber: string;
  tenantAddress: string;
  tenantState: string;
  tenantCity: string;
  tenantTown: string;
  tenantAreaCode: string;
  propertyType: string;
  propertyFurnished: string;
  propertyFlatHouseNumber: string;
  propertyAddress: string;
  propertyState: string;
  propertyCity: string;
  propertyTown: string;
  propertyAreaCode: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
  rentAmountWords: string;
  securityDeposit: string;
  securityDepositPercentage: string;
  securityDepositReturnDays: string;
  tenancyPeriod: string;
  renewalNoticeDays: string;
  terminationNoticeWeeks: string;
  arbitrationState: string;
  governingLawState: string;
  landlordSignature: string;
  tenantSignature: string;
  witnessSignature: string;
}

export default function TenancyAgreement() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading } = useGetSingleTenancyAgreementQuery(id || "", { skip: !id });
  const [updateTenancyAgreement, { isLoading: isUpdating }] = useUpdateTenancyAgreementMutation();
  const [signTenancyAgreement, { isLoading: isSigning }] = useSignTenancyAgreementMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const [formData, setFormData] = useState<FormData>({
    landlordName: "",
    landlordEmail: "",
    landlordPhone: "",
    landlordFlatHouseNumber: "",
    landlordAddress: "",
    landlordState: "",
    landlordCity: "",
    landlordTown: "",
    landlordAreaCode: "",
    tenantName: "",
    tenantEmail: "",
    tenantPhone: "",
    tenantFlatHouseNumber: "",
    tenantAddress: "",
    tenantState: "",
    tenantCity: "",
    tenantTown: "",
    tenantAreaCode: "",
    propertyType: "",
    propertyFurnished: "",
    propertyFlatHouseNumber: "",
    propertyAddress: "",
    propertyState: "",
    propertyCity: "",
    propertyTown: "",
    propertyAreaCode: "",
    startDate: "",
    endDate: "",
    rentAmount: "",
    rentAmountWords: "",
    securityDeposit: "",
    securityDepositPercentage: "",
    securityDepositReturnDays: "",
    tenancyPeriod: "",
    renewalNoticeDays: "",
    terminationNoticeWeeks: "",
    arbitrationState: "",
    governingLawState: "",
    landlordSignature: "",
    tenantSignature: "",
    witnessSignature: "",
  });

  const landlordSigCanvas = useRef<SignatureCanvas>(null);
  const tenantSigCanvas = useRef<SignatureCanvas>(null);
  const user = useSelector((state: RootState) => ({
    role: state.auth.role,
  }));
  const [userRole, setUserRole] = useState<"admin" | "landlord" | "tenant">();

  useEffect(() => {
    setUserRole(user?.role as any);
  }, [user?.role]);

  // Populate form with API data
  useEffect(() => {
    if (data?.data) {
      const agreement: TenancyAgreement = data.data;
      setFormData({
        landlordName: agreement.landlordId.name,
        landlordEmail: agreement.landlordId.email,
        landlordPhone: agreement.landlordId.phoneNumber,
        landlordFlatHouseNumber: agreement.landlordId.address.flatOrHouseNo,
        landlordAddress: agreement.landlordId.address.address,
        landlordState: agreement.landlordId.address.state,
        landlordCity: agreement.landlordId.address.city,
        landlordTown: agreement.landlordId.address.town,
        landlordAreaCode: agreement.landlordId.address.area,
        tenantName: agreement.tenantId.name,
        tenantEmail: agreement.tenantId.email,
        tenantPhone: agreement.tenantId.phoneNumber,
        tenantFlatHouseNumber: agreement.tenantId.address.flatOrHouseNo,
        tenantAddress: agreement.tenantId.address.address,
        tenantState: agreement.tenantId.address.state,
        tenantCity: agreement.tenantId.address.city,
        tenantTown: agreement.tenantId.address.town,
        tenantAreaCode: agreement.tenantId.address.area,
        propertyType: agreement.propertyId.propertyType,
        propertyFurnished: agreement.propertyId.furnished,
        propertyFlatHouseNumber: agreement.propertyId.location.flatOrHouseNo,
        propertyAddress: agreement.propertyId.location.address,
        propertyState: agreement.propertyId.location.state,
        propertyCity: agreement.propertyId.location.city,
        propertyTown: agreement.propertyId.location.town,
        propertyAreaCode: agreement.propertyId.location.area,
        startDate: agreement.agreementDate.split("T")[0],
        endDate: "", // Calculate or fetch if available
        rentAmount: agreement.propertyId.rentPerYear.toString(),
        rentAmountWords: "", // Convert number to words if needed
        securityDeposit: agreement.propertyId.depositAmount.toString(),
        securityDepositPercentage: "", // Calculate if needed
        securityDepositReturnDays: "",
        tenancyPeriod: agreement.tenancyPeriod,
        renewalNoticeDays: agreement.renewalNoticeDays,
        terminationNoticeWeeks: agreement.terminationNoticeWeeks,
        arbitrationState: agreement.arbitrationState,
        governingLawState: agreement.governingLawState,
        landlordSignature: agreement.landlordSignature,
        tenantSignature: agreement.tenantSignature,
        witnessSignature: agreement.witnessSignature,
      });
    }
  }, [data]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSignature = async (role: "landlord" | "tenant") => {
    const canvas = role === "landlord" ? landlordSigCanvas.current : tenantSigCanvas.current;
    if (!canvas || canvas.isEmpty()) {
      toast.error("Please provide a signature.");
      return;
    }

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const uploadFormData = new FormData();
      uploadFormData.append("images", blob, `${role}-signature.png`);

      const uploadResponse = await uploadFile(uploadFormData).unwrap();
      const imageUrl = uploadResponse.data?.[0] || null;

      if (imageUrl) {
        await signTenancyAgreement({
          id: id || "",
          data: { signature: imageUrl },
        }).unwrap();
        setFormData((prev) => ({
          ...prev,
          [role === "landlord" ? "landlordSignature" : "tenantSignature"]: imageUrl,
        }));
        toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} signature saved successfully!`);
      }
    } catch (error) {
      toast.error("Failed to save signature.");
    }
  };

  const handleClearSignature = (role: "landlord" | "tenant") => {
    const canvas = role === "landlord" ? landlordSigCanvas.current : tenantSigCanvas.current;
    if (canvas) {
      canvas.clear();
    }
  };

  const handleUpdateStatus = async (status: "draft" | "enable") => {
    try {
      await updateTenancyAgreement({
        id: id || "",
        data: {
          status,
          tenancyPeriod: formData.tenancyPeriod,
          renewalNoticeDays: formData.renewalNoticeDays,
          terminationNoticeWeeks: formData.terminationNoticeWeeks,
          arbitrationState: formData.arbitrationState,
          governingLawState: formData.governingLawState,
        },
      }).unwrap();
      toast.success(`Tenancy agreement updated to ${status} successfully!`);
    } catch (error) {
      toast.error("Failed to update tenancy agreement.");
    }
  };

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const win = window.open("", "", "width=900,height=650");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Tenancy Agreement</title>
          <style>
            @media print {
              body {
                font-family: sans-serif;
                margin:  trudno20px;
              }
              .no-print {
                display: none;
              }
            }
            .print-container {
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContents}
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const isAdmin = userRole === "admin";
  const isLandlord = userRole === "landlord";
  const isTenant = userRole === "tenant";

  return (
    <div className="min-h-screen bg-white p-6 mt-10" ref={printRef}>
      {isLoading ? (
        <div className="w-full space-y-4">
          <Skeleton className="h-12 w-full" />
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <p className="2xl:text-2xl text-xl font-medium">
              This tenancy agreement (&ldquo;Agreement&ldquo;) is made on {new Date(data?.data?.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
              })} under Nigerian law between:
            </p>
          </div>

          {/* Parties Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">PARTIES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Landlord */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Landlord</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="landlordName">Name</Label>
                    <Input
                      id="landlordName"
                      value={formData.landlordName}
                      onChange={(e) => handleInputChange("landlordName", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlordPhone">Telephone</Label>
                    <Input
                      id="landlordPhone"
                      value={formData.landlordPhone}
                      onChange={(e) => handleInputChange("landlordPhone", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="landlordEmail">Email</Label>
                  <Input
                    id="landlordEmail"
                    type="email"
                    value={formData.landlordEmail}
                    onChange={(e) => handleInputChange("landlordEmail", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="landlordFlatHouseNumber">Flat/House Number</Label>
                  <Input
                    id="landlordFlatHouseNumber"
                    value={formData.landlordFlatHouseNumber}
                    onChange={(e) => handleInputChange("landlordFlatHouseNumber", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="landlordAddress">Address</Label>
                  <Textarea
                    id="landlordAddress"
                    value={formData.landlordAddress}
                    onChange={(e) => handleInputChange("landlordAddress", e.target.value)}
                    className="mt-1"
                    rows={2}
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="landlordCity">City</Label>
                    <Input
                      id="landlordCity"
                      value={formData.landlordCity}
                      onChange={(e) => handleInputChange("landlordCity", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlordState">State</Label>
                    <Input
                      id="landlordState"
                      value={formData.landlordState}
                      onChange={(e) => handleInputChange("landlordState", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="landlordTown">Town</Label>
                    <Input
                      id="landlordTown"
                      value={formData.landlordTown}
                      onChange={(e) => handleInputChange("landlordTown", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="landlordAreaCode">Area Code</Label>
                  <Input
                    id="landlordAreaCode"
                    value={formData.landlordAreaCode}
                    onChange={(e) => handleInputChange("landlordAreaCode", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
              </div>

              <Separator />

              {/* Tenant */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Tenant 1</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenantName">Name</Label>
                    <Input
                      id="tenantName"
                      value={formData.tenantName}
                      onChange={(e) => handleInputChange("tenantName", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantPhone">Telephone</Label>
                    <Input
                      id="tenantPhone"
                      value={formData.tenantPhone}
                      onChange={(e) => handleInputChange("tenantPhone", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tenantEmail">Email</Label>
                  <Input
                    id="tenantEmail"
                    type="email"
                    value={formData.tenantEmail}
                    onChange={(e) => handleInputChange("tenantEmail", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="tenantFlatHouseNumber">Flat/House Number</Label>
                  <Input
                    id="tenantFlatHouseNumber"
                    value={formData.tenantFlatHouseNumber}
                    onChange={(e) => handleInputChange("tenantFlatHouseNumber", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="tenantAddress">Address</Label>
                  <Textarea
                    id="tenantAddress"
                    value={formData.tenantAddress}
                    onChange={(e) => handleInputChange("tenantAddress", e.target.value)}
                    className="mt-1"
                    rows={2}
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tenantCity">City</Label>
                    <Input
                      id="tenantCity"
                      value={formData.tenantCity}
                      onChange={(e) => handleInputChange("tenantCity", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantState">State</Label>
                    <Input
                      id="tenantState"
                      value={formData.tenantState}
                      onChange={(e) => handleInputChange("tenantState", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantTown">Town</Label>
                    <Input
                      id="tenantTown"
                      value={formData.tenantTown}
                      onChange={(e) => handleInputChange("tenantTown", e.target.value)}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tenantAreaCode">Area Code</Label>
                  <Input
                    id="tenantAreaCode"
                    value={formData.tenantAreaCode}
                    onChange={(e) => handleInputChange("tenantAreaCode", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Property details:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="propertyType">Property Type</Label>
                <Input
                  id="propertyType"
                  value={formData.propertyType}
                  onChange={(e) => handleInputChange("propertyType", e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Apartment, House, etc."
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="propertyFurnished">Furnished Status</Label>
                <Select
                  value={formData.propertyFurnished}
                  onValueChange={(value) => handleInputChange("propertyFurnished", value)}
                  disabled
                >
                  <SelectTrigger id="propertyFurnished" className="mt-1">
                    <SelectValue placeholder="Select furnished status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fully Furnished">Fully Furnished</SelectItem>
                    <SelectItem value="Partially Furnished">Partially Furnished</SelectItem>
                    <SelectItem value="Unfurnished">Unfurnished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="propertyFlatHouseNumber">Flat/House Number</Label>
                <Input
                  id="propertyFlatHouseNumber"
                  value={formData.propertyFlatHouseNumber}
                  onChange={(e) => handleInputChange("propertyFlatHouseNumber", e.target.value)}
                  className="mt-1"
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="propertyAddress">Address</Label>
                <Textarea
                  id="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                  className="mt-1"
                  rows={2}
                  readOnly
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="propertyCity">City</Label>
                  <Input
                    id="propertyCity"
                    value={formData.propertyCity}
                    onChange={(e) => handleInputChange("propertyCity", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="propertyState">State</Label>
                  <Input
                    id="propertyState"
                    value={formData.propertyState}
                    onChange={(e) => handleInputChange("propertyState", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="propertyTown">Town</Label>
                  <Input
                    id="propertyTown"
                    value={formData.propertyTown}
                    onChange={(e) => handleInputChange("propertyTown", e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="propertyAreaCode">Area Code</Label>
                <Input
                  id="propertyAreaCode"
                  value={formData.propertyAreaCode}
                  onChange={(e) => handleInputChange("propertyAreaCode", e.target.value)}
                  className="mt-1"
                  readOnly
                />
              </div>
            </CardContent>
          </Card>

          {/* Legal Terms Sections */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold">Tenancy Term</h2>
              <div className="mt-4 space-y-2 text-sm text-left max-w-3xl mx-auto">
                <p>
                  <strong>1. Fixed Term:</strong> The tenancy shall be for a fixed period of{" "}
                  <Input
                    id="tenancyPeriod"
                    value={formData.tenancyPeriod}
                    onChange={(e) => handleInputChange("tenancyPeriod", e.target.value)}
                    className="inline-block w-24 mx-1"
                    placeholder="e.g., 1 year"
                    readOnly={!isAdmin}
                  />, commencing on{" "}
                  <Input
                    id="startDateDisplay"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className="inline-block w-40 mx-1"
                    readOnly
                  />{" "}
                  and ending on{" "}
                  <Input
                    id="endDateDisplay"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className="inline-block w-40 mx-1"
                    readOnly
                  />.
                </p>
                <p>
                  <strong>2. Renewal:</strong> Upon expiration, the tenancy may be renewed subject to mutual written agreement between both parties, provided that either party gives at least{" "}
                  <Input
                    id="renewalNoticeDays"
                    value={formData.renewalNoticeDays}
                    onChange={(e) => handleInputChange("renewalNoticeDays", e.target.value)}
                    className="inline-block w-16 mx-1"
                    placeholder="e.g., 30"
                    readOnly={!isAdmin}
                  /> days’ written notice prior to the end of the initial term.
                </p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">Rent & Payment Terms</h2>
              <div className="mt-4 space-y-2 text-sm text-left max-w-3xl mx-auto">
                <p>
                  <strong>3. Total Annual Rent:</strong> ₦
                  <Input
                    id="rentAmount"
                    type="number"
                    value={formData.rentAmount}
                    onChange={(e) => handleInputChange("rentAmount", e.target.value)}
                    className="inline-block w-32 mx-1"
                    readOnly
                  /> (
                  <Input
                    id="rentAmountWords"
                    value={formData.rentAmountWords}
                    onChange={(e) => handleInputChange("rentAmountWords", e.target.value)}
                    className="inline-block w-64 mx-1"
                    placeholder="Amount in words"
                    readOnly
                  /> Naira only).
                </p>
                <p><strong>4. Payment Terms:</strong> The full annual rent must be paid in advance before the Tenant takes occupancy.</p>
                <p>
                  <strong>5. Security Deposit:</strong> A refundable deposit of{" "}
                  <Input
                    id="securityDepositPercentage"
                    value={formData.securityDepositPercentage}
                    onChange={(e) => handleInputChange("securityDepositPercentage", e.target.value)}
                    className="inline-block w-16 mx-1"
                    placeholder="e.g., 10"
                    readOnly
                  /> % of the annual rent (₦
                  <Input
                    id="securityDeposit"
                    type="number"
                    value={formData.securityDeposit}
                    onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                    className="inline-block w-32 mx-1"
                    readOnly
                  />) is required. This deposit will be returned within{" "}
                  <Input
                    id="securityDepositReturnDays"
                    value={formData.securityDepositReturnDays}
                    onChange={(e) => handleInputChange("securityDepositReturnDays", e.target.value)}
                    className="inline-block w-16 mx-1"
                    placeholder="e.g., 30"
                    readOnly
                  /> days after the tenancy ends, less any deductions for property damage, outstanding bills, or breaches of the lease agreement.
                </p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">Utilities & Maintenance Responsibilities</h2>
              <div className="mt-4 space-y-2 text-sm text-left max-w-3xl mx-auto">
                <p><strong>6. Tenant’s Financial Obligations:</strong> The tenant is responsible for the following expenses:</p>
                <ul className="list-disc pl-6">
                  <li><strong>7.</strong> Electricity, Water supply, consumption charges, waste disposal services, internet and connectivity services.</li>
                  <li><strong>8.</strong> Minor repairs and maintenance (e.g., replacing light bulbs, fixing minor wear and tear).</li>
                </ul>
                <p><strong>9.</strong> Landlord’s Financial Obligations: The landlord shall cover:</p>
                <ul className="list-disc pl-6">
                  <li><strong>10.</strong> Structural repairs (including roofing, plumbing, and electrical wiring).</li>
                  <li><strong>11.</strong> Note: If structural damage results from tenant negligence, the tenant bears the cost.</li>
                </ul>
                <p><strong>12.Reporting Maintenance Issues:</strong> The tenant must notify the landlord of any damages or necessary repairs within 48 hours of discovery.</p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">Tenant Obligations & Property Restrictions</h2>
              <div className="mt-4 space-y-2 text-sm text-left max-w-3xl mx-auto">
                <p><strong>13. The Tenant Agrees To:</strong></p>
                <ul>
                  <li><strong>14.</strong> Use the property solely for residential purposes (no commercial use without written consent).</li>
                  <li><strong>15.</strong> Not sublet, assign, or modify the property without the landlord’s written permission.</li>
                  <li><strong>16.</strong> Refrain from any illegal activities or behaviour causing disturbances to neighbours.</li>
                  <li><strong>17.</strong> Permit the landlord 24-hour access for inspections or repairs (with prior notice, except in emergencies).</li>
                  <li><strong>18.</strong> Keep the interior of the premises and the fixtures, fittings, windows, and other things in good condition.</li>
                  <li><strong>33.</strong> Give the landlord at least{" "}
                    <Input
                      id="terminationNoticeWeeks"
                      value={formData.terminationNoticeWeeks}
                      onChange={(e) => handleInputChange("terminationNoticeWeeks", e.target.value)}
                      className="inline-block w-16 mx-1"
                      placeholder="e.g., 4"
                      readOnly={!isAdmin}
                    /> weeks’ notice in writing to end the tenancy.</li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">Dispute Resolution</h2>
              <div className="mt-4 space-y-2 text-sm text-left max-w-3xl mx-auto">
                <p><strong>41. Arbitration:</strong> Disputes shall be submitted to a neutral arbitrator within{" "}
                  <Input
                    id="arbitrationState"
                    value={formData.arbitrationState}
                    onChange={(e) => handleInputChange("arbitrationState", e.target.value)}
                    className="inline-block w-32 mx-1"
                    placeholder="e.g., Lagos"
                    readOnly={!isAdmin}
                  />, whose decision shall be binding.</p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold">Governing Law</h2>
              <div className="mt-4 space-y-2 text-sm text-left max-w-3xl mx-auto">
                <p><strong>43. Governing Law:</strong> This agreement shall be interpreted and enforced in accordance with:</p>
                <ul>
                  <li><strong>43.1.</strong> The Tenancy Laws of{" "}
                    <Input
                      id="governingLawState"
                      value={formData.governingLawState}
                      onChange={(e) => handleInputChange("governingLawState", e.target.value)}
                      className="inline-block w-32 mx-1"
                      placeholder="e.g., Lagos"
                      readOnly={!isAdmin}
                    /> (e.g., Lagos State Tenancy Law 2011).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Signatures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="landlordSignature">Landlord Signature</Label>
                  {isLandlord ? (
                    <>
                      <div>
                        {formData?.landlordSignature || data?.data?.landlordSignature ? (
                          <Image src={formData?.landlordSignature || data?.data?.landlordSignature} alt="Landlord Signature" className="h-12" width={100} height={50} />
                        ) : (
                          <div className="mt-2 border-b-2 border-gray-300 h-12"></div>
                        )}
                      </div>
                      <SignatureCanvas
                        ref={landlordSigCanvas}
                        canvasProps={{ className: "border border-gray-300 w-full h-32" }}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={() => handleSaveSignature("landlord")} disabled={isUploading || isSigning}>
                          Save Signature
                        </Button>
                        <Button variant="outline" onClick={() => handleClearSignature("landlord")}>
                          Clear
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div>
                      {formData.landlordSignature || data?.data?.landlordSignature ? (
                        <Image src={formData.landlordSignature || data?.data?.landlordSignature} alt="Landlord Signature" className="h-12" width={100} height={50} />
                      ) : (
                        <div className="mt-2 border-b-2 border-gray-300 h-12"></div>
                      )}
                      <p className="text-sm text-gray-600 mt-2">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <Label htmlFor="tenantSignature">Tenant Signature</Label>
                  {isTenant ? (
                    <>
                      <div>
                        {formData?.tenantSignature || data?.data?.tenantSignature ? (
                          <Image src={formData?.tenantSignature || data?.data?.tenantSignature} alt="Tenant Signature" className="h-12" width={100} height={50} />
                        ) : (
                          <div className="mt-2 border-b-2 border-gray-300 h-12"></div>
                        )}
                      </div>
                      <SignatureCanvas
                        ref={tenantSigCanvas}
                        canvasProps={{ className: "border border-gray-300 w-full h-32" }}
                      />
                      <div className="flex space-x-2">
                        <Button onClick={() => handleSaveSignature("tenant")} disabled={isUploading || isSigning}>
                          Save Signature
                        </Button>
                        <Button variant="outline" onClick={() => handleClearSignature("tenant")}>
                          Clear
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div>
                      {formData?.tenantSignature || data?.data?.tenantSignature ? (
                        <Image src={formData?.tenantSignature || data?.data?.tenantSignature} alt="Tenant Signature" className="h-12" width={100} height={50} />
                      ) : (
                        <div className="mt-2 border-b-2 border-gray-300 h-12"></div>
                      )}
                      <p className="text-sm text-gray-600 mt-2">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            {isAdmin && data?.data?.status !== 'complete' && (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleUpdateStatus("draft")}
                  disabled={isUpdating}
                >
                  Save as Draft
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleUpdateStatus("enable")}
                  disabled={isUpdating}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Enable
                </Button>
              </>
            )}
            {
              data?.data?.status === 'complete' && (
                <Button size="lg" disabled className="bg-green-500">
                  Completed
                </Button>
              )
            }
            <Button onClick={handlePrint} size="lg" className="bg-orange-500 hover:bg-orange-600">
              Print
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import DownloadAllImages from '@/components/shared/DownloadAllImages'
import { useSingleUserQuery, useVerifyUserMutation } from '@/redux/api/authApi'
import Image from 'next/image'
import { useParams } from "next/navigation"
import { useState } from 'react'
import { FaRegCircleCheck } from "react-icons/fa6"
import { TbFileDownload } from "react-icons/tb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LuUserRound } from 'react-icons/lu'
import { PiMapPinLine } from 'react-icons/pi'

interface Address {
  flatOrHouseNo?: string
  address: string
  city: string
  state: string
  town: string
  area: string
}

interface Guarantor {
  name: string
  telephone: string
  email: string
  profession: string
  address: Address
}

interface Reference {
  name: string
  telephone: string
  email: string
  profession: string
  address: Address
}

interface TenantData {
  name: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  joiningDate: string
  status: string
  guarantor: Guarantor
  references: Reference[]
}

const infoFields = [
  { label: "Full Name", key: "name" },
  { label: "Phone Number", key: "phoneNumber" },
  { label: "Email", key: "email" },
  { label: "Address", key: "address" },
  { label: "City", key: "city" },
  { label: "State", key: "state" },
  { label: "Zip Code", key: "zipCode" },
  { label: "Joining Date", key: "joiningDate" },
  { label: "Status", key: "status" },
]

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <div>
    <label className="block text-sm text-gray-500 mb-1">{label}</label>
    <p className="text-gray-900 font-medium">{value || "N/A"}</p>
  </div>
)

export default function AdminTenantsDetailsPage() {
  const params = useParams()
  const id = params.id as string

  const { data, isLoading, isError, refetch } = useSingleUserQuery(id)
  const [verifyMutate, { isLoading: isVerifyLoading }] = useVerifyUserMutation()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Format the tenant data from API response
  const tenantData = data?.data
    ? {
        name: data.data.name,
        phoneNumber: data.data.phoneNumber,
        email: data.data.email,
        address: `${data.data.address.flatOrHouseNo || ''}, ${data.data.address.address}`,
        city: data.data.address.city,
        state: data.data.address.state,
        zipCode: data.data.address.town || "N/A",
        joiningDate: new Date(data.data.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        status: data.data.isVerified ? "Verified" : "Not Verified",
        guarantor: {
          name: data.data.guarantor?.name || "N/A",
          telephone: data.data.guarantor?.telephone || "N/A",
          email: data.data.guarantor?.email || "N/A",
          profession: data.data.guarantor?.profession || "N/A",
          address: {
            flatOrHouseNo: data.data.guarantor?.address?.flatOrHouseNo || "",
            address: data.data.guarantor?.address?.address || "",
            city: data.data.guarantor?.address?.city || "",
            state: data.data.guarantor?.address?.state || "",
            town: data.data.guarantor?.address?.town || "",
            area: data.data.guarantor?.address?.area || "",
          },
        },
        references: data.data.references?.map((ref: any) => ({
          name: ref.name || "N/A",
          telephone: ref.telephone || "N/A",
          email: ref.email || "N/A",
          profession: ref.profession || "N/A",
          address: {
            address: ref.address?.address || "",
            city: ref.address?.city || "",
            state: ref.address?.state || "",
            town: ref.address?.town || "",
            area: ref.address?.area || "",
          },
        })) || [],
      }
    : null

  const handleVerifyClick = async () => {
    try {
      await verifyMutate({ id, isVerified: !data.data.isVerified }).unwrap()
      refetch()
    } catch (error) {
      // console.error("Failed to verify user:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full mx-auto mb-12 flex justify-center items-center min-h-[200px]">
        <CardContent>
          <div className="text-gray-500 text-lg">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !tenantData) {
    return (
      <Card className="w-full mx-auto mb-12 flex justify-center items-center min-h-[200px]">
        <CardContent>
          <div className="text-red-500 text-lg">
            {isError ? "Failed to load tenant details" : "No tenant data available"}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full  mx-auto mb-12 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 lg:p-6 pb-8">
        <div className="relative w-28 h-28 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={data?.data?.image || "/placeholder.svg"}
            alt={data?.data?.name}
            fill
            className="object-cover"
            sizes="112px"
            priority
          />
        </div>
        <div className="flex-1 pt-2">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3 leading-tight">
            {data?.data?.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <PiMapPinLine className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{data?.data?.address?.address}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="lg:px-6 pb-6">
        <div className="space-y-8">
          {/* Tenant Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-primary">
              <LuUserRound className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium text-primary">
                Tenant Information
              </CardTitle>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {infoFields.map(({ label, key }) => (
                <InfoItem key={key} label={label} value={tenantData[key as keyof typeof tenantData]} />
              ))}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Document</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImageModalOpen(true)}
                    disabled={!data?.data?.profileVerificationImage?.length}
                  >
                    <TbFileDownload className="w-5 h-5 mr-2" />
                    View Documents
                  </Button>
                  <Button
                    variant={data?.data?.isVerified ? "secondary" : "default"}
                    size="sm"
                    className={data?.data?.isVerified ? "bg-gray-100 text-gray-500" : "bg-green-500 hover:bg-green-600"}
                    onClick={handleVerifyClick}
                    disabled={data?.data?.isVerified || isVerifyLoading}
                  >
                    {isVerifyLoading ? "Verifying..." : data?.data?.isVerified ? "Verified" : "Verify"}
                    {data?.data?.isVerified && <FaRegCircleCheck className="w-5 h-5 ml-2" />}
                  </Button>
                  <Button
                    variant={data?.data?.isVerified ? "default" : "secondary"}
                    size="sm"
                    className={data?.data?.isVerified ? "bg-red-500 hover:bg-red-600" : "bg-gray-100 text-gray-500"}
                    onClick={handleVerifyClick}
                    disabled={!data?.data?.isVerified || isVerifyLoading}
                  >
                    {isVerifyLoading ? "Unverifying..." : data?.data?.isVerified ? "Unverify" : "Unverified"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Guarantor Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-primary">
              <LuUserRound className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium text-primary">
                Guarantor Information
              </CardTitle>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InfoItem label="Name" value={tenantData.guarantor.name} />
              <InfoItem label="Telephone" value={tenantData.guarantor.telephone} />
              <InfoItem label="Email" value={tenantData.guarantor.email} />
              <InfoItem label="Profession" value={tenantData.guarantor.profession} />
              <InfoItem
                label="Address"
                value={`${tenantData.guarantor.address.address}, ${tenantData.guarantor.address.city}, ${tenantData.guarantor.address.state}`}
              />
            </div>
          </div>

          {/* References Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-primary">
              <LuUserRound className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium text-primary">
                References
              </CardTitle>
            </div>
            {tenantData.references.map((reference:any, index:number) => (
              <div key={index} className="mb-6 last:mb-0">
                <h3 className="text-md font-semibold text-gray-800 mb-4">
                  Reference {index + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <InfoItem label="Name" value={reference.name} />
                  <InfoItem label="Telephone" value={reference.telephone} />
                  <InfoItem label="Email" value={reference.email} />
                  <InfoItem label="Profession" value={reference.profession} />
                  <InfoItem
                    label="Address"
                    value={
                      reference.address.address
                        ? `${reference.address.address}, ${reference.address.city}, ${reference.address.state}`
                        : "N/A"
                    }
                  />
                </div>
                {index < tenantData.references.length - 1 && <Separator className="my-6" />}
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Image Modal */}
      {isImageModalOpen && data?.data?.profileVerificationImage?.length && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <CardTitle className="text-lg font-semibold">Verification Documents</CardTitle>
                  <DownloadAllImages images={data?.data?.profileVerificationImage || []} filename={data?.data?.name || ""} />
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setIsImageModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data?.data?.profileVerificationImage.map((image: string, index: number) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Verification Document ${index + 1}`}
                    className="w-full h-auto object-contain rounded-md"
                    width={300}
                    height={300}
                    unoptimized
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  )
}
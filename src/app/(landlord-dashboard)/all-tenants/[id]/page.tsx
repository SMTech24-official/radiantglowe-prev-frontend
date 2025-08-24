/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import TenantDetailsCard from "@/components/shared/dashboard/TenantDetailsCard"
import { useSingleUserQuery } from "@/redux/api/authApi"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

// Transform API response to match tenantData structure
const transformTenantData = (apiData: any) => {
  if (!apiData) return null

  return {
    id: apiData._id,
    name: apiData.name,
    profileImage: apiData.image,
    currentAddress: `${apiData.address?.flatOrHouseNo || ''}, ${apiData.address?.address || ''}, ${apiData.address?.city || ''}, ${apiData.address?.state || ''}`,
    fullName: apiData.name,
    phoneNumber: apiData.phoneNumber,
    email: apiData.email,
    address: apiData.address?.address || '',
    city: apiData.address?.city || '',
    state: apiData.address?.state || '',
    zipCode: apiData.address?.zipCode || '',
    joiningDate: format(new Date(apiData.createdAt), 'dd MMMM yyyy'),
    status: apiData.isActive ? 'Active' : 'Inactive',
    isVerified: apiData.isVerified || false,
    guarantor: {
      name: apiData.guarantor?.name || 'N/A',
      telephone: apiData.guarantor?.telephone || 'N/A',
      email: apiData.guarantor?.email || 'N/A',
      profession: apiData.guarantor?.profession || 'N/A',
      address: {
        address: apiData.guarantor?.address?.address || '',
        state: apiData.guarantor?.address?.state || '',
        city: apiData.guarantor?.address?.city || '',
        town: apiData.guarantor?.address?.town || '',
        area: apiData.guarantor?.address?.area || '',
      },
    },
    references: apiData.references?.map((ref: any) => ({
      name: ref.name || '',
      telephone: ref.telephone || '',
      email: ref.email || '',
      profession: ref.profession || '',
      address: {
        address: ref.address?.address || '',
        state: ref.address?.state || '',
        city: ref.address?.city || '',
        town: ref.address?.town || '',
        area: ref.address?.area || '',
      },
    })) || [],
  }
}

export default function TenantDetailsPage() {
  const params = useParams()
  const id = params.id
  const { data, isLoading, isError } = useSingleUserQuery(id)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-2 text-gray-600">Loading tenant details...</p>
        </div>
      </div>
    )
  }

  if (isError || !data?.success) {
    return (
      <Card className="flex justify-center items-center h-screen bg-gray-100">
        <CardContent className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-500 text-center">Failed to load tenant details. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  const tenantData = transformTenantData(data?.data)

  return (
    <div className="p-4 min-h-screen">
      <TenantDetailsCard tenantData={tenantData as any} />
    </div>
  )
}
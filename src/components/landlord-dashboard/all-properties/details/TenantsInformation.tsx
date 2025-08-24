import { Skeleton } from "@/components/ui/skeleton"
import { usePropertyDetailsQuery } from "@/redux/api/propertyApi"
import { useParams } from "next/navigation"

export default function TenantsInformation() {
  const params = useParams()
  const id = params.id as string
  const { data, isLoading } = usePropertyDetailsQuery(id)

  if (isLoading) {
    return (
      <div className="w-full bg-white lg:p-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {Array(7).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Note: The API response doesn't contain specific tenant information
  // Using landlord information as placeholder since tenant data isn't available
  if (!data?.data?.tenant) {
    return <div>Tenant information not available</div>
  }

  const tenantData = {
    name: data?.data?.tenant.name,
    phoneNumber: data?.data.tenant.phoneNumber,
    email: data?.data?.tenant.email,
    address: `${data?.data?.tenant.address.flatOrHouseNo}, ${data.data.landlordId.address.address}`,
    city: data?.data?.tenant.address.city,
    state: data?.data?.tenant.address.state,
    zipCode: data?.data?.tenant.address.zipCode || "N/A",
  }

  return (
    <div className="w-full bg-white lg:p-6 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Full Name</label>
          <p className="text-gray-900 font-medium">{tenantData.name}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
          <p className="text-gray-900 font-medium">{tenantData.phoneNumber}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-500 mb-1">Email</label>
          <p className="text-gray-900 font-medium">{tenantData.email}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Address</label>
          <p className="text-gray-900 font-medium">{tenantData.address}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">City</label>
          <p className="text-gray-900 font-medium">{tenantData.city}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">State</label>
          <p className="text-gray-900 font-medium">{tenantData.state}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Zip Code</label>
          <p className="text-gray-900 font-medium">{tenantData.zipCode}</p>
        </div>
      </div>
    </div>
  )
}
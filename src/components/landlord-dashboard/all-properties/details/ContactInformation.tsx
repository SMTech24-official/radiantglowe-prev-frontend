import { useParams } from "next/navigation"
import { usePropertyDetailsQuery } from "@/redux/api/propertyApi"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContactInformation() {
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

  if (!data?.data?.landlordId) {
    return <div>Contact information not available</div>
  }

  const ownerData = {
    name: data.data.landlordId.name,
    phoneNumber: data.data.landlordId.phoneNumber,
    email: data.data.landlordId.email,
    address: `${data.data.landlordId.address.flatOrHouseNo}, ${data.data.landlordId.address.address}`,
    city: data.data.landlordId.address.city,
    state: data.data.landlordId.address.state,
    zipCode: data.data.landlordId.address.zipCode || "N/A",
  }

  return (
    <div className="w-full bg-white lg:p-6 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Owner Name</label>
          <p className="text-gray-900 font-medium">{ownerData.name}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
          <p className="text-gray-900 font-medium">{ownerData.phoneNumber}</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-500 mb-1">Email</label>
          <p className="text-gray-900 font-medium">{ownerData.email}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Address</label>
          <p className="text-gray-900 font-medium">{ownerData.address}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">City</label>
          <p className="text-gray-900 font-medium">{ownerData.city}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">State</label>
          <p className="text-gray-900 font-medium">{ownerData.state}</p>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Zip Code</label>
          <p className="text-gray-900 font-medium">{ownerData.zipCode}</p>
        </div>
      </div>
    </div>
  )
}
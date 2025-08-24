
import { usePropertyDetailsQuery } from "@/redux/api/propertyApi"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { symbol } from "@/utils/symbol"

const amenityIcons: { [key: string]: string } = {
  billsIncluded: "/icons/bills.svg",
  parking: "/icons/parking.svg",
  // Add more amenity icons as needed
}

export default function PropertiesInformation() {
  const params = useParams()
  const id = params.id as string
  const { data, isLoading } = usePropertyDetailsQuery(id)

  if (isLoading) {
    return (
      <div className="w-full bg-white lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
          {Array(8).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!data?.data) {
    return <div>Property information not available</div>
  }

  const propertyInfo = {
    name: data?.data?.headlineYourProperty,
    id: data?.data?.PID,
    propertiesAdded: 1, // This might need to come from another API endpoint
    bedrooms: `${data?.data?.bedrooms} Bedrooms`,
    guests: data?.data?.accessYourProperty.join(", "),
    postDate: new Date(data?.data?.createdAt).toLocaleDateString(),
    status: data?.data?.status,
    baths: `${data?.data?.bathrooms} Baths`,
    rentPerYear: `${symbol.nigeria}${data?.data?.rentPerYear ?? 0}/year`,
    rentPerMonth: `${symbol.nigeria}${data?.data?.rentPerMonth ?? 0}/month`,
    rentPerDay: `${symbol.nigeria}${data?.data?.rentPerDay ?? 0}/day`,
    amenities: data?.data?.features.map((feature: string) => ({
      name: feature.replace(/([A-Z])/g, " $1").trim(),
      icon: amenityIcons[feature] || "/placeholder.svg",
    })),
  }

  return (
    <div className="w-full bg-white lg:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
        <div className="md:col-span-1 space-y-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Properties</label>
            <p className="text-gray-900 font-medium">{propertyInfo.name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Properties ID</label>
            <p className="text-gray-900 font-medium">{propertyInfo.id}</p>
          </div>
          {/* <div>
            <label className="block text-sm text-gray-500 mb-1">Properties Added</label>
            <p className="text-gray-900 font-medium">{propertyInfo.propertiesAdded}</p>
          </div> */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Bedrooms</label>
            <p className="text-gray-900 font-medium">{propertyInfo.bedrooms}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Allowed Tenants</label>
            <p className="text-gray-900 font-medium">{propertyInfo.guests}</p>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Post Date</label>
            <p className="text-gray-900 font-medium">{propertyInfo.postDate}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Status</label>
            <p className="text-gray-900 font-medium">{propertyInfo.status}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Baths</label>
            <p className="text-gray-900 font-medium">{propertyInfo.baths}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Price</label>
            <p className="text-gray-900 font-medium">{propertyInfo.rentPerYear}</p>
            <p className="text-gray-900 font-medium">{propertyInfo.rentPerMonth}</p>
            <p className="text-gray-900 font-medium">{propertyInfo.rentPerDay}</p>
          </div>
        </div>

        <div className="md:col-span-1 space-y-4">
          {propertyInfo.amenities.map((amenity: { name: string; icon: string }, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 border border-gray-300 rounded-full py-2 px-4 w-fit"
            >
              {/* <div className="relative w-5 h-5 flex-shrink-0">
                <Image
                  src={amenity.icon}
                  alt={amenity.name}
                  fill
                  className="object-contain"
                />
              </div> */}
              <span className="text-gray-700 text-sm">{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
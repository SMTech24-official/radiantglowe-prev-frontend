'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { FaTelegram } from "react-icons/fa6"
import { LuMapPin, LuUserRound } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Address {
  address: string
  state: string
  city: string
  town: string
  area: string
  flatOrHouseNo?: string
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
  id: string
  name: string
  profileImage: string
  currentAddress: string
  fullName: string
  phoneNumber: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  joiningDate: string
  status: string
  isVerified: boolean
  guarantor: Guarantor
  references: Reference[]
}

export default function TenantDetailsCard({ tenantData }: { tenantData: TenantData }) {
  const router = useRouter()

  return (
    <Card className="w-full mx-auto mb-12 shadow-lg">
      <CardHeader className="flex items-start gap-6 md:p-6 pb-8">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={tenantData.profileImage || "/placeholder.svg"}
            alt={tenantData.name}
            fill
            className="object-cover"
            sizes="96px"
            priority
          />
        </div>
        <div className="flex-1 pt-2">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            {tenantData.name}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <LuMapPin className="w-5 h-5 text-primary" />
            <span className="text-sm">{tenantData.currentAddress}</span>
          </div>
          <p
            className={`text-sm inline-block px-2 py-0.5 mt-2 text-white rounded-md ${
              tenantData.isVerified ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {tenantData.isVerified ? "Verified" : "Not Verified"}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/landlord-live-chat`)}
          className="mt-4 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <FaTelegram className="w-4 h-4 mr-1 inline-block" />
          Send Message
        </Button>
      </CardHeader>

      <CardContent className="md:px-6 pb-6">
        <div className="space-y-8">
          {/* Tenants Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-primary">
              <LuUserRound className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-medium text-primary">
                Tenant Information
              </CardTitle>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <InfoItem label="Full Name" value={tenantData.fullName} full />
              <InfoItem label="Phone Number" value={tenantData.phoneNumber} />
              <InfoItem label="Email" value={tenantData.email} full />
              <InfoItem label="Address" value={tenantData.address} />
              <InfoItem label="City" value={tenantData.city} />
              <InfoItem label="State" value={tenantData.state} />
              <InfoItem label="Zip Code" value={tenantData.zipCode} />
              <InfoItem label="Joining Date" value={tenantData.joiningDate} />
              <InfoItem label="Status" value={tenantData.status} />
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
              <InfoItem label="Name" value={tenantData.guarantor.name} full />
              <InfoItem
                label="Telephone"
                value={tenantData.guarantor.telephone}
              />
              <InfoItem label="Email" value={tenantData.guarantor.email} full />
              <InfoItem
                label="Profession"
                value={tenantData.guarantor.profession}
              />
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
            {tenantData.references.map((reference, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <h3 className="text-md font-semibold text-gray-800 mb-4">
                  Reference {index + 1}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <InfoItem
                    label="Name"
                    value={reference.name || "N/A"}
                    full
                  />
                  <InfoItem
                    label="Telephone"
                    value={reference.telephone || "N/A"}
                  />
                  <InfoItem
                    label="Email"
                    value={reference.email || "N/A"}
                    full
                  />
                  <InfoItem
                    label="Profession"
                    value={reference.profession || "N/A"}
                  />
                  <InfoItem
                    label="Address"
                    value={
                      reference.address.address
                        ? `${reference.address.address}, ${reference.address.city}, ${reference.address.state}`
                        : "N/A"
                    }
                  />
                </div>
                {index < tenantData.references.length - 1 && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoItem({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      <p className="text-gray-900 font-medium">{value || "N/A"}</p>
    </div>
  )
}
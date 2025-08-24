'use client'

import { useLandlordMetaDataQuery } from "@/redux/api/dashboardApi"
import { Building2, Calendar, CalendarCheck, LoaderIcon, Users } from "lucide-react"
import { useRouter } from "next/navigation"


export default function DashboardStats() {
  const { data, isLoading } = useLandlordMetaDataQuery()
  const router = useRouter()

  const stats = [
    {
      title: "Total Properties",
      value: data?.data?.totalProperties?.toString() ?? "0",
      icon: Building2,
      redirectUrl: "/all-properties"
    },
    {
      title: "Total Booked Properties",
      value: data?.data?.totalBookedProperties?.toString() ?? "0",
      icon: CalendarCheck,
      redirectUrl: "/all-properties"
    },
    {
      title: "Today Booked Properties",
      value: data?.data?.todayBookedProperties?.toString() ?? "0", // Only if you have this field later
      icon: Calendar,
      redirectUrl: "/all-properties"
    },
    {
      title: "Total Tenants",
      value: data?.data?.totalTenants?.toString() ?? "0",
      icon: Users,
      redirectUrl: "/all-tenants"
    },
  ]

  return (
    <div className="w-full max-w-4xl py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div
              onClick={() => router.push(stat.redirectUrl)}
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-start mb-4 gap-2">
                <div className="p-2 bg-background-secondary rounded-lg">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <p className="text font-medium text-gray-600 leading-tight">{stat.title}</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-gray-900 leading-none">
                  {
                    isLoading ? <LoaderIcon className="animate-spin text-gray-300" /> : stat.value
                  }
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

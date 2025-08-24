'use client'
import { useAdminMetaDataQuery } from "@/redux/api/dashboardApi"
import { ListTodo, LoaderIcon, Users, UsersRound } from "lucide-react"

export default function AdminDashboardStats() {
  const { data: adminData, isLoading: adminLoading } = useAdminMetaDataQuery()
  const stats = [
    {
      title: "Total Listing Properties",
      value: adminData?.data?.totalListingProperties?.toString() ?? "0",
      icon: ListTodo,
      redirectTo: "/admin-dashboard/all-properties"
    },
    {
      title: "Total Tenants",
      value: adminData?.data?.totalTenants?.toString() ?? "0",
      icon: Users,
      redirectTo: "/admin-dashboard/all-tenants"
    },
    {
      title: "Total Landlords",
      value: adminData?.data?.totalLandlords?.toString() ?? "0",
      icon: UsersRound,
      redirectTo: "/admin-dashboard/all-landlords"
    },
    {
      title: "Total Earnings",
      value: adminData?.data?.totalEarnings?.toString() ?? "0",
      icon: UsersRound,
      redirectTo: "/admin-dashboard/subscriptions"
    },
  ]

  return (
    <div className="w-full max-w-4xl py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div
              onClick={() => {
                window.location.href = stat.redirectTo
              }}
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
                    adminLoading ? <LoaderIcon className="animate-spin text-gray-300" /> : stat.value
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

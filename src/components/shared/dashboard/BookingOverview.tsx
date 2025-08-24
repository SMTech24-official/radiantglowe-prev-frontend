"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminMetaDataQuery, useLandlordMetaDataQuery } from "@/redux/api/dashboardApi"
import { usePathname } from "next/navigation"

const chartConfig = {
  percentage: {
    label: "Total Bookings",
    color: "#B07E50",
  },
}

export default function BookingOverview() {
  const pathname = usePathname()
  const isAdmin = pathname.includes("admin-dashboard")

  const { data: landlordData, isLoading: landlordLoading } = useLandlordMetaDataQuery()
  const { data: adminData, isLoading: adminLoading } = useAdminMetaDataQuery()
  // Use adminData if pathname includes 'admin-dashboard', otherwise use landlordData
  const dataSource = isAdmin ? adminData : landlordData
  const isLoading = isAdmin ? adminLoading : landlordLoading

  // Transform API data to match chart format
  const bookingData =
    dataSource?.data?.bookingOverview?.map(
      (item: { month: string; count: number }) => {
        const date = new Date(item.month)
        const monthAbbrev = date.toLocaleString("default", {
          month: "short",
        }) // e.g., "Jan"
        return {
          day: monthAbbrev,
          percentage: item.count,
        }
      }
    ) || []

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Booking Overview
        </h2>
        <Select defaultValue="today">
          <SelectTrigger className="w-[100px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading ? (
          <Skeleton className="w-full h-[300px] rounded-xl" />
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={bookingData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="fillPercentage"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#B07E50"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="#B07E50"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#6b7280",
                    fontSize: 12,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#6b7280",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value}`, "Total Bookings"]}
                      labelFormatter={(label) => `${label}`}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#B07E50"
                  strokeWidth={2}
                  fill="url(#fillPercentage)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
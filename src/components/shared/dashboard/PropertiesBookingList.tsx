/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAllPropertyBookingQuery, useLandlordPropertyBookingQuery } from "@/redux/api/bookingApi"
import { format } from "date-fns"
import Image from "next/image"
import { usePathname } from "next/navigation"

export default function PropertiesBookingList() {
  // const router = useRouter()
  const pathname = usePathname()
  const isAdmin = pathname.includes("/admin-dashboard")

  const { data: landlordData, isLoading: landlordLoading } = useLandlordPropertyBookingQuery()
  const { data: allData, isLoading: allLoading } = useAllPropertyBookingQuery({})

  // Use allData if pathname includes '/admin-dashboard', otherwise use landlordData
  const dataSource = isAdmin ? allData : landlordData
  const isLoading = isAdmin ? allLoading : landlordLoading

  // Extract and process bookings
  const bookings = dataSource?.data?.bookings || []

  const recentBookings = bookings
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 7)

  // const handleViewAllBtn = () => {
  //   if (pathname === "/admin-dashboard") {
  //     router.push("/")
  //   } else {
  //     router.push("/all-properties")
  //   }
  // }

  return (
    <div className="w-full bg-white my-6 mb-16 rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-6 pt-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Properties Booking List
        </h2>
        {/* <button
          onClick={handleViewAllBtn}
          className="cursor-pointer border rounded-lg p-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          View All
        </button> */}
      </div>

      {/* Table */}
      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="text-center text-gray-600 py-8">Loading...</div>
        ) : recentBookings.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            No bookings available.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-gray-500 font-normal text-sm h-12 px-0">
                  Properties Name
                </TableHead>
                <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">
                  Properties Location
                </TableHead>
                <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">
                  Booking Date
                </TableHead>
                <TableHead className="text-gray-500 font-normal text-sm h-12 px-4">
                  Guests Name
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking: any) => (
                <TableRow
                  key={booking._id}
                  className="border-none hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="py-4 px-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                        <Image
                          src={
                            "https://images.pexels.com/photos/31750449/pexels-photo-31750449.jpeg"
                          }
                          alt={booking.propertyId?.headlineYourProperty || "Property"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-gray-900 font-medium text-sm">
                        {booking.propertyId?.headlineYourProperty || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">
                    {booking.propertyId?.location?.address || "N/A"},{" "}
                    {booking.propertyId?.location?.city || ""}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">
                    {format(new Date(booking.bookingDate), "dd MMMM yyyy")}
                  </TableCell>
                  <TableCell className="py-4 px-4 text-gray-700 text-sm">
                    {booking.tenantId?.name || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useDecodedToken } from "@/hooks/useDecodedToken"
import { useAllPropertyBookingQuery } from "@/redux/api/bookingApi"
import { Skeleton } from "@/components/ui/skeleton"
import { format, isSameMonth } from "date-fns"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star } from "lucide-react"
import { useCreateReviewMutation } from "@/redux/api/propertyReviewApi"
import { toast } from "sonner"

interface BookingData {
  _id: string
  tenantId: {
    _id: string
    email: string
    name: string
  }
  landlordId: {
    _id: string
    email: string
    name: string
  }
  propertyId: {
    location: {
      flatOrHouseNo: string
      address: string
      state: string
      city: string
      town: string
      area: string
    }
    _id: string
    headlineYourProperty: string
  }
  permissionId: {
    _id: string
    status: string
  },
  transaction:any
  paymentMethod: string
  paymentStatus: string
  amount: number
  bookingDate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  BID: number
  paymentDate: string
}

export default function ReferralTable() {
  const user = useDecodedToken(localStorage.getItem("accessToken")!)
  const { data: allData, isLoading: allLoading } = useAllPropertyBookingQuery({ tenantId: user?.userId as string })
  const [reviewMutation, { isLoading: reviewLoading }] = useCreateReviewMutation()
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const currentDate = new Date()

  const bookings = (allData?.data?.bookings || [])
    .filter((item: BookingData) => 
      pathname === "/tenants/previous-bookings"
        ? !isSameMonth(new Date(item.bookingDate), currentDate)
        : isSameMonth(new Date(item.bookingDate), currentDate)
    )
    .sort((a: BookingData, b: BookingData) => 
      new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    )

  const handleReviewSubmit = async () => {
    if (!rating || !reviewText.trim()) {
      setError("Please provide both rating and review text")
      return
    }

    try {
      await reviewMutation({
        property: selectedPropertyId!,
        rating,
        reviewText
      }).unwrap()
      setIsModalOpen(false)
      setRating(0)
      setReviewText("")
      setError(null)
      toast.success("Review submitted successfully!")
    } catch (err) {
      setError("Failed to submit review. Please try again.")
    }
  }

  const openReviewModal = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    setIsModalOpen(true)
  }

  return (
    <div className="w-full bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 hover:bg-transparent">
              <TableHead className="text-gray-500 font-normal text-sm py-4 px-6">Property Name</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm py-4 px-6 hidden sm:table-cell">
                Location
              </TableHead>
              <TableHead className="text-gray-500 font-normal text-sm py-4 px-6">Property Price</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm py-4 px-6 hidden md:table-cell">
                Booking Date
              </TableHead>
              <TableHead className="text-gray-500 font-normal text-sm py-4 px-6">Payment Method</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm py-4 px-6">Payment Ref.ID</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm py-4 px-6">Payment Status</TableHead>
              <TableHead className="text-gray-500 font-normal text-sm py-4 px-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <TableCell className="py-4 px-6"><Skeleton className="h-6 w-3/4" /></TableCell>
                  <TableCell className="py-4 px-6 hidden sm:table-cell"><Skeleton className="h-6 w-3/4" /></TableCell>
                  <TableCell className="py-4 px-6"><Skeleton className="h-6 w-1/4" /></TableCell>
                  <TableCell className="py-4 px-6 hidden md:table-cell"><Skeleton className="h-6 w-1/2" /></TableCell>
                  <TableCell className="py-4 px-6"><Skeleton className="h-6 w-1/3" /></TableCell>
                  <TableCell className="py-4 px-6"><Skeleton className="h-6 w-1/3" /></TableCell>
                  <TableCell className="py-4 px-6"><Skeleton className="h-6 w-1/3" /></TableCell>
                </TableRow>
              ))
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4 px-6 text-center text-gray-500">
                  {pathname === "/tenants/previous-bookings" ? "No previous bookings found" : "No bookings found for the current month"}
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((item: BookingData) => (
                <TableRow key={item._id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <TableCell className="py-4 px-6">
                    <span className="text-gray-900 text-sm font-medium">
                      {item.propertyId.headlineYourProperty}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6 hidden sm:table-cell">
                    <span className="text-gray-700 text-sm max-w-md line-clamp-1 truncate">
                      {`${item.propertyId.location.flatOrHouseNo}, ${item.propertyId.location.address}, ${item.propertyId.location.city}, ${item.propertyId.location.state}`}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-gray-900 text-sm font-semibold">₦{item.amount}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 hidden md:table-cell">
                    <span className="text-gray-700 text-sm">
                      {format(new Date(item.bookingDate), "dd MMMM yyyy")}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant="secondary"
                      className="bg-background-secondary text-primary font-normal text-xs px-3 py-1 capitalize"
                    >
                      {item.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant="secondary"
                      className="bg-background-secondary text-primary font-normal text-xs px-3 py-1 capitalize"
                    >
                      {item.transaction?.reference}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant="secondary"
                      className="bg-background-secondary text-primary font-normal text-xs px-3 py-1 capitalize"
                    >
                      {item.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewModal(item.propertyId._id)}
                      disabled={reviewLoading}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Property Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer ${
                      star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Review</Label>
              <Input
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review here..."
                className="mt-2"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setRating(0)
                setReviewText("")
                setError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewLoading}
            >
              {reviewLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { FiStar } from "react-icons/fi"
import ReviewCard from "./ReviewCard"
import { useParams } from "next/navigation"
import { usePropertyDetailsWithReviewQuery } from "@/redux/api/propertyApi"
import { formatDistanceToNow } from 'date-fns'

export default function CustomerReviews() {
  const { id } = useParams()
  const { data: property, isLoading, isError } = usePropertyDetailsWithReviewQuery(id)

  // Calculate rating breakdown and stats from API data
  const reviews = property?.data?.reviews || []
  const totalReviews = reviews.length
  
  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? Number((reviews.reduce((sum:any, review:any) => sum + review.rating, 0) / reviews.length).toFixed(1))
    : 0

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter((review:any)  => review.rating === stars).length
    const percentage = totalReviews > 0 ? (count / totalReviews * 100) : 0
    return { stars, percentage: Math.round(percentage), count }
  })

  // Format reviews for ReviewCard
  const formattedReviews = reviews.map((review:any) => ({
    id: review._id,
    userName: review?.user?.name || "Anonymous",
    userAvatar: review?.user?.image || "/placeholder.svg",
    timeAgo: formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }),
    rating: review.rating,
    reviewText: review.reviewText,
    likes: review.likes.length,
    dislikes: review.dislikes.length,
  }))

  if (isLoading) {
    return <div>Loading reviews...</div>
  }

  if (isError) {
    return <div>Error loading reviews</div>
  }

  return (
    <section className="px-4 py-8">
      <div className="">
        {/* Section Title */}
        <h2 className="text-2xl md:text-3xl font-medium text-primary mb-8">Customer Reviews</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Overall Rating */}
          <div>
            <div className="mb-4 text-primary">
              <div className="text-4xl font-bold mb-1">{averageRating} / 5.0</div>
              <div className="my-4 text-black">{totalReviews} Reviews</div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(averageRating) ? "text-primary fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-3">
            {ratingBreakdown.map((rating) => (
              <div key={rating.stars} className="flex items-center space-x-3">
                <span className="text-sm text-primary w-12">{rating.stars} Star</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${rating.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="bg-white">
          {formattedReviews.map((review:any) => (
            <ReviewCard key={review.id} {...review} />
          ))}
        </div>

        {/* Show All Reviews Button */}
        {totalReviews > 0 && (
          <div className="mt-6">
            <button className="cursor-pointer px-6 py-3 border border-primary text-primary rounded-2xl hover:bg-background-secondary transition-colors font-medium">
              Show All {totalReviews} Reviews
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
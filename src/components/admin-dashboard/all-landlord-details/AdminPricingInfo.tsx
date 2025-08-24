/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import PlanCard from "@/components/landlord-dashboard/landlord-pricing/PlanCard"
import { Skeleton } from "@/components/ui/skeleton" // Assuming Skeleton is already set up
import { useLandlordDetailsByAdminQuery } from "@/redux/api/dashboardApi"
import { useParams } from "next/navigation"

// Interface for PlanCard props to ensure type safety
interface Plan {
  title: string
  price: string
  currency: string
  period: string
  description: string
  features: string[]
  buttonText: string
  isPremium: boolean
  buttonVariant?: "default" | "outline"
}

// Helper function to format the API data into PlanCard format
const formatPlanData = (planData: any, isPrevious: boolean = false): Plan => {
  return {
    title: planData?.name,
    price: planData?.price.toFixed(2),
    currency: "₦", // Nigerian Naira as per your update
    period: planData?.duration === "FREE" ? "Lifetime" : "Per Month",
    description: planData?.description,
    features: planData?.features,
    buttonText: isPrevious ? "Upgrade To Premium" : "Manage Subscription",
    isPremium: planData?.state === "PAID",
  }
}

// Skeleton loading component
const PlanCardSkeleton = () => (
  <div className="p-6 border rounded-lg shadow-sm">
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-8 w-1/2 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-10 w-1/3 mt-6" />
  </div>
)

export default function AdminPricingInfo() {
   const params = useParams()
    const id = params.id as string
 const { data, isLoading, isError } = useLandlordDetailsByAdminQuery(id)
  // Handle error state
  if (isError) {
    return (
      <div className="w-full max-w-6xl md:p-6 mb-36 md:mb-24">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <h5 className="font-medium">Error</h5>
          <p className="text-sm">Failed to load subscription plans. Please try again later.</p>
        </div>
      </div>
    )
  }


  // Prepare plan data
  const currentPlan = data?.data?.subscriptions[0]?.package
    ? formatPlanData(data?.data?.subscriptions[0]?.package)
    : null
  const previousPlan = data?.data?.subscriptions[0]?.previousPackage
    ? formatPlanData(data?.data?.subscriptions[0]?.previousPackage, true)
    : null

  return (
    <div className="w-full max-w-6xl md:p-6 mb-36 md:mb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24 md:gap-8">
        {/* Current Plan */}
        <div>
          <h2 className="text-xl font-medium text-primary mb-6 text-center">
            Current Plan
          </h2>
          {isLoading ? (
            <PlanCardSkeleton />
          ) : currentPlan ? (
            <PlanCard {...currentPlan} />
          ) : (
            <div className="p-4 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg">
              <h5 className="font-medium">No Current Plan</h5>
              <p className="text-sm">No active subscription found.</p>
            </div>
          )}
        </div>

        {/* Previous Plan */}
        <div>
          <h2 className="text-xl font-medium text-primary mb-6 text-center">
            Previous Plan
          </h2>
          {isLoading ? (
            <PlanCardSkeleton />
          ) : previousPlan ? (
            <PlanCard {...previousPlan} buttonVariant="outline" />
          ) : (
            <div className="p-4 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg">
              <h5 className="font-medium">No Previous Plan</h5>
              <p className="text-sm">No previous subscription found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
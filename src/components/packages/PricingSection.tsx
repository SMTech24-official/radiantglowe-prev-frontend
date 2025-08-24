/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useGetActivePackageQuery } from "@/redux/api/packageApi";
import { PricingCard } from "./PricingCard";

export function PricingSection() {
  const { data, isLoading, isError } = useGetActivePackageQuery();

  // Transform API data to match PricingCard props
  const pricingPlans = data?.data?.map((plan: any) => ({
    id: plan._id,
    title: plan.name,
    description: plan.description,
    price: plan.price === 0 ? 0.00 : plan.price.toFixed(2),
    priceSubtext: plan.duration === "FREE" ? "Per Month" : plan.duration.toLowerCase(),
    recommendation: plan.description,
    features: plan.features.map((feature: any) => ({ text: feature })),
    buttonText: "Subscribe Now",
    isPopular: plan.state === "PAID",
    state: plan.state,
    bgColor: plan.bgColor || "#ffffff",
    textColor: plan.textColor || "#000000",
    isFreePromo: plan.isFreePromo || false,
    freePromoText: plan.freePromoText || "",
    propertyLimit: plan.propertyLimit || 0,
  })) || [];

  return (
    <section className="py-16 md:px-4 bg-gray-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Choose the Perfect Plan for you
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Whether you&apos;re a startup or an established business, we have the right pricing for you.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid lg:grid-cols-3 gap-8 container mx-auto">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-white p-6 rounded-lg shadow-md"
              >
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-10 bg-gray-200 rounded mt-6"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center text-red-600">
            <p>Error loading pricing plans: {"Something went wrong"}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Pricing Cards */}
        {!isLoading && !isError && pricingPlans.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8 container mx-auto">
            {pricingPlans.map((plan: any, index: number) => (
              <PricingCard
                id={plan.id}
                key={index}
                title={plan.title}
                description={plan.description}
                price={plan.price}
                // priceSubtext={plan.priceSubtext}
                recommendation={plan.recommendation}
                features={plan.features}
                isPopular={plan.isPopular}
                buttonText={plan.buttonText}
                state={plan.state}
                bgColor={plan.bgColor}
                textColor={plan.textColor}
                isFreePromo={plan.isFreePromo}
                freePromoText={plan.freePromoText}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && pricingPlans.length === 0 && (
          <div className="text-center text-gray-600">
            <p>No pricing plans available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
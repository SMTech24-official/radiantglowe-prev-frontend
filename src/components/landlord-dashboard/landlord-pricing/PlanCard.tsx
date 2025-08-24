"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";

interface PlanCardProps {
  title: string;
  price: string;
  currency: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  isPremium?: boolean;
  showButton?: boolean;
  bgColor?: string;
  textColor?: string;
  isFreePromo?: boolean;
  freePromoText?: string;
  subscriptionStatus?: "active" | "inactive" | "pending";
  isCurrenPackage?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

export default function PlanCard({
  title,
  price,
  currency,
  description,
  features,
  buttonText,
  buttonVariant = "default",
  isPremium = false,
  showButton = true,
  bgColor = "#ffffff",
  textColor = "#000000",
  isFreePromo = false,
  freePromoText = "",
  subscriptionStatus,
  isCurrenPackage = true,
  startDate,
  endDate
}: PlanCardProps) {
  const router = useRouter();


  return (
    <Card
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${bgColor}`,
        color: textColor
      }}
      className={`w-full h-full ${isPremium ? "" : "border-gray-200"}`}
    >
      <CardContent className="p-8 flex flex-col h-full relative">
        {/* Plan Title */}
        <h3
          style={{ color: textColor }}
          className="text-center text-xl font-medium mb-6"
        >
          {title}
        </h3>
        {
          isCurrenPackage && (
            <p
              className="text-center font-medium mb-6 absolute top-2 left-0 bg-green-600 !text-white uppercase text-sm tracking-widest px-4 py-1 -rotate-45"
            >
              {subscriptionStatus || 'N/A'}
            </p>
          )
        }
        {
          isCurrenPackage && (
            <p
              className="text-center font-medium"
            >
              Start Date: {startDate ? startDate.toLocaleDateString() : 'N/A'}
            </p>
          )
        }
        {
          isCurrenPackage && (
            <p
              className="text-center font-medium mb-6"
            >
              End Date: {endDate ? endDate.toLocaleDateString() : 'N/A'}
            </p>
          )
        }


        {/* Description (for free plan) */}
        {!isPremium && (
          <p style={{ color: textColor }} className="text-center text-sm mb-6">
            {description}
          </p>
        )}

        {/* Price */}
        <div className="mb-6">
          <div
            style={{ color: textColor }}
            className={`text-center text-3xl font-bold mb-1 ${isFreePromo && "line-through"}`}
          >
            {currency}{price}
          </div>
          {isFreePromo && (
            <p
              style={{ color: textColor }}
              className="text-sm mt-1 mb-2 text-center"
            >
              {freePromoText}
            </p>
          )}
        </div>

        {/* Description (for premium plan) */}
        {isPremium && (
          <p style={{ color: textColor }} className="text-center mb-8 leading-relaxed">
            {description}
          </p>
        )}

        {/* Description (for free plan after price) */}
        {!isPremium && (
          <p style={{ color: textColor }} className="text-center mb-8">
            {description}
          </p>
        )}

        {/* Features List */}
        <div className="flex-1 mb-8">
          <ul className="space-y-4">
            {features?.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <FiCheckCircle
                  style={{ color: isPremium ? "#ffffff" : textColor }}
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                />
                <span
                  style={{ color: textColor }}
                  className="text-sm leading-relaxed"
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade Button */}
        {showButton && (
          <Button
            onClick={() => router.push('/packages')}
            variant={buttonVariant}
            className={`cursor-pointer w-full h-12 text-sm font-medium ${isPremium
                ? "bg-white text-primary hover:bg-background-secondary"
                : "border-primary text-primary hover:bg-background-secondary"
              }`}
          >
            {buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
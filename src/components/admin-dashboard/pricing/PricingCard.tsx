/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePathname, useRouter } from "next/navigation";
import { FiCheckCircle } from "react-icons/fi";

interface PricingCardProps {
  id: number;
  title: string;
  description: string;
  price: string;
  currency: string;
  period: string;
  recommendation: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  isPremium?: boolean;
  isActive?: boolean;
  bgColor?: string;
  textColor?: string;
  isFreePromo?: boolean;
  freePromoText?: string;
  propertyLimit?: number;
}

export default function PricingCard({
  id,
  title,
  description,
  price,
  currency,
  period,
  recommendation,
  features,
  buttonText,
  buttonVariant = "default",
  isPremium = false,
  isActive = false,
  bgColor = "#ffffff",
  textColor = "#000000",
  isFreePromo = false,
  freePromoText = "",
  propertyLimit = 0
}: PricingCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleEditBtn = (id: number) => {
    router.push(`/admin-dashboard/pricing/${id}`)
  }


  return (
    <Card
      style={{
        backgroundColor: bgColor,
        border: `1px solid ${bgColor}`,
        color: textColor,
      }}
      className={`w-full h-full ${isPremium ? "" : " border-gray-200"}`}
    >
      <CardContent className="lg:p-8 flex flex-col h-full">
        {/* Plan Title */}
        <h3
          style={{ color: textColor }}
          className="text-xl font-medium mb-4 text-center"
        >
          {title} {
            pathname.includes("/admin-dashboard") && (
              <span className="text-xs bg-green-500 px-2 py-1 text-white">{isActive ? "Active" : "Deactivated"}</span>
            )
          }
        </h3>

        {/* Description (top) */}
        <p
          style={{ color: textColor }}
          className="text-sm text-center mb-6"
        >
          {description}
        </p>

        {/* Price */}
        <div className="text-center mb-2">
          <div
            style={{ color: textColor }}
            className="text-3xl font-bold"
          >
            {currency}
            <span className={`${isFreePromo && "line-through"}`}>{price}</span>
          </div>
          {
            isFreePromo && (
              <p
                style={{ color: textColor }}
                className="text-sm mt-1"
              >
                {freePromoText}
              </p>
            )
          }
        </div>

        {/* Recommendation */}
        {/* <p
          style={{ color: textColor }}
          className="text-sm text-center mb-8 leading-relaxed"
        >
          {recommendation}
        </p> */}

        {/* Features List */}
        <div className="flex-1 mb-8">
          <ul className="space-y-4">
            {features.map((feature, index) => (
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

        {/* Edit Button */}
        <Button
          onClick={() => handleEditBtn(id)}
          variant={buttonVariant}
          className={`cursor-pointer w-full h-12 text-sm font-medium ${isPremium
            ? "bg-white text-primary hover:bg-gray-50"
            : buttonVariant === "outline"
              ? "border-primary text-primary hover:bg-background-secondary"
              : "bg-primary text-white hover:bg-primary/80"
            }`}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
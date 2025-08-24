/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDecodedToken } from "@/hooks/useDecodedToken";
import { useInitializePaystackTransaction } from "@/hooks/useInitializePaystackTransaction";
import { useCreateSubscriptionMutation } from "@/redux/api/subscriptionApi";
import generateSubscriptionInvoicePDF from "@/utils/generateSubscriptionInvoicePDF";
import PaystackPop from '@paystack/inline-js';
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";

interface Feature {
  text: string;
}

interface PricingCardProps {
  id: string;
  title: string;
  description: string;
  price: string;
  recommendation: string;
  features: Feature[];
  isPopular?: boolean;
  buttonText: string;
  state?: string;
  bgColor?: string;
  textColor?: string;
  isFreePromo?: boolean;
  freePromoText?: string;
  propertyLimit?: number;
}

export function PricingCard({
  id,
  title,
  description,
  price,
  recommendation,
  features,
  isPopular = false,
  buttonText,
  state,
  bgColor = "#ffffff",
  textColor = "#000000",
  isFreePromo = false,
  freePromoText = "",
}: PricingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [createSubscription] = useCreateSubscriptionMutation();
  const router = useRouter();

  const user = useDecodedToken(localStorage.getItem("accessToken"));
  const { initializeTransaction, loading } = useInitializePaystackTransaction();
  const searchParams = useSearchParams();
  const fromRoute = searchParams.get("from");

  const handlePayment = async () => {
    if (isPaymentLoading) return;
    setIsPaymentLoading(true);

    if (!user || user?.role !== "landlord") {
      toast.error("Please login as a landlord to continue");
      setIsPaymentLoading(false);
      return;
    }

    // Prepare invoice data
    const invoiceData = {
      subscriptionDate: new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' }),
      landlordName: user?.name || "Unknown Landlord",
      landlordEmail: user?.email || "N/A",
      packageTitle: title,
      packageDescription: description,
      subscriptionAmount: price,
      amountPaid: isFreePromo || price === "0" || state === "FREE" ? "0" : price,
      paymentMethod: isFreePromo || price === "0" || state === "FREE" ? "Free/Promo" : "Paystack",
      paymentStatus: "Success",
      paymentDate: new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Dhaka' }),
      transactionId: "",
      isFreePromo,
      freePromoText,
    };

    // Free or Promo Subscription
    if (price === "0" || state === "FREE" || isFreePromo) {
      try {
        await createSubscription({ package: id }).unwrap();
        const message = isFreePromo ? "Free Promo Subscription successful!" : "Free Subscription successful!";
        toast.success(message);

        // Generate and download invoice for free/promo subscription
        generateSubscriptionInvoicePDF(invoiceData as any);
        if(fromRoute === "add-properties") {
          router.push("/add-properties");
        }else{
          router.push("/landlord-pricing");
        }
      } catch (error: any) {
        toast.error(`Subscription creation failed: ${error?.data?.message || "Unknown error"}`);
      } finally {
        setIsPaymentLoading(false);
        setIsModalOpen(false);
      }
      return;
    }

    // Paid Subscription
    try {
      // Step 1: Initialize Transaction on Server
      const data = await initializeTransaction(user?.email as string, parseFloat(price), {
        landlordId: user?.userId as string,
        packageId: id,
        type: "subscription",
      });

      if (data?.data?.authorization_url || data?.data?.access_code) {
        const popup = new PaystackPop();
        popup.resumeTransaction(data?.data?.access_code, {
          onSuccess: (transaction) => {
            const subscriptionData = {
              package: id,
              price: parseFloat(price),
              paymentMethodId: transaction.reference,
            };
            createSubscription(subscriptionData)
              .unwrap()
              .then(() => {
                toast.success(`Subscription successful! Transaction ID: ${transaction.reference}`);
                
                // Update invoice data with transaction ID
                invoiceData.transactionId = transaction.reference;
                // Generate and download invoice for paid subscription
                generateSubscriptionInvoicePDF(invoiceData as any);

                if(fromRoute === "add-properties") {
                  router.push("/add-properties");
                }else{
                  router.push("/landlord-pricing");
                }
              })
              .catch((error: any) => {
                toast.error(`Subscription creation failed: ${error?.data?.message || "Unknown error"}`);
              })
              .finally(() => {
                setIsPaymentLoading(false);
                setIsModalOpen(false);
              });
          },
          onCancel: () => {
            toast.error("Payment cancelled!");
            setIsPaymentLoading(false);
            setIsModalOpen(false);
          },
          onError: (error) => {
            toast.error("Payment failed: " + error.message);
            setIsPaymentLoading(false);
            setIsModalOpen(false);
          },
        });
      }
    } catch (error) {
      toast.error("Payment initialization failed");
      setIsPaymentLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: bgColor,
          border: `1px solid ${bgColor}`,
          color: textColor,
        }}
        className={`flex flex-col justify-between relative rounded-2xl border-2 p-8 ${isPopular ? "" : "bg-white"}`}
      >
        <div>
          <div className="text-center mb-8">
            <h3
              style={{ color: textColor }}
              className="text-2xl font-bold mb-4"
            >
              {title}
            </h3>
            <p
              style={{ color: textColor }}
              className="text-sm mb-6"
            >
              {description}
            </p>

            <div className="mb-2">
              <span
                style={{ color: textColor }}
                className={`text-4xl font-bold ${isFreePromo && "line-through"}`}
              >
                ₦ {price === "0" || state === "FREE" ? "0.00" : price}
              </span>
            </div>

            {isFreePromo && (
              <p
                style={{ color: textColor }}
                className="text-sm mt-1 mb-2"
              >
                {freePromoText}
              </p>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    isPopular ? "bg-white/20" : "bg-gray-100"
                  }`}
                >
                  <FiCheckCircle
                    style={{ color: isPopular ? "#ffffff" : textColor }}
                    className="w-3 h-3"
                  />
                </div>
                <p
                  style={{ color: textColor }}
                  className="text-sm leading-relaxed"
                >
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            className={`cursor-pointer px-8 py-6 rounded-lg font-medium transition-colors ${
              isPopular
                ? "bg-white text-primary hover:bg-background-secondary"
                : "bg-transparent border-2 border-primary text-primary hover:bg-background-secondary"
            }`}
            variant={isPopular ? "default" : "outline"}
            onClick={() => {
              if (!user || user?.role !== "landlord") {
                router.push("/register");
                setIsPaymentLoading(false);
                return;
              }
              setIsModalOpen(true);
            }}
            disabled={isPaymentLoading || loading}
          >
            {isPaymentLoading || loading ? "Processing..." : buttonText}
          </Button>
        </div>
      </div>

      {/* Warning Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to purchase the ${title} package for ₦${price}? This action will initiate a payment through Paystack.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isPaymentLoading || loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isPaymentLoading || loading}
            >
              {isPaymentLoading || loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
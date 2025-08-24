/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import PdfDownloadModal, { InvoiceDataType } from "@/components/propertyDetails/payment/PdfDownloadModal";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useDecodedToken } from "@/hooks/useDecodedToken";
import { useInitializePaystackTransaction } from "@/hooks/useInitializePaystackTransaction";
import { useCreateBookingMutation } from "@/redux/api/bookingApi";
import { useGetTenantpermissionQuery } from "@/redux/api/permissionApi";
import { usePropertyDetailsWithReviewQuery } from "@/redux/api/propertyApi";
import generateInvoicePDF from "@/utils/generateInvoicePDF";
import { symbol } from "@/utils/symbol";
import PaystackPop from '@paystack/inline-js';
import { formatDate } from "date-fns";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function PropertiesPaymentPage() {
  const { id } = useParams();
  const { data: property } = usePropertyDetailsWithReviewQuery(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<"full" | "deposit">("full"); // New state for payment type
  const [depositAmount, setDepositAmount] = useState<string>(""); // New state for deposit amount
  const userData = useDecodedToken(localStorage.getItem("accessToken"));
  const { data: permisionData } = useGetTenantpermissionQuery({
    tenantId: userData?.userId,
    propertyId: id
  });
  const { initializeTransaction, loading } = useInitializePaystackTransaction();
  const permissionId = '6886109cd80a51d72108b3dc';
  const [bookingMutation, { isLoading: isBookingLoading }] = useCreateBookingMutation();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenWarningModal = () => setIsWarningModalOpen(true);
  const handleCloseWarningModal = () => setIsWarningModalOpen(false);

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsPaymentLoading(true);

    if (!userData) {
      toast.error('User not found');
      setIsPaymentLoading(false);
      return;
    }

    if (permisionData?.data?.status !== "granted") {
      toast.error("Permission not granted. Please contact the landlord.");
      setIsPaymentLoading(false);
      return;
    }

    if (property?.data?.status === 'rented') {
      toast.error('Property is already booked');
      setIsPaymentLoading(false);
      return;
    }
    if (property?.data?.status === 'booking') {
      toast.error('Property is Booking. Please wait for the landlord to approve or reject the booking.');
      setIsPaymentLoading(false);
      return;
    }

    // Determine the payment amount based on the selected payment type
    const paymentAmount = paymentType === "full" ? parseFloat(property?.data?.rentPerYear) : parseFloat(depositAmount);

    // Validate deposit amount if deposit is selected
    if (paymentType === "deposit" && (!depositAmount || paymentAmount <= 0)) {
      toast.error('Please enter a valid deposit amount');
      setIsPaymentLoading(false);
      return;
    }

    try {
      // Step 1: Initialize Transaction on Server
      const data = await initializeTransaction(userData?.email as string, paymentAmount, {
        landlordId: property?.data?.landlordId._id,
        propertyId: property?.data?._id,
        tenantId: userData?.userId as string,
        type: paymentType === "full" ? "full" : "booking"
      });

      if (!data?.data?.authorization_url || !data?.data?.access_code) {
        toast.error('Failed to initialize payment');
        setIsPaymentLoading(false);
        return;
      }

      const popup = new PaystackPop();
      popup.resumeTransaction(data?.data?.access_code, {
        onSuccess: (transaction: any) => {
          const newData = {
            landlordId: property?.data?.landlordId._id,
            propertyId: property?.data?._id,
            tenantId: userData?.userId,
            permissionId: permisionData?.data?._id || permissionId,
            paymentMethod: 'online',
            transaction: transaction,
            amount: paymentAmount
          };
          bookingMutation(newData).unwrap().then((res) => {
            toast.success('Payment successful! Transaction ID: ' + transaction.reference);
            const pdfData: InvoiceDataType = {
              bookingDate: formatDate(new Date(), 'yyyy-MM-dd'),
              tenantName: 'Tenant',
              tenantEmail: userData?.email as string || 'tenant@example',
              landlordName: property?.data?.landlordId.name || 'Landlord',
              landlordEmail: property?.data?.landlordId.email || 'landlord@example',
              propertyHeadline: property?.data?.headlineYourProperty || 'Property',
              propertyAddress: property?.data?.location?.address || 'Address',
              rentAmount: property?.data?.rentPerYear || '1000',
              amountPaid: depositAmount === '' ? 0 : depositAmount || property?.data?.rentPerYear || '1000',
              paymentMethod: 'Offline',
              paymentStatus: res?.data?.paymentStatus || 'Pending',
              paymentDate: formatDate(new Date(), 'yyyy-MM-dd') || '2023-08-10',

            }

            generateInvoicePDF(pdfData);
            router.push(`/tenants/current-bookings`);
          }).catch((error) => {
            toast.error('Payment failed! ' + error?.data?.message);
          }).finally(() => {
            setIsPaymentLoading(false);
          });
        },
        onCancel: () => {
          toast.error('Payment cancelled!');
          setIsPaymentLoading(false);
        },
        onError: (error) => {
          toast.error('Payment failed: ' + error.message);
          setIsPaymentLoading(false);
        }
      });
    } catch (error) {
      toast.error('Payment initialization failed');
      setIsPaymentLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        title="Confirm Booking"
        shortDescription="Please review your details and proceed with the payment to finalize your booking"
      />

      <div className="max-w-3xl mx-auto p-6 bg-white space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-4">Billing Details</h2>
          <div className="border rounded-md px-5 py-3">
            <div className="mb-4 flex justify-between gap-2 items-center">
              <div className="flex gap-2 items-center">
                <Image
                  src={property?.data?.images?.[0] || '/palceholder.svg'}
                  alt="pic"
                  className="w-16 h-16 mb-2 border rounded-md object-cover"
                  width={100}
                  height={100}
                />
                <p className="line-clamp-2 font-medium">{property?.data?.headlineYourProperty}</p>
              </div>
              <p className="text-gray-600">{symbol.nigeria} {property?.data?.rentPerYear || 0} / Year</p>
            </div>
            {/* Payment Type Selection */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Payment Type</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={paymentType === "full"}
                    onChange={() => setPaymentType("full")}
                    className="form-radio"
                  />
                  Full Payment ({symbol.nigeria} {property?.data?.rentPerYear || 0})
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentType"
                    value="deposit"
                    checked={paymentType === "deposit"}
                    onChange={() => setPaymentType("deposit")}
                    className="form-radio"
                  />
                  Deposit
                </label>
              </div>
              {paymentType === "deposit" && (
                <div className="mt-2">
                  <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">
                    Deposit Amount
                  </label>
                  <input
                    type="number"
                    id="depositAmount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter deposit amount"
                    className="mt-1 block w-full border rounded-md p-2"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between gap-2 items-center border-t-1 pt-2">
              <p className="font-bold">Total:</p>
              <p className="font-semibold">
                {symbol.nigeria}{" "}
                {paymentType === "full" ? property?.data?.rentPerYear || 0 : depositAmount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenWarningModal}
            type="button"
            className="w-full bg-primary hover:bg-yellow-700 duration-150 text-white p-2 rounded"
            disabled={isPaymentLoading || isBookingLoading}
          >
            {(isPaymentLoading || isBookingLoading) ? (
              <div className="flex justify-center items-center gap-2">
                Online Payment <Loader2Icon className="animate-spin" />
              </div>
            ) : (
              "Make Online Payment"
            )}
          </button>
          <button
            onClick={handleOpenModal}
            type="button"
            className="w-full bg-gray-200 hover:bg-gray-300 p-2 rounded duration-150"
            disabled={isPaymentLoading || isBookingLoading}
          >
            Offline Payment
          </button>
        </div>
      </div>

      {/* Warning Modal for Online Payment Confirmation */}
      {isWarningModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Online Payment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to proceed with the {paymentType === "full" ? "full" : "deposit"} payment of{" "}
              {symbol.nigeria}
              {paymentType === "full" ? property?.data?.rentPerYear || 0 : depositAmount || 0}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  handleSubmit(e);
                }}
                type="button"
                className="w-full bg-primary hover:bg-yellow-700 duration-150 text-white p-2 rounded"
                disabled={isPaymentLoading || isBookingLoading}
              >
                {(isPaymentLoading || isBookingLoading) ? (
                  <div className="flex justify-center items-center gap-2">
                    Processing <Loader2Icon className="animate-spin" />
                  </div>
                ) : (
                  "Yes, Proceed"
                )}
              </button>
              <button
                onClick={handleCloseWarningModal}
                type="button"
                className="w-full bg-gray-200 hover:bg-gray-300 p-2 rounded duration-150"
                disabled={isPaymentLoading || isBookingLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <PdfDownloadModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
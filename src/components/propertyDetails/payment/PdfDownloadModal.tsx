
"use client";

import { useDecodedToken } from "@/hooks/useDecodedToken";
import { useCreateBookingMutation } from "@/redux/api/bookingApi";
import { useGetTenantpermissionQuery } from "@/redux/api/permissionApi";
import { usePropertyDetailsWithReviewQuery } from "@/redux/api/propertyApi";
import generateInvoicePDF from "@/utils/generateInvoicePDF";
import { formatDate } from "date-fns";
import { Loader2Icon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FiX, FiMinus, FiDownloadCloud } from "react-icons/fi";
import { toast } from "sonner";

interface PdfDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface InvoiceDataType {
  bookingDate: string;
  tenantName: string;
  tenantEmail: string;
  landlordName: string;
  landlordEmail: string;
  propertyHeadline: string;
  propertyAddress: string;
  rentAmount: string;
  amountPaid: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
}

export default function PdfDownloadModal({
  isOpen,
  onClose,
}: PdfDownloadModalProps) {
const router = useRouter();
  const { id } = useParams();
  const { data: property } = usePropertyDetailsWithReviewQuery(id);
  const [bookingMutation, { isLoading: isBookingLoading }] = useCreateBookingMutation();
  const userData = useDecodedToken(localStorage.getItem("accessToken"));
  const { data: permisionData } = useGetTenantpermissionQuery({
    tenantId: userData?.userId,
    propertyId: id
  })
  if (!isOpen) return null;

  const permissionId = '6886109cd80a51d72108b3dc'

  // Handle PDF download
  const handleDownload = () => {
        if(property?.data?.status === 'rented') {
      toast.error('Property is already booked');
      return;
    }
    if (permisionData?.data?.status !== "granted") {
      toast.error("Permission not granted. Please contact the landlord.");
      return;
    }

    if(property?.data?.status === 'booking') {
      toast.error('Property is Booking. Please wait for the landlord to approve or reject the booking.');
      return;
    }

    const newData = {
      landlordId: property?.data?.landlordId._id,
      propertyId: property?.data?._id,
      tenantId: userData?.userId,
      permissionId: permisionData?.data?._id || permissionId,
      paymentMethod: 'offline',
      amount: property?.data?.rentPerYear
    }


    bookingMutation(newData).unwrap().then((res) => {

      toast.success('Offline Booking creation successful! Generating Invoice PDF...');
      const pdfData: InvoiceDataType = {
        bookingDate: formatDate(res?.data?.bookingDate, 'yyyy-MM-dd') || '2023-08-10',
        tenantName: 'Tenant' ,
        tenantEmail: userData?.email as string || 'tenant@example',
        landlordName: property?.data?.landlordId.name || 'Landlord',
        landlordEmail: property?.data?.landlordId.email || 'landlord@example',
        propertyHeadline: property?.data?.headlineYourProperty || 'Property',
        propertyAddress: property?.data?.location?.address || 'Address',
        rentAmount: property?.data?.rentPerYear || '1000',
        amountPaid: property?.data?.rentPerYear || '1000',
        paymentMethod: 'Offline',
        paymentStatus: res?.data?.paymentStatus || 'Pending',
        paymentDate: formatDate(new Date(), 'yyyy-MM-dd') || '2023-08-10',

      }

      generateInvoicePDF(pdfData);
      router.push(`/tenants/current-bookings`);

    }).catch((error) => {
      toast.error('Offline Booking creation failed! ' + error?.data?.message);
    })

    // const demoInvoiceData: InvoiceDataType = {
    //   bookingDate: "2025-08-01",
    //   tenantName: "Md. Mitul Hossain",
    //   tenantEmail: "mitul.hossain@example.com",
    //   landlordName: "Rahim Uddin",
    //   landlordEmail: "rahim.uddin@example.com",
    //   propertyHeadline: "Cozy 2 Bedroom Apartment",
    //   propertyAddress: "123 Green Street, Dhaka, Bangladesh",
    //   rentAmount: "15000",
    //   amountPaid: "15000",
    //   paymentMethod: "Credit Card",
    //   paymentStatus: "Paid",
    //   paymentDate: "2025-08-02",
    // };

    // generateInvoicePDF(demoInvoiceData);

  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-auto p-8">
        {/* Header Controls */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <button
            onClick={onClose}
            className="cursor-pointer w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center pt-4">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-8">
            Download PDF invoice
          </h2>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            // disabled={isLoading} // Disable button while loading or no data
            className={`cursor-pointer w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg transition-colors`}
          >
            {
              isBookingLoading ? <> <span>Download invoice</span> <Loader2Icon className="w-5 h-5 animate-spin" /></> :
                <><span>Download invoice</span> <FiDownloadCloud className="w-5 h-5" /></>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
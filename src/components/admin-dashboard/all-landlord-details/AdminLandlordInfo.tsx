/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { TbFileDownload } from "react-icons/tb"
import { FaRegCircleCheck } from "react-icons/fa6"
import { useParams } from "next/navigation"
import { useLandlordDetailsByAdminQuery } from "@/redux/api/dashboardApi"
import { useVerifyUserMutation } from '@/redux/api/authApi'
import { FiDownload } from 'react-icons/fi'
import DownloadAllImages from '@/components/shared/DownloadAllImages'
import { formatDate } from 'date-fns'
import { formatDateTime } from '@/utils/formatDateTime'

const infoFields = [
  { label: "Full Name", key: "name" },
  { label: "Phone Number", key: "phoneNumber" },
  { label: "Email", key: "email" },
  { label: "Address", key: "address" },
  { label: "City", key: "city" },
  { label: "State", key: "state" },
  { label: "Zip Code", key: "zipCode" },
  { label: "Joining Date", key: "joiningDate" },
  { label: "Status", key: "status" },
  { label: "Total Properties", key: "totalProperties" },
]

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <div>
    <label className="block text-sm text-gray-500 mb-1">{label}</label>
    <p className="text-gray-900 font-medium">{value || "N/A"}</p>
  </div>
)

export default function AdminLandlordInfo() {
  const params = useParams()
  const id = params.id as string
  const { data, isLoading, isError } = useLandlordDetailsByAdminQuery(id)
  const [verifyMutate, { isLoading: isVerifyLoading }] = useVerifyUserMutation()
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Format the landlord data from API response
  const landlordData = data?.data?.landlord
    ? {
      name: data.data.landlord.name,
      phoneNumber: data.data.landlord.phoneNumber,
      email: data.data.landlord.email,
      address: `${data.data.landlord.address.flatOrHouseNo}, ${data.data.landlord.address.address}`,
      city: data.data.landlord.address.city,
      state: data.data.landlord.address.state,
      zipCode: data.data.landlord.address.town || "N/A",
      joiningDate: new Date(data.data.landlord.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: data.data.landlord.isVerified ? "Verified" : "Not Verified",
      totalProperties: data.data.properties?.length?.toString() || "0",
    }
    : null

  const handleVerifyClick = async () => {
    try {
      await verifyMutate({ id, isVerified: !data.data.landlord.isVerified }).unwrap()
    } catch (error) {
      // console.error("Failed to verify user:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full bg-white lg:p-6 mb-12 flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500 text-lg">Loading...</div>
      </div>
    )
  }

  if (isError || !landlordData) {
    return (
      <div className="w-full bg-white lg:p-6 mb-12 flex justify-center items-center min-h-[200px]">
        <div className="text-red-500 text-lg">
          {isError ? "Failed to load landlord details" : "No landlord data available"}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white lg:p-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {infoFields.map(({ label, key }) => (
          <InfoItem key={key} label={label} value={landlordData[key as keyof typeof landlordData]} />
        ))}

        {/* Document Field - Custom */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">Document</label>
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setIsImageModalOpen(true)}
              disabled={!data?.data?.landlord?.profileVerificationImage?.length}
            >
              <TbFileDownload className="w-7 h-7" />
            </button>
            <button
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${data?.data?.landlord?.isVerified
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
                }`}
              onClick={handleVerifyClick}
              disabled={data?.data?.landlord?.isVerified || isVerifyLoading}
            >
              {isVerifyLoading ? "Verifying..." : data?.data?.landlord?.isVerified ? "Verified" : "Verify"}
              {data?.data?.landlord?.isVerified && <FaRegCircleCheck className="w-5 h-5" />}
            </button>
            {/* un verify */}
            <button
              className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${data?.data?.landlord?.isVerified
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
              onClick={handleVerifyClick}
              disabled={!data?.data?.landlord?.isVerified || isVerifyLoading}
            >
              {isVerifyLoading ? "Unverifying..." : data?.data?.landlord?.isVerified ? "Unverify" : "Unverified"}
              {data?.data?.landlord?.isVerified && <FaRegCircleCheck className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && data?.data?.landlord?.profileVerificationImage?.length && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
           <div>
               <div className='flex gap-2 items-center'>
                <h2 className="text-lg font-semibold">Verification Documents</h2>
                <DownloadAllImages images={data?.data?.landlord?.profileVerificationImage || []} filename={data?.data?.landlord?.name || ""} />
                <p className='text-sm text-wrap text-gray-400'>{data?.data?.landlord?.profileVerificationImage?.length} document(s) uploaded</p>
              </div>
              {/* date and time with format */}
              <p>{formatDateTime(data?.data?.landlord?.updatedAt)}</p>
           </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsImageModalOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.data?.landlord?.profileVerificationImage?.map((file: string, index: number) => {
                const lowerFile = file.toLowerCase();
                const isPdf = lowerFile.endsWith(".pdf");
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(lowerFile);
                const isDoc = /\.(doc|docx)$/i.test(lowerFile);

                return (
                  <div key={index} className="w-full h-[400px] border rounded-md overflow-hidden flex flex-col">
                    {isImage && (
                      <Image
                        src={file}
                        alt={`Verification Document ${index + 1}` || "Image"}
                        className="w-full h-auto object-contain rounded-md"
                        width={300}
                        height={300}
                      />
                    )}

                    {isPdf && (
                      <iframe
                        src={file}
                        title={`Verification Document ${index + 1}`}
                        className="w-full h-full"
                      />
                    )}

                    {isDoc && (
                      <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-600">
                        <span className="text-sm">📄 Word Document</span>
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-blue-500 hover:underline"
                        >
                          Open in New Tab
                        </a>
                      </div>
                    )}

                    {!isImage && !isPdf && !isDoc && (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Unsupported File Type
                      </div>
                    )}
                  </div>
                );
              })}
            </div>


          </div>
        </div>
      )}
    </div>
  )
}
"use client";

import { useGetCmsQuery } from "@/redux/api/cmsApi";


export default function ContactSection() {
  // Fetch CMS data using the RTK Query hook
  const { data: cmsData, isSuccess } = useGetCmsQuery("contactUs");

  // Default hardcoded data (used initially or if API fails)
  const defaultContent = {
    email: "info@simplerooms.ng",
    phone: "+234 (0)9162136000",
    address: "60B Ogudu Rd, Ogudu GRA,Ikeja, Lagos, Nigeria",
  };

  // Use API data if available, otherwise fallback to default data
  const contentData = isSuccess && cmsData?.data?.content
    ? cmsData.data.content
    : defaultContent;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-primary rounded-2xl p-8 md:p-12">
        {/* Contact Us Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Contact Us</h2>

        {/* Subtitle */}
        <p className="text-white text-lg md:text-xl mb-8 leading-relaxed">
          For questions or concerns regarding this Privacy Policy, contact us at:
        </p>

        {/* Contact Information */}
        <div className="space-y-4 mb-8">
          <div className="text-white text-lg">
            <span className="font-medium">Email:</span> {contentData.email}
          </div>
          <div className="text-white text-lg">
            <span className="font-medium">Phone:</span> {contentData.phone}
          </div>
          <div className="text-white text-lg">
            <span className="font-medium">Address:</span> {contentData.address}
          </div>
        </div>

        {/* Thank you message */}
        <p className="text-white text-lg md:text-xl mb-8 leading-relaxed">
          Thank you for trusting simpleroomsng.com with your rental needs!
        </p>

        {/* Compliance statement */}
        <p className="text-white text-lg leading-relaxed">
          This Privacy Policy is compliant with the Nigeria Data Protection Regulation (NDPR) and global best practices.
        </p>
      </div>
    </div>
  );
}
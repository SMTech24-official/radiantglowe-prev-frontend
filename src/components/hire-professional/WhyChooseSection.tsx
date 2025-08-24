import { FaHandPointRight, FaChevronRight } from "react-icons/fa"

export default function WhyChooseSection() {
  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="space-y-8">
        {/* Section Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
          Why Choose simpleroomsng.com for Your Property Needs?
        </h2>

        {/* Services List */}
        <div className="space-y-8">
          {/* Expert Property Listing */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <FaHandPointRight className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-lg md:text-xl font-semibold text-primary">Expert Property Listing</span>
              <span className="text-lg md:text-xl text-gray-900 ml-1">
                – We&apos;ll list your property on our platform to attract high quality tenants quickly all for a competitive
                fee.
              </span>
            </div>
          </div>

          {/* Professional Photography & Videography */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <FaHandPointRight className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-lg md:text-xl font-semibold text-primary">
                Professional Photography & Videography
              </span>
              <span className="text-lg md:text-xl text-gray-900 ml-1">
                – First impressions matter! Our skilled photographers and videographers will showcase your property in
                the best light with stunning, high-resolution images and immersive virtual tours.
              </span>
            </div>
          </div>

          {/* Full Property Management */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <FaHandPointRight className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <span className="text-lg md:text-xl font-semibold text-primary">Full Property Management</span>
                <span className="text-lg md:text-xl text-gray-900 ml-1">
                  – Too busy to handle tenant inquiries, property viewings, or maintenance? Let us take care of it! Our
                  team will:
                </span>
              </div>

              {/* Sub-services List */}
              <div className="ml-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-2">
                    <FaChevronRight className="w-3 h-3 text-gray-900" />
                  </div>
                  <span className="text-lg text-gray-900">Arrange & conduct property viewings</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-2">
                    <FaChevronRight className="w-3 h-3 text-gray-900" />
                  </div>
                  <span className="text-lg text-gray-900">
                    Assist with staging & preparing your property for listing
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-2">
                    <FaChevronRight className="w-3 h-3 text-gray-900" />
                  </div>
                  <span className="text-lg text-gray-900">Lease agreements service.</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-2">
                    <FaChevronRight className="w-3 h-3 text-gray-900" />
                  </div>
                  <span className="text-lg text-gray-900">Ensure your property stays in top condition</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import Image from "next/image"

import getStarted from "@/assets/hire-professional/GetStarted.png"

export default function GetStartedSection() {
  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Image */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={getStarted}
            alt="Winding road through mountains"
            fill
            className="object-cover"
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        </div>

        {/* Right Side - Text Content */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl text-gray-900 leading-tight">Get Started Today!</h2>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            Stop struggling with listings, tenant management, or poor quality photos.{" "}
            <span className="text-primary font-medium">simpleroomsng.com</span> is your trusted partner for professional,
            efficient, and profitable property rental solutions.{" "}
            <span className="text-primary font-medium">Your Property, Our Expertise Renting Made Easy!</span>
          </p>
        </div>
      </div>
    </div>
  )
}

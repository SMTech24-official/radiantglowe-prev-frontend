import Image from "next/image"

import top from "@/assets/hire-professional/top.png"

export default function PropertyManagementHero() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="bg-primary rounded-2xl p-8 md:p-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Image Collage */}
          <div className="relative">
            <div className="relative w-full h-[400px]">
                     <Image
                  src={top}
                  alt="Professional businesswoman smiling"
                  fill
                  className="object-cover"
                />
              {/* <div className="absolute top-15 left-0 w-full md:w-[60%] h-[55%] rounded-lg overflow-hidden shadow-lg z-10">
                <Image
                  src={top}
                  alt="Professional businesswoman smiling"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 60vw, (max-width: 1200px) 30vw, 25vw"
                />
              </div>

              <div className="absolute bottom-25 left-10 md:left-20 w-[35%] h-[35%] rounded-lg overflow-hidden shadow-lg z-20">
                <Image
                  src={left}
                  alt="Business meeting with professionals"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="absolute bottom-10 md:bottom-35 left-30 md:left-60 w-[35%] h-[35%] rounded-lg overflow-hidden shadow-lg z-20">
                <Image
                  src={right}
                  alt="Professional woman holding coffee cup"
                  fill
                  className="object-cover"
                />
              </div> */}
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="text-white space-y-6">
            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl leading-tight">
              Professional Property Management Services – Let Us Handle the Hard Work for You!
            </h1>

            {/* Description Paragraph */}
            <p className="leading-relaxed text-white/90">
              Renting out your property should be profitable, not stressful. At simpleroomsng.com, we help landlords
              get the best returns with zero hassle. Our team handles everything, from professional photos and
              standout marketing to tenant screening and full property management. You keep the income. We
              take care of the rest.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

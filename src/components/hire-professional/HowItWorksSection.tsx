import Image from "next/image";
import { cn } from "@/lib/utils";

import one from "@/assets/hire-professional/One.png";
import two from "@/assets/hire-professional/Two.png";
import three from "@/assets/hire-professional/Three.png";
import four from "@/assets/hire-professional/four.png";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Fill the form",
      description: (
        <>
          Let us know your needs. (Make the form hyperlink to scroll down to
          fill out short form with heading “Hire a professional”)
        </>
      ),
      icon: one,
    },
    {
      number: "02",
      title: "Call/WhatsApp us now",
      description: "to book our services!",
      icon: two,
    },
    {
      number: "03",
      title: "We Visit & Assess",
      description:
        "Our team will schedule a visit to photograph, list, or manage your property.",
      icon: three,
    },
    {
      number: "04",
      title: "Sit Back & Relax",
      description:
        "Our team will schedule a visit to photograph, list, or manage your property.",
      icon: four,
    },
  ];

  return (
    <div className="container mx-auto py-6 md:py-10">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-16">
        How It Works
      </h2>

      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 md:gap-y-20 lg:gap-y-0 lg:gap-x-12 justify-items-center">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center relative"
          >
            {/* Content block (order changes based on odd/even column) */}
            <div
              className={cn(
                "flex flex-col items-center",
                index % 2 !== 0 ? "order-1" : "order-2"
              )}
            >
              <p className="text-primary text-4xl font-bold mb-2">
                {step.number}
              </p>
              <h3 className="text-gray-900 text-xl font-semibold mb-2">
                {step.title}
              </h3>
              {/* <p className="text-gray-700 text-sm leading-relaxed max-w-[200px]">
                {step.description}
              </p> */}
            </div>

            {/* Icon block (order and margin changes based on odd/even column) */}
            <div
              className={cn(
                "relative w-28 h-28 rounded-full bg-primary border-4 border-gray-900 flex items-center justify-center",
                index % 2 !== 0 ? "order-2 mt-6" : "order-1 mb-6"
              )}
            >
              <Image
                src={step.icon || "/placeholder.svg"}
                alt={step.title}
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client"

import { TTestimonial } from "@/types/testimonial.type"
import Image from "next/image"

interface CustomerProfileProps {
  testimonial: TTestimonial
  onClick: () => void
}

export default function CustomerProfile({ testimonial, onClick }: CustomerProfileProps) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
        testimonial.isActive ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={testimonial.avatar || "/placeholder.svg"}
          alt={testimonial.name}
          fill
          className="rounded-full object-cover"
          sizes="48px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{testimonial.name}</h4>
        <p className="text-sm text-gray-600 truncate">{testimonial.role}</p>
      </div>
    </button>
  )
}

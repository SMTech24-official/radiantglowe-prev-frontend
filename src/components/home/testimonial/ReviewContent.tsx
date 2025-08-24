import { TTestimonial } from "@/types/testimonial.type"
import { FiStar } from "react-icons/fi"

interface ReviewContentProps {
  testimonial: TTestimonial
}

export default function ReviewContent({ testimonial }: ReviewContentProps) {
  return (
    <div className="bg-white rounded-2xl h-full">
      {/* Review Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{testimonial.title}</h3>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-6">
        {[...Array(5)].map((_, index) => (
          <FiStar
            key={index}
            className={`w-5 h-5 ${index < testimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
      </div>

      {/* Review Text */}
      <p className="text-gray-600 leading-relaxed text-base">{testimonial.review}</p>
    </div>
  )
}

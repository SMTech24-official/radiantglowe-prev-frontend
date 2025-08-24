import { FaRegHandPointRight } from "react-icons/fa"

// Features data
const features = [
  {
    title: "Zero Commission Fees",
    description: "(Save money, no hidden charges)",
  },
  {
    title: "Verified Listings Only",
    description: '(No scams, no "419" properties)',
  },
  {
    title: "Secure Communication",
    description: "(Chat safely within the platform)",
  },
  {
    title: "24/7 Fraud Monitoring",
    description: "(We protect you from fraudsters)",
  },
]

export default function WhyChooseSection() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="bg-primary rounded-2xl p-8 md:p-12">
        {/* Section Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">Why Choose simpleroomsng.com?</h2>

        {/* Features List */}
        <div className="space-y-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              {/* Checkmark Icon */}
              <div className="flex-shrink-0 mt-1">
                <FaRegHandPointRight className="w-6 h-6 text-white" />
              </div>

              {/* Feature Content */}
              <div className="flex-1">
                <span className="text-white text-lg md:text-xl font-bold">{feature.title}</span>
                <span className="text-white text-lg md:text-xl ml-2 font-normal">{feature.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

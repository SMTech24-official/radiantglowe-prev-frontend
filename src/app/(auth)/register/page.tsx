"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import banner from "@/assets/home/Banner.png";
import Image from "next/image"
import { ArrowBigRight } from "lucide-react"

const registrationSchema = z.object({
  role: z.string().min(1, "Please select your role"),
  email: z.string().email("Please enter a valid email address"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms & Conditions",
  }),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      role: "",
      email: "",
      agreeToTerms: false,
    },
  })

  const watchedValues = watch()
  const router = useRouter()

  const onSubmit = (data: RegistrationFormData) => {
    if (data?.role === 'tenants') {
      localStorage.setItem('registerData', JSON.stringify(data));
      router.push(`/registration/tenants`)
    } else if (data?.role === 'landlord') {
      localStorage.setItem('registerData', JSON.stringify(data));
      router.push(`/registration/landlord`)
    }
  }

  const handleLoginClick = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
            <Image
        src={banner}
        alt=" Banner"
        fill
        className="absolute inset-0 object-cover opacity-20"
        priority
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6 ">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome 👋🏾</h2>
          <p className="text-gray-600 text-sm">Please Create Your Account here</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              Your role
            </Label>
            <Select value={watchedValues.role} onValueChange={(value) => setValue("role", value)}>
              <SelectTrigger className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tenants">Tenants</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="cameron.williamson@example.com"
              className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start space-x-3 py-2">
            <Checkbox
              id="terms"
              checked={watchedValues.agreeToTerms}
              onCheckedChange={(checked) => setValue("agreeToTerms", checked as boolean)}
              className={`mt-0.5`}
            />
            <label className="text-sm text-gray-600 leading-relaxed cursor-pointer">
              By Signing Up, I Agree with{" "}
              <a href="/terms&conditions" target="_blank" className="text-primary hover:text-primary/80 cursor-pointer">Terms & Conditions</a>
            </label>
          </div>
          {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>}

          {/* Register Button */}
          <Button
            type="submit"
            className="cursor-pointer w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg mt-6"
          >
            Register
          </Button>

          {/* Login Link */}
                 <p className="text-center text-sm text-gray-600 mt-1">
            Have a Account? {" "}
            <button
              type="button"
              onClick={handleLoginClick}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Login
            </button>
          </p>
                 {/* back to home */}
            <div className="text-center text-sm text-gray-600 mt-1 flex items-center justify-center">
              <ArrowBigRight className="inline-block mr-1" />
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Back to Home
              </button>
            </div>
        </form>
      </div>
      </div>
    </div>
  )
}

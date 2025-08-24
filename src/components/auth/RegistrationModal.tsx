"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FiX } from "react-icons/fi"
import { z } from "zod"
// import { FcGoogle } from "react-icons/fc"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLoginModal } from "@/context/LoginModalProvider"
import { useRouter } from "next/navigation"

const registrationSchema = z.object({
  role: z.string().min(1, "Please select your role"),
  email: z.string().email("Please enter a valid email address"),
  // password: z.string().min(8, "Password must be at least 8 characters long"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms & Conditions",
  }),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  // const [showPassword, setShowPassword] = useState(false)
  const { openModal, closeModal } = useLoginModal();
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

  const router = useRouter();

  const onSubmit = (data: RegistrationFormData) => {
    if (data?.role === 'tenants') {
      localStorage.setItem('registerData', JSON.stringify(data));
      router.push(`/registration/tenants`)
      onClose()
      closeModal()
    } else if (data?.role === 'landlord') {
      localStorage.setItem('registerData', JSON.stringify(data));
      router.push(`/registration/landlord`)
      onClose()
      closeModal()
    }
  }

  // const handleGoogleSignup = () => {
  //   console.log("Google signup clicked")
  // }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-auto p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome 👋🏾</h2>
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

          {/* Password */}
          {/* <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••••"
                className="h-12 border-gray-200 rounded-lg focus:border-primary focus:ring-primary pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div> */}

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
              <a
                href="/terms&conditions"
                target="_blank"
                className="text-primary hover:text-primary/80 cursor-pointer">Terms & Conditions</a>
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
          <p className="text-center text-sm text-gray-600 mt-1">
            Have a Account? {" "}
            <button
              type="button"
              onClick={() => {
                onClose()
                openModal(false)
              }
              }
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Login
            </button>
          </p>

          {/* Login Link */}
          {/* <Button
            type="button"
            variant="ghost"
            onClick={handleLoginClick}
            className="cursor-pointer w-full h-12 text-primary border border-primary hover:bg-background-secondary font-medium rounded-lg"
          >
            Login
          </Button> */}

          {/* Divider */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or Signup With</span>
            </div>
          </div> */}

          {/* Google Signup */}
          {/* <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            className="cursor-pointer w-full h-12 border-gray-200 hover:bg-gray-50 font-medium rounded-lg flex items-center justify-center space-x-2 bg-transparent"
          >
            <FcGoogle size={32} />
            <span className="text-gray-700">Login with Google</span>
          </Button> */}
        </form>
      </div>
    </div>
  )
}

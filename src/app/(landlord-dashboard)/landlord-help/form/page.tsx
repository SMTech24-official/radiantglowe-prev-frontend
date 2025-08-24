/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// Define the schema for form validation using Zod
const formSchema = z.object({
  name: z.string().min(1, { message: "Your Name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  number: z.string().min(10, { message: "Your Number is required and must be at least 10 digits." }),
  message: z.string().min(1, { message: "Your Message is required." }),
})

type FormData = z.infer<typeof formSchema>

export default function LandlordHelpFormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = (data: FormData) => {
    // console.log("Form Data:", data)
    reset() // Reset form fields after submission
  }

  return (
    <div className="w-full max-w-3xl bg-white lg:p-8 rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name, Email, Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="name" className="block text-base font-medium text-gray-900 mb-2">
              Your Name
            </label>
            <Input
              id="name"
              placeholder="Your Full Name"
              {...register("name")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-2">
              Your Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Your Email"
              {...register("email")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="number" className="block text-base font-medium text-gray-900 mb-2">
              Your Number
            </label>
            <Input
              id="number"
              type="tel"
              placeholder="Your Number"
              {...register("number")}
              className="h-12 border-gray-300 focus:border-gray-400 focus:ring-0"
            />
            {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number.message}</p>}
          </div>
        </div>

        {/* Your Message */}
        <div>
          <label htmlFor="message" className="block text-base font-medium text-gray-900 mb-2">
            Your Message
          </label>
          <Textarea
            id="message"
            placeholder="Your Message"
            rows={5}
            {...register("message")}
            className="min-h-[120px] border-gray-300 focus:border-gray-400 focus:ring-0"
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
        </div>

        {/* Send Request Button */}
        <Button
          type="submit"
          className="w-full h-14 bg-primary hover:bg-primary text-white text-lg font-medium rounded-lg"
        >
          Send Request
        </Button>
      </form>
    </div>
  )
}

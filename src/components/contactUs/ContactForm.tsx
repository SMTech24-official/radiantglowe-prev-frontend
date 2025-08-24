/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCreateSupportMutation } from "@/redux/api/supportApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  surname: z
    .string()
    .min(2, "Surname must be at least 2 characters")
    .max(50, "Surname must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  telephone: z.string().optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [createSupportMutate, { isLoading }] = useCreateSupportMutation();
  // const user = useDecodedToken(localStorage.getItem("accessToken"));
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const { name, surname, email, message, telephone } = data;
      await createSupportMutate({ name: name + ' ' + surname, email, phoneNumber: telephone, message }).unwrap();
      setIsSuccess(true);
      toast.success("Message sent successfully. Please wait for a response.");
      reset();
      router.push("/");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      {isSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          Thank you! Your message has been sent successfully.
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name, Surname, and Email Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="First Name"
              {...register("name")}
              className={`w-full px-4 py-3 border text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors rounded-md ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Surname Field */}
          <div>
            <label
              htmlFor="surname"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Surname
            </label>
            <input
              type="text"
              id="surname"
              placeholder="Surname"
              {...register("surname")}
              className={`w-full px-4 py-3 border text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors rounded-md ${errors.surname ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.surname && (
              <p className="mt-1 text-sm text-red-600">{errors.surname.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="md:col-span-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              {...register("email")}
              className={`w-full px-4 py-3 border text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors rounded-md ${errors.email ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <div>
              <label htmlFor="telephone" className="block text-base font-medium text-gray-900 mb-2">
                Telephone:
              </label>
              <input
                id="telephone"
                type="tel"
                placeholder="Telephone"
                {...register("telephone")}
                className={`w-full px-4 py-3 border text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors rounded-md ${errors.telephone ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>}
            </div>
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            rows={6}
            placeholder="Message"
            {...register("message")}
            className={`w-full px-4 py-3 border text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors rounded-md resize-none ${errors.message ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={`w-full flex justify-center items-center gap-2 py-3 px-6 font-semibold text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isSubmitting || isLoading
            ? "bg-primary/50 cursor-not-allowed"
            : "bg-primary hover:bg-primary/80"
            }`}
        >
          {(isSubmitting || isLoading) && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isSubmitting || isLoading ? "Sending..." : "Send Request"}
        </button>
      </form>
    </div>
  );
}
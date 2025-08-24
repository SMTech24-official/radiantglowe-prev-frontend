/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useCreateSupportTicketMutation } from "@/redux/api/supportApi";
import { toast } from "sonner";

const formSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  category: z.enum(["technical", "billing", "general", "suggestion", "other"], {
    errorMap: () => ({ message: "Please select a category" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactFormModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [createSupportMutate, { isLoading }] = useCreateSupportTicketMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createSupportMutate(values).unwrap();
      toast.success("Ticket Created successfully. Please wait for a response.");
      form.reset();
      onClose();
    } catch (error) {
      toast.error("Failed to create ticket. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
        <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Body */}
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Need Help?</h2>
            <p className="text-sm text-gray-600 mb-6">
              Please fill out the form below, and our support team will get back to you shortly.
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 text-sm font-medium">Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="mt-2 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          placeholder="Enter the issue title"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 text-sm font-medium">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={5}
                          className="mt-2 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                          placeholder="Describe your issue..."
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 text-sm font-medium">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full mt-2 border-gray-300 focus:border-amber-500 focus:ring-amber-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="suggestion">Suggestion</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/80 cursor-pointer text-white font-medium text-sm px-6 py-2 rounded-md ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading && (
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
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
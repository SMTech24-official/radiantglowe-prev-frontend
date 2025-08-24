/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

// Define the schema with proper typing
export const propertySchema = z.object({
  status: z.enum(["available", "rented", "pending"]),
  headlineYourProperty: z.string()
    .min(1, "Headline is required")
    .max(150, "Headline must be less than 150 characters"),
  propertyType: z.string()
    .min(1, "Property type is required"),
  bedrooms: z.number()
    .min(0, "Bedrooms cannot be negative"),
  bathrooms: z.number()
    .min(0, "Bathrooms cannot be negative"),
  livingRooms: z.number()
    .min(0, "Living rooms cannot be negative"),
  kitchen: z.number()
    .min(0, "Kitchen count cannot be negative"),
  location: z.object({
    flatOrHouseNo: z.string().optional(),
    address: z.string()
      .min(1, "Address is required"),
    state: z.string()
      .min(1, "State is required"),
    city: z.string()
      .min(1, "City is required"),
    town: z.string()
      .min(1, "Town is required"),
    area: z.string().optional(),
  }),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  furnished: z.enum(["fully_furnished", "semi_furnished", "unfurnished"]).optional(),
  features: z.array(z.string()).min(1, "At least one feature must be selected"),
  formAvailable: z.string()
    .min(1, "Available date is required"),
  isIncludeAllUtilityWithService: z.boolean(),
  minimumLengthOfContract: z.number().optional(),
  isReferenceRequired: z.boolean(),
  accessYourProperty: z.array(z.string()).min(1, "At least one access preference must be selected"),
  mediaLink: z.string().optional(),
  isAcceptTermsAndCondition: z.boolean()
    .refine(val => val === true, "You must accept the terms and conditions"),
  isRemoteVideoView: z.boolean().optional(),
  rentPerYear: z.number()
    .min(0, "Rent per year cannot be negative"),
  rentPerMonth: z.number()
    .min(0, "Rent per month cannot be negative"),
  rentPerDay: z.number()
    .min(0, "Rent per day cannot be negative"),
  serviceCharge: z.number()
    .min(0, "Service charge cannot be negative"),
  depositAmount: z.number()
    .min(0, "Deposit amount cannot be negative"),
  gender: z.string().optional(),
  ages: z.string().optional(),
}) satisfies z.ZodType<any>;

// Infer the type from the schema
export type PropertySchema = z.infer<typeof propertySchema>;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithArrayBuffer } from "./baseQueryWithArrayBuffer";

export interface BookingQueryParams {
  tenantId?: string;
  landlordId?: string;
  propertyId?: string;
  paymentMethod?: string;
  page?: string;
  limit?: string;
}


export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    landlordPropertyBooking: builder.query<any, void>({
      query: () => ({
        url: "/bookings/my-tenants",
        method: "GET",
      }),
      providesTags: ["landlord-property-booking"],
    }),
    allPropertyBooking: builder.query<any, BookingQueryParams>({
      query: ({ tenantId, landlordId, propertyId, paymentMethod, page = '1', limit = '10' }) => {
        const params = new URLSearchParams();

        if (tenantId) params.append('tenantId', tenantId);
        if (landlordId) params.append('landlordId', landlordId);
        if (propertyId) params.append('propertyId', propertyId);
        if (paymentMethod) params.append('paymentMethod', paymentMethod);
        params.append('page', page);
        params.append('limit', limit);

        return {
          url: `/bookings?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['landlord-property-booking-all'],
    }),
    // getInvoice: builder.query<ArrayBuffer, string>({
    //   query: (id: string) => `/bookings/invoice/${id}`,
    //   responseHandler: (response) => response.arrayBuffer(),  // <-- Moved outside query
    //   providesTags: ["booking-invoice"],
    // }),

    createBooking: builder.mutation<any, any>({
      query: (data) => ({
        url: `/bookings`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["landlord-property-booking-all", "landlord-property-booking"],
    }),
  }),
});

export const {
  useLandlordPropertyBookingQuery,
  useAllPropertyBookingQuery,
  // useGetInvoiceQuery,
  useCreateBookingMutation
} = bookingsApi;


export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: baseQueryWithArrayBuffer, // Custom baseQuery here
  endpoints: (builder) => ({
    getInvoice: builder.query<ArrayBuffer, string>({
      query: (id) => `/bookings/invoice/${id}`,
      // providesTags: ["booking-invoice"],
    }),
  }),
});

export const { useGetInvoiceQuery } = bookingApi;
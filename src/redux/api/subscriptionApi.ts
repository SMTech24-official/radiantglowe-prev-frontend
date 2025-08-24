/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";


export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandlordSubscription: builder.query<any, void>({
      query: () => ({
        url: "/subscription/landlord",
        method: "GET",
      }),
      providesTags: ["landlord-subscription"],
    }),
    getAllSubscription: builder.query<any, void>({
      query: () => ({
        url: "/subscription",
        method: "GET",
      }),
      providesTags: ["all-subscription"],
    }),
    createSubscription: builder.mutation({
      query: (data) => ({
        url: "/subscription",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["landlord-subscription","all-subscription"],
    }),
    refundSubscription: builder.mutation({
      query: (data: { id:string, reason: string }) => ({
        url: `/subscription/${data.id}/refund`,
        method: "POST",
        body: {refundReason: data.reason},
      }),
      invalidatesTags: ["landlord-subscription","all-subscription"],
    }),
  }),
});

export const {
  useGetLandlordSubscriptionQuery,
  useGetAllSubscriptionQuery,
  useCreateSubscriptionMutation,
  useRefundSubscriptionMutation,
} = subscriptionApi;

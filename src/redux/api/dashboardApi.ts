/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    landlordMetaData: builder.query<any, void>({
      query: () => ({
        url: "/dashboard/landlord",
        method: "GET",
      }),
      providesTags: ["landlord-dashboard"],
    }),
    adminMetaData: builder.query<any, void>({
      query: () => ({
        url: "/dashboard/admin",
        method: "GET",
      }),
      providesTags: ["admin-dashboard"],
    }),
    landlordDetailsByAdmin: builder.query<any, any>({
      query: (id:string) => ({
        url: `/dashboard/admin/landlord/${id}`,
        method: "GET",
      }),
      providesTags: ["landloard-deatils-admin"],
    }),
  }),
});

export const {
  useLandlordMetaDataQuery,
  useAdminMetaDataQuery,
  useLandlordDetailsByAdminQuery
} = authApi;

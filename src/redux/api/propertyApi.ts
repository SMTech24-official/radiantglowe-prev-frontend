/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";

interface PropertyQueryParams {
  status?: string
  where?: string
  minPrice?: string
  maxPrice?: string
  propertyType?: string
  availability?: string
  searchTerm?: string
  page?: string | number
  limit?: string | number
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addProperty: builder.mutation({
      query: (data) => ({
        url: "/properties",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["landlord-property", "property-details", "property-with-review","all-property","all-active-property"],
    }),
    getProperty: builder.query<any, any>({
      query: (params) => ({
        url: "/properties",
        method: "GET",
        params,
      }),
      providesTags: ["all-property"],
    }),
    getActiveProperty: builder.query<any, any>({
      query: (params) => ({
        url: "/properties/active",
        method: "GET",
        params,
      }),
      providesTags: ["all-active-property"],
    }),
    landlordProperty: builder.query<any, PropertyQueryParams>({
      query: (params) => ({
        url: "/properties/my-properties",
        method: "GET",
        params,
      }),
      providesTags: ["landlord-property"],
    }),
    propertyElement: builder.query<any, void>({
      query: () => ({
        url: "/propertyElements",
        method: "GET",
      }),
      providesTags: ["property-elements"],
    }),
    addPropertyElement: builder.mutation({
      query: (data) => ({
        url: "/propertyElements",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["property-elements"],
    }),
    updatePropertyElement: builder.mutation({
      query: (data) => ({
        url: "/propertyElements",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["property-elements"],
    }),
    deletePropertyElement: builder.mutation({
      query: (data:{type:string,value:string}) => ({
        url: `/propertyElements/${data.type}/${data.value}`,
        method: "DELETE",
      }),
      invalidatesTags: ["property-elements"],
    }),
    propertyDetailsWithReview: builder.query<any, any>({
      query: (id) => ({
        url: `/properties/${id}/with-reviews`,
        method: "GET",
      }),
      providesTags: ["property-with-review"],
    }),
    propertyDetails: builder.query<any, any>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "GET",
      }),
      providesTags: ["property-details"],
    }),
    updateProperty: builder.mutation<any, any>({
      query: (data) => ({
        url: `/properties/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["landlord-property", "property-details", "property-with-review","all-property","all-active-property"],
    }),
    deleteSingleProperty: builder.mutation<any, any>({
      query: (id) => ({
        url: `/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["landlord-property", "landloard-deatils-admin","all-property","all-active-property"],
    }),
    acceptOrRejectProperty: builder.mutation<any, any>({
      query: (data: { id: string, isActive: boolean }) => ({
        url: `/properties/${data.id}/accept-reject`,
        method: "PATCH",
        body: { isActive: data.isActive },
      }),
      invalidatesTags: ["landlord-property", "landloard-deatils-admin","all-property","all-active-property"],
    }),
    isPropertyHomePageStatus: builder.mutation({
      query: (id) => ({
        url: `/properties/${id}/home-page-view`,
        method: "PATCH",
      }),
      invalidatesTags: ["landlord-property", "landloard-deatils-admin","all-property","all-active-property"],
    }),
  }),
});

export const {
  useAddPropertyMutation,
  useGetPropertyQuery,
  useGetActivePropertyQuery,
  useLandlordPropertyQuery,
  usePropertyElementQuery,
  useAddPropertyElementMutation,
  useUpdatePropertyElementMutation,
  useDeletePropertyElementMutation,
  usePropertyDetailsWithReviewQuery,
  usePropertyDetailsQuery,
  useUpdatePropertyMutation,
  useDeleteSinglePropertyMutation,
  useAcceptOrRejectPropertyMutation,
  useIsPropertyHomePageStatusMutation
} = authApi;

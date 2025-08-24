/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";

// interface QueryParams {
//   status?: string
//   tenantId?: string
//   propertyId?: string
//   page?: string | number
//   limit?: string | number
// }

export const tenancyAgreementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTenancyAgreement: builder.mutation({
      query: (data) => ({
        url: "/tenancyAgreement",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["tenancy-agreement"],
    }),
    updateTenancyAgreement: builder.mutation({
      query: (data:{id:string,data:any}) => ({
        url: `/tenancyAgreement/${data.id}`,
        method: "PATCH",
        body: data.data,
      }),
      invalidatesTags: ["tenancy-agreement","single-tenancy-agreement","my-tenancy-agreements"],
    }),
    acceptRejectTenancyAgreement: builder.mutation({
      query: (data:{id:string,data:{action:'accept'|'reject'},reason?:string}) => ({
        url: `/tenancyAgreement/${data.id}/review`,
        method: "PATCH",
        body: data.data,
      }),
      invalidatesTags: ["tenancy-agreement","single-tenancy-agreement","my-tenancy-agreements"],
    }),
    signTenancyAgreement: builder.mutation({
      query: (data:{id:string,data:{signature:string}}) => ({
        url: `/tenancyAgreement/${data.id}/sign`,
        method: "PATCH",
        body: data.data,
      }),
      invalidatesTags: ["tenancy-agreement","single-tenancy-agreement","my-tenancy-agreements"],
    }),
    deleteTenancyAgreement: builder.mutation({
      query: (data:{id:string}) => ({
        url: `/tenancyAgreement/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["tenancy-agreement","single-tenancy-agreement","my-tenancy-agreements"],
    }),
    getTenancyAgreement: builder.query<any, any>({
      query: (params) => ({
        url: "/tenancyAgreement",
        method: "GET",
        params: params,
      }),
      providesTags: ["tenancy-agreement"],
    }),
    getMyTenancyAgreements: builder.query<any, any>({
      query: (params) => ({
        url: "/tenancyAgreement/my-agreements",
        method: "GET",
        params: params,
      }),
      providesTags: ["my-tenancy-agreements"],
    }),
    getSingleTenancyAgreement: builder.query<any, any>({
      query: (id) => ({
        url: `/tenancyAgreement/${id}`,
        method: "GET",
      }),
      providesTags: ["single-tenancy-agreement"],
    }),
  }),
});

export const {
  useCreateTenancyAgreementMutation,
  useUpdateTenancyAgreementMutation,
  useAcceptRejectTenancyAgreementMutation,
  useSignTenancyAgreementMutation,
  useDeleteTenancyAgreementMutation,
  useGetTenancyAgreementQuery,
  useGetMyTenancyAgreementsQuery,
  useGetSingleTenancyAgreementQuery,
} = tenancyAgreementApi;

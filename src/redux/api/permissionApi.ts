/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";

interface QueryParams {
  status?: string
  tenantId?: string
  propertyId?: string
  page?: string | number
  limit?: string | number
}

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPermission: builder.mutation({
      query: (data) => ({
        url: "/permissions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["tenant-request","tenant-permission"],
    }),
    statusUpdatePermission: builder.mutation({
      query: (data:{id:string,status:string}) => ({
        url: `/permissions/${data.id}/status`,
        method: "PATCH",
        body: {status:data.status},
      }),
      invalidatesTags: ["tenant-request","tenant-permission"],
    }),
    ownTenantRequest: builder.query<any, QueryParams | void>({
      query: () => ({
        url: "/permissions/my-requests",
        method: "GET",
      }),
      providesTags: ["tenant-request"],
    }),
    getTenantpermission: builder.query<any, any>({
      query: (params) => ({
        url: "permissions/tenant-permision",
        method: "GET",
        params: params,
      }),
      providesTags: ["tenant-permission"],
    }),
  }),
});

export const {
  useCreatePermissionMutation,
  useStatusUpdatePermissionMutation,
  useOwnTenantRequestQuery,
  useGetTenantpermissionQuery
} = permissionApi;

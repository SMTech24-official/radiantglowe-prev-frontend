/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";



export const packageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllPackage: builder.query<any, void>({
            query: () => ({
                url: "packages",
                method: "GET",
            }),
            providesTags: ["all-package"],
        }),
        deletePackage: builder.mutation({
            query: (id:string) => ({
                url: `/packages/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["all-package", "active-package"],
        }),
        updatePackage: builder.mutation({
            query: (data: { id: string, data: any }) => ({
                url: `/packages/${data.id}`,
                method: "PATCH",
                body: data.data,
            }),
            invalidatesTags: ["all-package", "active-package"],
        }),
        addPackage: builder.mutation({
            query: (data) => ({
                url: `/packages`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["all-package", "active-package"],
        }),
        statusUpdatePackage: builder.mutation({
            query: (data: { id: string, status: boolean }) => ({
                url: `/packages/${data.id}/status`,
                method: "PATCH",
                body: { isActive: data.status },
            }),
            invalidatesTags: ["tenant-request", "tenant-permission"],
        }),
        getActivePackage: builder.query<any, void>({
            query: () => ({
                url: "/packages/active",
                method: "GET",
            }),
            providesTags: ["active-package"],
        }),
        getSinglePackage: builder.query<any, any>({
            query: (id: string) => ({
                url: `/packages/${id}`,
                method: "GET",
            }),
            providesTags: ["active-package"],
        }),
    }),
});

export const {
    useGetAllPackageQuery,
    useDeletePackageMutation,
    useUpdatePackageMutation,
    useAddPackageMutation,
    useStatusUpdatePackageMutation,
    useGetActivePackageQuery,
    useGetSinglePackageQuery
} = packageApi;

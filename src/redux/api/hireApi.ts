/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";


export const hireApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllHire: builder.query<any, any>({
            query: (params) => ({
                url: "/hires",
                method: "GET",
                params,
            }),
            providesTags: ["all-hires"],
        }),
        createHire: builder.mutation({
            query: (data) => ({
                url: "/hires",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["all-hires"],
        }),
        updateHireStatus: builder.mutation({
            query: (data: { id: string, status: string }) => {
                return {
                    url: `/hires/${data.id}/status`,
                    method: "PATCH",
                    body: { status: data.status },
                };
            },
            invalidatesTags: ["all-hires"],
        }),
    }),
});

export const {
    useGetAllHireQuery,
    useCreateHireMutation,
    useUpdateHireStatusMutation
} = hireApi;

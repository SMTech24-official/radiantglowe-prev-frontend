/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";


export const supportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createSupport: builder.mutation({
            query: (data) => ({
                url: "/support",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["all-support", "own-messages"],
        }),
        createSupportTicket: builder.mutation({
            query: (data) => ({
                url: "/ticket",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["support-ticket","own-ticket"],
        }),
        createSupportUsers: builder.mutation({
            query: (data) => ({
                url: "/support/user",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["all-support", "own-messages"],
        }),
        getAllSupport: builder.query<any, any>({
            query: (params) => ({
                url: "/support",
                method: "GET",
                params,
            }),
            providesTags: ["all-support"],
        }),
        getAllTicket: builder.query<any, any>({
            query: (params) => ({
                url: "/ticket",
                method: "GET",
                params,
            }),
            providesTags: ["support-ticket"],
        }),
        getOwnSupport: builder.query<any, any>({
            query: (params) => ({
                url: "/support/my-messages",
                method: "GET",
                params,
            }),
            providesTags: ["own-messages"],
        }),
        getOwnSupportTicket: builder.query<any, any>({
            query: (params) => ({
                url: "/ticket/my-tickets",
                method: "GET",
                params,
            }),
            providesTags: ["own-ticket"],
        }),
        updateSupportStatus: builder.mutation({
            query: (data: { id: string, status: string }) => {
                return {
                    url: `/support/${data.id}/status`,
                    method: "PATCH",
                    body: { status: data.status },
                };
            },
            invalidatesTags: ["all-support", "own-messages"],
        }),
        updateTicketStatus: builder.mutation({
            query: (data: { id: string, status: string }) => {
                return {
                    url: `/ticket/${data.id}/status`,
                    method: "PATCH",
                    body: { status: data.status },
                };
            },
            invalidatesTags: ["support-ticket","own-ticket"],
        }),
        addMessageInTicket: builder.mutation({
            query: (data: { id: string, content: string }) => {
                return {
                    url: `/ticket/${data.id}/message`,
                    method: "POST",
                    body: { content: data.content },
                };
            },
            invalidatesTags: ["support-ticket","own-ticket"],
        }),
    }),
});

export const {
    useCreateSupportMutation,
    useCreateSupportTicketMutation,
    useCreateSupportUsersMutation,
    useGetAllSupportQuery,
    useGetAllTicketQuery,
    useGetOwnSupportQuery,
    useGetOwnSupportTicketQuery,
    useUpdateSupportStatusMutation,
    useUpdateTicketStatusMutation,
    useAddMessageInTicketMutation,
} = supportApi;

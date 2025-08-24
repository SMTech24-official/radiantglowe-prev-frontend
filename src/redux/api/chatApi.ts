/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";


export const chatApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getChat: builder.query<any, any>({
            query: (params) => ({
                url: "/chats",
                method: "GET",
                params,
            }),
            providesTags: ["all-chats"],
        }),
        createMessage: builder.mutation<any, any>({
            query: (messageData) => ({
                url: "/message",
                method: "POST",
                body: messageData,
            }),
            invalidatesTags: ["all-conversations", "all-messages"],
        }),
        getMessageConversations: builder.query<any, void>({
            query: () => ({
                url: `/message/conversations`,
                method: "GET",
            }),
            providesTags: ["all-conversations"],
        }),
        getMessages: builder.query<any, any>({
            query: (data: { otherUserId: string, propertyId: string }) => ({
                url: `/message?otherUserId=${data.otherUserId}&propertyId=${data.propertyId}`,
                method: "GET",
            }),
            providesTags: ["all-messages"],
        }),
        getAllMessagesByAdmin: builder.query<any, any>({
            query: (data: { userId1: string, userId2: string, propertyId: string }) => ({
                url: `/message/admin/messages?userId1=${data.userId1}&userId2=${data.userId2}&propertyId=${data.propertyId}`,
                method: "GET",
            }),
            providesTags: ["admin-all-messages"],
        }),
    }),
});

export const {
    useGetChatQuery,
    useCreateMessageMutation,
    useGetMessageConversationsQuery,
    useGetMessagesQuery,
    useGetAllMessagesByAdminQuery,
} = chatApi;

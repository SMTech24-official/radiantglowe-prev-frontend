/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";


export const cmsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCms: builder.query<any, any>({
            query: (name:string) => ({
                url: "/cms/" + name,
                method: "GET",
            }),
            providesTags: ["cms"],
        }),
        updateCms: builder.mutation({
            query: (data:{pageName:string,data:any}) => ({
                url: "/cms/" + data.pageName,
                method: "PATCH",
                body: data.data,
            }),
            invalidatesTags: ["cms"],
        }),
        createCms: builder.mutation({
            query: (data:{pageName:string,data:any}) => ({
                url: "/cms/" + data.pageName,
                method: "POST",
                body: data.data,
            }),
            invalidatesTags: ["cms"],
        })
    }),
});

export const {
    useGetCmsQuery,
    useUpdateCmsMutation,
    useCreateCmsMutation
} = cmsApi;

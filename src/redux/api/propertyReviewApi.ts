/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";


export const propertyReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReview: builder.mutation({
      query: (data) => ({
        url: `/propertyReview`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["landlord-property", "property-details", "property-with-review","all-review"],
    }),
    likeProperty: builder.mutation({
      query: (id: string) => ({
        url: `/propertyReview/${id}/like`,
        method: "POST"
      }),
      invalidatesTags: ["landlord-property", "property-details", "property-with-review"],
    }),
    disLikeProperty: builder.mutation({
      query: (id: string) => ({
        url: `/propertyReview/${id}/dislike`,
        method: "POST"
      }),
      invalidatesTags: ["landlord-property", "property-details", "property-with-review"],
    }),
    getAllReview: builder.query<any, void>({
      query: () => ({
        url: "/propertyReview",
        method: "GET",
      }),
      providesTags: ["all-review"],
    }),
    getHomePageReview: builder.query<any, void>({
      query: () => ({
        url: "/propertyReview/homepage",
        method: "GET",
      }),
      providesTags: ["homePage-review"],
    }),
    editReview: builder.mutation({
      query: (data:{id: string,data:any}) => ({
        url: `/propertyReview/${data?.id}`,
        method: "PUT",
        body: data?.data,
      }),
      invalidatesTags: ["landlord-property", "property-details", "property-with-review","all-review","homePage-review"],
    }),
    isHomePageStatus: builder.mutation({
      query: (data:{id: string,isHomePageView:boolean}) => ({
        url: `/propertyReview/${data?.id}/homepage`,
        method: "PATCH",
        body: {isHomePageView: true}
      }),
      invalidatesTags: ["landlord-property", "property-details", "property-with-review","all-review","homePage-review"],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useLikePropertyMutation,
  useDisLikePropertyMutation,
  useGetAllReviewQuery,
  useGetHomePageReviewQuery,
  useEditReviewMutation,
  useIsHomePageStatusMutation
} = propertyReviewApi;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "@/redux/api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: "/users/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<any,any>({
      query: () => ({
        url: "/auth/logout",
        method: "POST"
      }),
      invalidatesTags: ["User"],
    }),
    socialAuth: builder.mutation({
      query: (credentials) => ({
        url: "/auth/social-login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: email,
      }),
      invalidatesTags: ["User"],
    }),
    resendOtp: builder.mutation({
      query: (email) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: email,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data:{token:string,password:string}) => ({
        url: "/auth/reset-password?token=" + data.token,
        method: "POST",
        body: {password: data.password},
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),
    getMe: builder.query<any,void>({
      query: () => ({
        url: "/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: "/users",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User", "all-Users"],
    }),
    updateUserByAdmin: builder.mutation({
      query: (data:{id:string,data:any}) => ({
        url: `/users/${data.id}`,
        method: "PATCH",
        body: data.data,
      }),
      invalidatesTags: ["User", "all-Users"],
    }),
    deleteUser: builder.mutation({
      query: (id:string) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User","all-Users"],
    }),
    verifyUser: builder.mutation({
      query: (data:{id:string,isVerified:boolean}) => ({
        url: `/users/verify/${data.id}`,
        method: "PATCH",
        body: { isVerified: data.isVerified },
      }),
      invalidatesTags: ["User","all-Users","landloard-deatils-admin","single-User"],
    }),
    singleUser: builder.query<any,any>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "GET",
      }),
      providesTags: ["single-User"],
    }),
    allUsers: builder.query<any,any>({
      query: (role?:string) => ({
        url: `/users?role=${role}`,
        method: "GET",
      }),
      providesTags: ["all-Users"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSocialAuthMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useUpdateUserMutation,
  useUpdateUserByAdminMutation,
  useDeleteUserMutation,
  useVerifyUserMutation,
  useSingleUserQuery,
  useAllUsersQuery,
} = authApi;

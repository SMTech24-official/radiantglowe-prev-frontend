/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

if (!baseUrl) {
  throw new Error("Environment variable NEXT_PUBLIC_BASE_URL is not set");
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["User", "landlord-dashboard", "landlord-property-booking", "landlord-property", "property-elements", "property-with-review", "property-details", "tenant-permission", "single-User", "landlord-subscription", "admin-dashboard", "all-Users", "landloard-deatils-admin", "landlord-property-booking-all", "booking-invoice", "all-property", "all-active-property", "tenant-request", "all-package", "active-package", "all-chats", "all-support", "own-messages", "all-hires", "all-subscription", "all-review", "own-ticket", "support-ticket", "cms", "homePage-review", "all-messages", "all-conversations", 'admin-all-messages',"tenancy-agreement","single-tenancy-agreement","my-tenancy-agreements"],
  endpoints: (builder) => ({}),
});

//* for refresh token use this following setup of base api
//* Change the refresh api url (if needed)
//* change the error structure (if needed)
//* change the token name if you are not getting token as a accessToken named then change it according to your data.
//* if you want you can handle other status code (if needed), currently only 401 handled.

// const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// if (!baseUrl) {
//   throw new Error("Environment variable NEXT_PUBLIC_BASE_URL is not set");
// }

// const baseQuery = fetchBaseQuery({
//   baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
//   prepareHeaders: (headers, { getState }) => {
//     const state = getState() as RootState;
//     const token = state?.auth?.token || null;
//     if (token) {
//       headers.set("authorization", `Bearer ${token}`);
//     }
//     return headers;
//   },
// });
// const baseQueryWithReauth: BaseQueryFn<
//   string | FetchArgs,
//   unknown,
//   FetchBaseQueryError
// > = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);
//   const state = api.getState() as RootState;
//   const refresh = state?.auth?.refresh_token || null;
//   if (result.error) {
//     const errorData = result.error;
//     result.error = {
//       status: (errorData as any)?.status || 500,
//       data: (errorData as any)?.data?.detail || "something was wrong",
//     };
//   }

//   if (result.error && result.error.status == 401) {
//     const refreshResult = await baseQuery(
//       {
//         url: "auth/token/refresh/",
//         method: "POST",
//         body: { refresh },
//       },
//       api,
//       extraOptions
//     );

//     if (refreshResult.data) {
//       const newToken = (refreshResult.data as { access: string }).access;
//       api.dispatch(setUser({ token: newToken }));
//       result = await baseQuery(args, api, extraOptions);
//     } else {
//       api.dispatch(logout());
//     }
//   }

//   return result;
// };

// export const baseApi = createApi({
//   reducerPath: "api",
//   baseQuery: baseQueryWithReauth,
//   endpoints: () => ({}),
//   tagTypes: ["User"],
// });

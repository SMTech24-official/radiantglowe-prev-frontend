/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchArgs } from '@reduxjs/toolkit/query';

const rawBaseQuery = fetchBaseQuery({ baseUrl: '/api' });

export const baseQueryWithArrayBuffer = async (args: string | FetchArgs, api: any, extraOptions: any) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.meta?.response?.ok) {
    const arrayBuffer = await result.meta.response.arrayBuffer();
    return { data: arrayBuffer };
  }

  return result;
};

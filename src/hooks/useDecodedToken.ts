/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
  [key: string]: unknown;
}

export function useDecodedToken(
  token: string | null | undefined
): DecodedToken | null {
  return useMemo(() => {
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      return null;
    }
  }, [token]);
}

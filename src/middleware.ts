/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface DecodedToken {
  role?: string;
  [key: string]: any;
}

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value ||
    request.cookies.get("role")?.value;

  const loginUrl = new URL("/login", request.url);

  const roleBasedAccess: Record<string, string[]> = {
    "/add-properties": ["landlord", "admin"],
    "/landlord/profile": ["landlord"],
    "/landlord-dashboard": ["landlord"],
    "/all-properties": ["landlord"],
    "/all-tenants": ["landlord"],
    "/landlord-pricing": ["landlord"],
    "/landlord-help": ["landlord"],
    "/tenants/profile": ["tenant"],
    "/tenants/current-bookings": ["tenant"],
    "/tenants/previous-bookings": ["tenant"],
    "/tenants/help": ["tenant"],
    "/admin-dashboard": ["admin"],
    "/admin-dashboard/all-landlords": ["admin"],
    "/admin-dashboard/all-properties": ["admin"],
    "/admin-dashboard/all-tenants": ["admin"],
  };

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = jwtDecode<DecodedToken>(token as string);
    const { pathname } = request.nextUrl;

    const allowedRoles = Object.entries(roleBasedAccess)
      .filter(([path]) => pathname.startsWith(path))
      .flatMap(([_, roles]) => roles);

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role ?? "")) {
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// "Matching Paths"
export const config = {
  matcher: [
    "/add-properties",
    "/tenants/:path*",
    "/landlord/:path*",
    "/landlord-dashboard",
    "/all-properties",
    "/all-tenants",
    "/landlord-pricing",
    "/landlord-help",
    "/admin-dashboard",
    "/admin-dashboard/:path*",
  ],
};




// import { jwtDecode } from "jwt-decode";
// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// interface DecodedToken {
//   role?: string;
//   [key: string]: any;
// }

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("accessToken")?.value || request.cookies.get("token")?.value || request.cookies.get("role")?.value;
//   const { pathname } = request.nextUrl;


//   const roleBasedAccess = {
//     landlord: [
//       "/add-properties",
//       "/landlord/profile",
//       "/landlord-dashboard",
//       "/all-properties",
//       "/all-tenants",
//       "/landlord-pricing",
//       "/landlord-help"
//     ],
//     tenant: [
//       "/tenants/profile",
//       "/tenants/current-bookings",
//       "/tenants/previous-bookings",
//       "/tenants/help",
//     ],
//     admin: [
//       "/admin-dashboard",
//       "/admin-dashboard/all-landlords",
//       "/admin-dashboard/all-properties",
//       "/admin-dashboard/all-tenants"
//     ]
//   };

//   // If no token, set a custom header and allow the request
//   if (!token) {
//     const res = NextResponse.next();
//     res.headers.set("x-require-auth", "true");
//     return res;
//   }

//   try {
//     const user = jwtDecode<DecodedToken>(token);
//     let requiredRole: string | null = null;

//     for (const [role, paths] of Object.entries(roleBasedAccess)) {
//       if (paths.some((path) => pathname.startsWith(path))) {
//         requiredRole = role;
//         break;
//       }
//     }

//     if (requiredRole && user.role !== requiredRole) {
//       const res = NextResponse.next();
//       res.headers.set("x-unauthorized-role", "true");
//       return res;
//     }

//   } catch (error) {
//     const res = NextResponse.next();
//     res.headers.set("x-require-auth", "true");
//     return res;
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/add-properties",
//     "/tenants/:path*",
//     "/landlord/:path*",
//     "/landlord-dashboard",
//     "/all-properties",
//     "/all-tenants",
//     "/landlord-pricing",
//     "/landlord-help",
//     "/admin-dashboard",
//     "/admin-dashboard/:path*",
//   ],
// };

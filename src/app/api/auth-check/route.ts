import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => {
        const [key, ...v] = c.split("=");
        return [key, decodeURIComponent(v.join("="))];
    }));

    const token = cookies.accessToken;

    if (!token) {
        return NextResponse.json({ requireAuth: true });
    }

    try {
        const user = jwtDecode<{ role?: string }>(token);
        return NextResponse.json({ role: user.role });
    } catch {
        return NextResponse.json({ requireAuth: true });
    }
}

import { jwtDecode } from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = req.cookies.accessToken || req.cookies.token || req.cookies.role;

    if (!token) {
        return res.status(200).json({ requireAuth: true });
    }

    try {
        const user = jwtDecode<{ role?: string }>(token);
        return res.status(200).json({ role: user.role });
    } catch {
        return res.status(200).json({ requireAuth: true });
    }
}

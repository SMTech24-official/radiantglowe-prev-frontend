/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { recaptchaToken } = await req.json();

    if (!recaptchaToken) {
      return NextResponse.json(
        { success: false, message: "Missing reCAPTCHA token" },
        { status: 400 }
      );
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const googleVerifyURL = "https://www.google.com/recaptcha/api/siteverify";

    const { data } = await axios.post(
      googleVerifyURL,
      new URLSearchParams({
        secret: secretKey!,
        response: recaptchaToken,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA verification failed", errorCodes: data["error-codes"] },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "reCAPTCHA verified" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

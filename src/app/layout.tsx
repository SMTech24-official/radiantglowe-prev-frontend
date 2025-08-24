
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ReduxProvider from "@/redux/provider/ReduxProvider";
import NextAuthSessionProvider from "@/lib/NextAuthSessionProvider";
import InitAuth from "@/utils/helper/auth.helper";
import { LoginModalProvider } from "@/context/LoginModalProvider";
import GlobalModals from "@/components/shared/GlobalLoginModals";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Find Your Perfect Rental – simpleroomsng",
  description:
    "Browse beautiful properties and book your next rental easily with simpleroomsng.",
  openGraph: {
    type: "website",
    url: "https://update.simpleroomsng.com",
    title: "Find Your Perfect Rental – simpleroomsng",
    description:
      "Browse beautiful properties and book your next rental easily with simpleroomsng.",
    images: [
      {
        url: "https://images.pexels.com/photos/6527066/pexels-photo-6527066.jpeg",
        width: 1200,
        height: 630,
        alt: "simpleroomsng - Your Perfect Rental",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* 👇 Manual OG meta tags for better sharing on Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://update.simpleroomsng.com"
        />
        <meta
          property="og:title"
          content="Find Your Perfect Rental – simpleroomsng"
        />
        <meta
          property="og:description"
          content="Browse beautiful properties and book your next rental easily with simpleroomsng."
        />
        <meta
          property="og:image"
          content="https://images.pexels.com/photos/6527066/pexels-photo-6527066.jpeg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
      <body className={`${plusJakartaSans.className} antialiased`}>
        <Toaster position="bottom-right" richColors />
        <NextAuthSessionProvider>
          <ReduxProvider>
            <LoginModalProvider>
              <GlobalModals />
              <InitAuth />
              <div id="modal-root" />
              {children}
            </LoginModalProvider>
          </ReduxProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}

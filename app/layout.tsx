import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MediGuide - AI-Powered Health Management",
    template: "%s | MediGuide",
  },
  description:
    "Your all-in-one AI-powered healthcare platform for symptom checking, doctor appointments, medical records, and personalized health insights.",
  keywords: [
    "healthcare",
    "AI",
    "symptom checker",
    "doctor appointments",
    "medical records",
    "health insights",
    "online health",
    "patient portal",
  ],
  openGraph: {
    title: "MediGuide - AI-Powered Health Management",
    description:
      "Your all-in-one AI-powered healthcare platform for symptom checking, doctor appointments, medical records, and personalized health insights.",
    url: "https://ai-healthcare-rust.vercel.app/", // Replace with your actual domain
    siteName: "MediGuide",
    images: [
      {
        url: "/image.png", // Replace with a relevant image
        width: 1200,
        height: 630,
        alt: "MediGuide Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MediGuide - AI-Powered Health Management",
    description:
      "Your all-in-one AI-powered healthcare platform for symptom checking, doctor appointments, medical records, and personalized health insights.",
    images: ["/placeholder.svg?height=675&width=1200"], // Replace with a relevant image
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} cz-shortcut-listen="true">
          <Provider>
            <Header />
            <main className="pt-16 mx-auto">{children}</main>

            <Toaster />
          </Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}

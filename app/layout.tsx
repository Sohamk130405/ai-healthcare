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
  title: "HealthPortal - AI-Powered Healthcare Assistant",
  description:
    "Get personalized health insights, symptom checking, and connect with healthcare professionals through our AI-powered platform.",
  generator: "v0.dev",
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

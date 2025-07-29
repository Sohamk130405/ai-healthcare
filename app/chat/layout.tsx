import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Chat - HealthPortal",
  description: "Chat with our AI health assistant for personalized health guidance and support.",
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-screen overflow-hidden">{children}</div>
}

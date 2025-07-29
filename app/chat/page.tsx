"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-full flex overflow-hidden">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-80">
          <div className="flex flex-col h-0 flex-1 border-r bg-white">
            <ChatSidebar />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <ChatSidebar />
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
          <h1 className="font-semibold text-gray-900">AI Health Assistant</h1>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>

        {/* Chat Interface - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}

"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<number>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSessionSelect = (sessionId: number) => {
    setActiveSessionId(sessionId);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleNewSession = () => {
    setActiveSessionId(undefined);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleSessionCreated = (sessionId: number) => {
    setActiveSessionId(sessionId);
  };

  return (
    <div className="h-screen flex pt-5">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:static inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="h-full pt-20 md:pt-0">
          <ChatSidebar
            activeSessionId={activeSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
          />
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">AI Health Assistant</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-y-scroll">
          <ChatInterface
            sessionId={activeSessionId}
            onSessionCreated={handleSessionCreated}
          />
        </div>
      </div>
    </div>
  );
}

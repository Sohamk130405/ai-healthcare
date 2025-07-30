"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatSidebar } from "@/components/chat/chat-sidebar";

export default function ChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string>();

  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id);
  };

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
  };

  return (
    <div className="h-screen flex pt-20">
      {/* Sidebar */}
      <div className="w-80 hidden md:block">
        <ChatSidebar
          activeConversationId={activeConversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main Chat */}
      <div className="flex-1">
        <ChatInterface conversationId={activeConversationId} />
      </div>
    </div>
  );
}

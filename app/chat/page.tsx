"use client";

import { useState } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [newChatMedicalReportIds, setNewChatMedicalReportIds] = useState<
    number[] | undefined
  >(undefined);

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setNewChatMedicalReportIds(undefined); // Clear any pending new chat context
  };

  const handleNewChat = (medicalReportIds?: number[]) => {
    setCurrentSessionId(null); // Deselect current session to start a new one
    setNewChatMedicalReportIds(medicalReportIds); // Store selected report IDs for the new chat
  };

  return (
    <div className="flex h-[calc(100svh-64px)]">
      <div className="w-1/4 min-w-[250px] max-w-[350px] border-r">
        <ChatSidebar
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          currentSessionId={currentSessionId}
        />
      </div>
      <div className="flex-1">
        <ChatInterface
          sessionId={currentSessionId}
          onSessionCreated={setCurrentSessionId}
          initialMedicalReportIds={newChatMedicalReportIds}
        />
      </div>
    </div>
  );
}

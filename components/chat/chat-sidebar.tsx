"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessageSquare, Loader2, FileText } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MedicalReportSelectionModal } from "./medical-report-selector-modal";

interface ChatSession {
  id: number;
  title: string;
  updatedAt: string;
  medicalReportIds: number[] | null;
}

interface ChatSidebarProps {
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: (medicalReportIds?: number[]) => void;
}

export function ChatSidebar({
  currentSessionId,
  onSelectSession,
  onNewChat,
}: ChatSidebarProps) {
  const { user } = useUser();
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchSessions = React.useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    setLoading(true);
    try {
      const response = await fetch("/api/chat/sessions");
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions, currentSessionId]);

  const handleNewChatClick = () => {
    setIsModalOpen(true);
  };

  const handleStartChatWithContext = (selectedReportIds: number[]) => {
    onNewChat(selectedReportIds);
    fetchSessions(); // Refresh sessions to show the new one
  };

  return (
    <Card className="flex flex-col h-full border-r-0 rounded-r-none">
      <CardContent className="p-4 flex flex-col flex-1">
        <Button
          onClick={handleNewChatClick}
          className="w-full mb-4 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>

        <h2 className="text-lg font-semibold mb-3">Your Chats</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">Loading chats...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No chat sessions yet.</p>
            <p>Start a new conversation!</p>
          </div>
        ) : (
          <div className="pr-2 px-4 pb-4 ">
            <div className="space-y-2 overflow-y-scroll h-[500px]">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant="ghost"
                  className={`w-full justify-start h-auto p-3 text-left flex-col items-start ${
                    currentSessionId === session.id.toString()
                      ? "bg-muted hover:bg-muted"
                      : ""
                  }`}
                  onClick={() => onSelectSession(session.id.toString())}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium text-sm truncate max-w-[calc(100%-20px)]">
                      {session.title}
                    </span>
                    {session.medicalReportIds &&
                      session.medicalReportIds.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 text-xs px-2 py-0.5"
                        >
                          <FileText className="h-3 w-3 mr-1" />{" "}
                          {session.medicalReportIds.length}
                        </Badge>
                      )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(session.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <MedicalReportSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartChat={handleStartChatWithContext}
      />
    </Card>
  );
}

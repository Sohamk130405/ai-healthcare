"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, ChevronDown, Loader2 } from "lucide-react";
import { useChat } from "ai/react";
import { useUser } from "@clerk/nextjs";

// Updated Message interface to use 'role' for consistency with AI SDK's UIMessage
interface Message {
  id: number;
  content: string;
  role: "user" | "assistant"; // Changed from 'sender' to 'role'
  createdAt: string;
}

interface ChatInterfaceProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
  initialMedicalReportIds?: number[]; // New prop for initial context
}

export function ChatInterface({
  sessionId,
  onSessionCreated,
  initialMedicalReportIds,
}: ChatInterfaceProps) {
  const [dbMessages, setDbMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      sessionId: sessionId,
    },
    onFinish: async () => {
      // After AI response, clear useChat messages and reload from database
      if (sessionId) {
        setMessages([]);
        await loadMessages();
      }
    },
  });

  // Load messages from database when session changes
  useEffect(() => {
    if (sessionId) {
      loadMessages();
      setMessages([]); // Clear useChat messages when switching sessions
    } else {
      setDbMessages([]);
    }
  }, [sessionId, setMessages]);

  // Auto-scroll logic
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [dbMessages, messages, shouldAutoScroll]);

  // Handle scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      setShouldAutoScroll(isNearBottom);
      setShowScrollButton(
        !isNearBottom && (dbMessages.length > 0 || messages.length > 0)
      );
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [dbMessages.length, messages.length]);

  const loadMessages = async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      const data = await response.json();

      if (data.messages) {
        // Map 'sender' from DB to 'role' for consistency
        setDbMessages(
          data.messages.map((msg: any) => ({
            ...msg,
            role: msg.sender === "user" ? "user" : "assistant",
          }))
        );
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToBottom = () => {
    setShouldAutoScroll(true);
    scrollToBottom();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // If no session exists, create one with initial context if available
    if (!sessionId && input.trim()) {
      try {
        const response = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: input.slice(0, 50) + (input.length > 50 ? "..." : ""),
            medicalReportIds: initialMedicalReportIds, // Pass selected report IDs
          }),
        });

        const data = await response.json();
        if (data.success) {
          onSessionCreated(data.session.id.toString());
        }
      } catch (error) {
        console.error("Error creating session:", error);
      }
    }

    handleSubmit(e);
  };

  // Format message content for better display
  const formatMessageContent = (content: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = content.split("\n\n").filter((p) => p.trim());

    return paragraphs.map((paragraph, index) => {
      // Check if paragraph contains bullet points
      if (paragraph.includes("•")) {
        const lines = paragraph.split("\n");
        return (
          <div key={index} className="mb-3">
            {lines.map((line, lineIndex) => {
              if (line.trim().startsWith("•")) {
                return (
                  <div key={lineIndex} className="flex items-start mb-1">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span className="flex-1">
                      {line.replace("•", "").trim()}
                    </span>
                  </div>
                );
              }
              return (
                <p key={lineIndex} className="mb-2">
                  {line}
                </p>
              );
            })}
          </div>
        );
      }

      return (
        <p key={index} className="mb-3 last:mb-0">
          {paragraph}
        </p>
      );
    });
  };

  // Combine database messages with current chat messages
  const allMessages = sessionId ? dbMessages : messages;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">Loading conversation...</span>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-500 max-w-md">
              Ask me anything about your health. I'm here to provide information
              and guidance, but remember to consult healthcare professionals for
              serious concerns.
            </p>
            {initialMedicalReportIds && initialMedicalReportIds.length > 0 && (
              <Badge
                variant="outline"
                className="mt-4 bg-blue-100 text-blue-700"
              >
                Starting chat with {initialMedicalReportIds.length} medical
                report(s) as context.
              </Badge>
            )}
          </div>
        ) : (
          <>
            {/* Database Messages */}
            {allMessages.map((message, index) => (
              <div
                key={sessionId ? message.id : message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.role === "user" ? (
                    <>
                      <AvatarImage src={user?.imageUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-blue-100">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </AvatarFallback>
                  )}
                </Avatar>

                <Card
                  className={`max-w-[80%] ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="text-sm">
                      {message.role === "user" ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          {formatMessageContent(message.content)}
                        </div>
                      )}
                    </div>
                    {message.role === "assistant" && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        AI Assistant
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Current streaming messages (only for new sessions) */}
            {!sessionId &&
              messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.role === "user" ? (
                      <>
                        <AvatarImage
                          src={user?.imageUrl || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-blue-100">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <Card
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="text-sm">
                        {message.role === "user" ? (
                          <p>{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            {formatMessageContent(message.content)}
                          </div>
                        )}
                      </div>
                      {message.role === "assistant" && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          AI Assistant
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-500">
                        AI is thinking...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-20 right-6">
          <Button
            onClick={handleScrollToBottom}
            size="sm"
            className="rounded-full shadow-lg bg-blue-500 hover:bg-blue-600"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Form */}
      <div className="border-t bg-white p-4">
        <form onSubmit={onSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me about your health..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This AI provides general health information only. Consult healthcare
          professionals for medical advice.
        </p>
      </div>
    </div>
  );
}

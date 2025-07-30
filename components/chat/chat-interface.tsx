"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, AlertCircle, RefreshCw } from "lucide-react";
import { useChat } from "ai/react";

interface ChatInterfaceProps {
  sessionId?: number;
  onSessionCreated?: (sessionId: number) => void;
}

interface DatabaseMessage {
  id: number;
  content: string;
  sender: string;
  createdAt: string;
  metadata?: any;
}

export function ChatInterface({
  sessionId,
  onSessionCreated,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [dbMessages, setDbMessages] = useState<DatabaseMessage[]>([]);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Load conversation history when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadConversationHistory();
    } else {
      setDbMessages([]);
    }
  }, [sessionId]);

  const loadConversationHistory = async () => {
    if (!sessionId) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setDbMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error loading conversation history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      sessionId,
    },
    onFinish: async () => {
      // Reload conversation history after AI response and clear current messages
      if (sessionId) {
        await loadConversationHistory();
        setMessages([]); // Clear the useChat messages to avoid duplicates
      }
    },
  });

  // Handle scroll behavior
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isAtBottom);
    }
  };

  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Only scroll when new messages arrive and user is at bottom
  useEffect(() => {
    scrollToBottom();
  }, [dbMessages, messages, isLoading]);

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Create new session if none exists and user sends first message
  const handleFormSubmit = async (e: React.FormEvent) => {
    if (!sessionId && input.trim()) {
      try {
        const response = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: input.slice(0, 50) + "..." }),
        });

        if (response.ok) {
          const data = await response.json();
          onSessionCreated?.(data.session.id);
        }
      } catch (error) {
        console.error("Error creating session:", error);
      }
    }

    handleSubmit(e);
  };

  // Use only database messages for existing sessions, or current messages for new sessions
  const displayMessages = sessionId ? dbMessages : messages;

  // Convert database messages to the format expected by the UI
  const formattedMessages = displayMessages.map((msg, index) => {
    if ("sender" in msg) {
      // Database message
      return {
        id: msg.id.toString(),
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      };
    } else {
      // useChat message
      return {
        ...msg,
        createdAt: msg.createdAt || new Date(),
      };
    }
  });

  // Add current streaming messages if we're in a new session or actively chatting
  const allMessages = [
    ...formattedMessages,
    ...(!sessionId
      ? messages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt || new Date(),
        }))
      : []),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Health Disclaimer */}
      {showDisclaimer && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  <strong>Health Disclaimer:</strong> This AI assistant provides
                  general health information only. Always consult healthcare
                  professionals for medical advice. In emergencies, contact
                  emergency services immediately.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-amber-700 hover:text-amber-800 p-0 h-auto"
                  onClick={() => setShowDisclaimer(false)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-4 p-4"
        onScroll={handleScroll}
        style={{ scrollBehavior: "smooth" }}
      >
        {isLoadingHistory && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">
              Loading conversation history...
            </p>
          </div>
        )}

        {allMessages.length === 0 && !isLoadingHistory && (
          <div className="text-center py-8">
            <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to AI Health Assistant
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              I'm here to help with general health questions and provide
              information. How can I assist you today?
            </p>
          </div>
        )}

        {allMessages.map((message, index) => (
          <div
            key={`${message.id}-${index}`}
            className={`flex items-start space-x-3 ${
              message.role === "user" ? "flex-row-reverse space-x-reverse w-fit ml-auto" : ""
            }`}
          >
            <Avatar className="h-8 w-8">
              {message.role === "user" ? (
                <>
                  <AvatarImage src="/placeholder.svg?height=32&width=32&text=U" />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarImage src="/placeholder.svg?height=32&width=32&text=AI" />
                  <AvatarFallback className="bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div
              className={`flex-1 max-w-3xl ${
                message.role === "user" ? "text-right" : ""
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Badge
                  variant={message.role === "user" ? "default" : "secondary"}
                >
                  {message.role === "user" ? "You" : "AI Assistant"}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatTime(message.createdAt)}
                </span>
              </div>
              <Card
                className={`${
                  message.role === "user"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100">
                <Bot className="h-4 w-4 text-blue-600" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">
                AI Assistant
              </Badge>
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      AI is thinking...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Badge variant="destructive" className="mb-2">
                Error
              </Badge>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-3">
                  <p className="text-sm text-red-800 mb-2">
                    Sorry, I encountered an error. This might be due to API
                    configuration issues.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reload()}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button - only show when not at bottom */}
      {!shouldAutoScroll && (
        <div className="absolute bottom-20 right-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShouldAutoScroll(true);
              scrollToBottom();
            }}
            className="rounded-full shadow-lg bg-white hover:bg-gray-50"
          >
            ↓ Scroll to bottom
          </Button>
        </div>
      )}

      {/* Input Form */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleFormSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me about your health concerns..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This AI provides general information only. Always consult healthcare
          professionals for medical advice.
        </p>
      </div>
    </div>
  );
}

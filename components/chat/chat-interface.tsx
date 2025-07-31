"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Bot,
  User,
  ChevronDown,
  Loader2,
  FileText,
  Search,
  Brain,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useChat } from "ai/react";
import { useUser } from "@clerk/nextjs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
}

interface ChatInterfaceProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
  initialMedicalReportIds?: number[];
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
  const [isCreatingSession, setIsCreatingSession] = useState(false);
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
    append,
  } = useChat({
    api: "/api/chat",
    body: {
      sessionId: sessionId,
    },
    onFinish: async () => {
      if (sessionId) {
        await loadMessages();
        setMessages([]);
      }
    },
  });

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      const data = await response.json();

      if (data.messages) {
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
  }, [sessionId]);

  // Load messages from database when session changes
  useEffect(() => {
    if (sessionId) {
      loadMessages();
      setMessages([]);
    } else {
      setDbMessages([]);
    }
  }, [sessionId, setMessages, loadMessages]);

  // Auto-scroll when messages change and shouldAutoScroll is true
  useEffect(() => {
    if (shouldAutoScroll) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [dbMessages, messages, shouldAutoScroll, scrollToBottom]);

  // Handle scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;

      setShouldAutoScroll(isAtBottom);
      setShowScrollButton(
        !isAtBottom && (dbMessages.length > 0 || messages.length > 0)
      );
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    const timeoutId = setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [dbMessages.length, messages.length]);

  const handleScrollToBottom = () => {
    setShouldAutoScroll(true);
    scrollToBottom();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const currentInput = input.trim();
    if (!currentInput) return;

    setShouldAutoScroll(true);

    if (!sessionId) {
      setIsCreatingSession(true);
      try {
        const sessionResponse = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title:
              currentInput.slice(0, 50) +
              (currentInput.length > 50 ? "..." : ""),
            medicalReportIds: initialMedicalReportIds,
          }),
        });

        const sessionData = await sessionResponse.json();
        if (sessionData.success) {
          const newSessionId = sessionData.session.id.toString();

          handleInputChange({
            target: { value: "" },
          } as React.ChangeEvent<HTMLInputElement>);

          await append(
            { role: "user", content: currentInput },
            {
              body: {
                sessionId: newSessionId,
              },
            }
          );

          onSessionCreated(newSessionId);
        } else {
          console.error("Failed to create session:", sessionData.error);
        }
      } catch (error) {
        console.error(
          "Error during new session creation or first message send:",
          error
        );
      } finally {
        setIsCreatingSession(false);
      }
    } else {
      handleSubmit(e);
    }
  };

  // Enhanced message content formatting with better source handling
  const formatMessageContent = (content: string) => {
    // Split content into main content and sources
    const sourcesIndex = content.lastIndexOf("\n\nSources:");
    let mainContent = content;
    let sources = "";

    if (sourcesIndex !== -1) {
      mainContent = content.substring(0, sourcesIndex);
      sources = content.substring(sourcesIndex + 2); // Remove the "\n\n" part
    }

    // Format main content
    const paragraphs = mainContent.split("\n\n").filter((p) => p.trim());

    const formattedContent = paragraphs.map((paragraph, index) => {
      // Handle bullet points
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

      // Handle urgent warnings
      if (paragraph.includes("⚠️ URGENT")) {
        return (
          <div
            key={index}
            className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded"
          >
            <p className="text-red-800 font-medium">{paragraph}</p>
          </div>
        );
      }

      return (
        <p key={index} className="mb-3 last:mb-0">
          {paragraph}
        </p>
      );
    });

    // Format sources if they exist
    let formattedSources = null;
    if (sources) {
      const sourceLines = sources.split("\n").filter((line) => line.trim());
      if (sourceLines.length > 1) {
        // Skip the "Sources:" header
        const actualSources = sourceLines.slice(1);
        formattedSources = (
          <Collapsible className="mt-4 pt-3 border-t border-gray-200">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start px-0 py-1 h-auto text-xs text-gray-600 hover:bg-transparent hover:text-gray-800"
              >
                <ChevronRight className="h-3 w-3 mr-1 transition-transform data-[state=open]:rotate-90" />
                <Search className="h-3 w-3 mr-1" />
                <span className="font-medium">
                  Sources ({actualSources.length})
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 px-2 pb-2">
              {actualSources.map((source, index) => {
                // Parse source format: [1] Title - URL
                const match = source.match(/^\[(\d+)\]\s*(.+?)\s*-\s*(.+)$/);
                if (match) {
                  const [, number, title, url] = match;
                  return (
                    <div key={index} className="text-xs text-gray-600">
                      <span className="font-medium">[{number}]</span>{" "}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline hover:text-blue-800"
                        title={title}
                      >
                        {title.length > 60
                          ? title.substring(0, 60) + "..."
                          : title}
                      </a>
                    </div>
                  );
                }
                return (
                  <div key={index} className="text-xs text-gray-600">
                    {source}
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        );
      }
    }

    return (
      <div>
        {formattedContent}
        {formattedSources}
      </div>
    );
  };

  const allMessages = sessionId ? dbMessages : messages;
  const showLoading = loading || isCreatingSession;

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container - Fixed height with proper scrolling */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-scroll p-4 space-y-4 pt-10"
        style={{
          height: "calc(100vh - 200px)",
          minHeight: "400px",
        }}
      >
        {showLoading && allMessages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-500">
              {isCreatingSession
                ? "Starting new chat..."
                : "Loading conversation..."}
            </span>
          </div>
        ) : allMessages.length === 0 && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bot className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-500 max-w-md mb-4">
              Ask me anything about your health. I can search the web for the
              latest medical information, analyze your symptoms, and provide
              evidence-based guidance.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Search className="h-3 w-3 mr-1" />
                Web Search
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Brain className="h-3 w-3 mr-1" />
                Medical Knowledge
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                <Activity className="h-3 w-3 mr-1" />
                Symptom Analysis
              </Badge>
            </div>
            {initialMedicalReportIds && initialMedicalReportIds.length > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <FileText className="h-3 w-3 mr-1" />
                {initialMedicalReportIds.length} medical report(s) loaded
              </Badge>
            )}
          </div>
        ) : (
          <>
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
                  className={`max-w-[85%] ${
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
                        <Bot className="h-3 w-3 mr-1" />
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
                    className={`max-w-[85%] ${
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
                          <Bot className="h-3 w-3 mr-1" />
                          AI Assistant
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}

            {/* Loading indicator */}
            {(isLoading || isCreatingSession) && (
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
                        {isCreatingSession
                          ? "Creating session..."
                          : "AI is thinking..."}
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
        <div className="absolute bottom-20 right-6 z-10">
          <Button
            onClick={handleScrollToBottom}
            size="sm"
            className="rounded-full shadow-lg bg-blue-500 hover:bg-blue-600"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Form - Fixed at bottom */}
      <div className="border-t bg-white p-4 flex-shrink-0">
        <form onSubmit={onSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask me about your health..."
            className="flex-1"
            disabled={isLoading || isCreatingSession}
          />
          <Button
            type="submit"
            disabled={isLoading || isCreatingSession || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Enhanced AI with web search, medical knowledge, and symptom analysis.
          Consult healthcare professionals for medical advice.
        </p>
      </div>
    </div>
  );
}

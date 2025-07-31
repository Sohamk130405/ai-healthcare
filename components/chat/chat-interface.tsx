
"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Play,
  Clock,
  Utensils,
  Dumbbell,
  Heart,
  AlertTriangle,
  Pill,
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

// YouTube Video Component
const YouTubeVideo = ({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) => (
  <div className="my-4 p-3 bg-gray-50 rounded-lg border">
    <div className="flex items-center mb-2">
      <Play className="h-4 w-4 text-red-500 mr-2" />
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
    <div className="aspect-video">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded"
      />
    </div>
  </div>
);

// Diet Plan Component
const DietPlanCard = ({ plan }: { plan: any }) => (
  <Card className="my-4 border-green-200 bg-green-50">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center text-green-800">
        <Utensils className="h-5 w-5 mr-2" />
        Personalized Diet Plan - {plan.goal.replace("_", " ").toUpperCase()}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-green-700 mb-2">
            Breakfast Options
          </h4>
          <ul className="space-y-1">
            {plan.mealPlan.breakfast.map((meal: string, index: number) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {meal}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-green-700 mb-2">Lunch Options</h4>
          <ul className="space-y-1">
            {plan.mealPlan.lunch.map((meal: string, index: number) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {meal}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-green-700 mb-2">Dinner Options</h4>
          <ul className="space-y-1">
            {plan.mealPlan.dinner.map((meal: string, index: number) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {meal}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-green-700 mb-2">Healthy Snacks</h4>
          <ul className="space-y-1">
            {plan.mealPlan.snacks.map((snack: string, index: number) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {snack}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold text-green-700 mb-2">Guidelines</h4>
        <ul className="space-y-1">
          {plan.guidelines.map((guideline: string, index: number) => (
            <li key={index} className="text-sm flex items-start">
              <span className="text-green-500 mr-2">•</span>
              {guideline}
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);

// Exercise Plan Component
const ExercisePlanCard = ({ plan }: { plan: any }) => (
  <Card className="my-4 border-blue-200 bg-blue-50">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center text-blue-800">
        <Dumbbell className="h-5 w-5 mr-2" />
        Exercise Plan - {plan.goal.replace("_", " ").toUpperCase()} (
        {plan.fitnessLevel})
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-blue-700 mb-2">Exercises</h4>
          <ul className="space-y-1">
            {plan.exercises.map((exercise: string, index: number) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {exercise}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-blue-700 mb-2">Weekly Schedule</h4>
          <ul className="space-y-1">
            {Object.entries(plan.weeklySchedule).map(([day, activity]) => (
              <li key={day} className="text-sm flex justify-between">
                <span className="capitalize font-medium">{day}:</span>
                <span>{activity as string}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold text-blue-700 mb-2">Safety Guidelines</h4>
        <ul className="space-y-1">
          {plan.guidelines.map((guideline: string, index: number) => (
            <li key={index} className="text-sm flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {guideline}
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);

// Health Tracking Component
const HealthTrackingCard = ({ tracking }: { tracking: any }) => (
  <Card className="my-4 border-purple-200 bg-purple-50">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center text-purple-800">
        <Heart className="h-5 w-5 mr-2" />
        Health Metric: {tracking.metricType.replace("_", " ").toUpperCase()}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Reading:</span>
        <Badge variant="outline" className="bg-white">
          {tracking.value} {tracking.unit}
        </Badge>
      </div>

      {tracking.analysis && (
        <div className="p-3 bg-white rounded border-l-4 border-purple-400">
          <p className="text-sm">{tracking.analysis}</p>
        </div>
      )}

      {tracking.recommendations && tracking.recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-purple-700 mb-2">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {tracking.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
);

// Medication Reminder Component
const MedicationReminderCard = ({ reminder }: { reminder: any }) => (
  <Card className="my-4 border-orange-200 bg-orange-50">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center text-orange-800">
        <Pill className="h-5 w-5 mr-2" />
        Medication Schedule
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {reminder.schedule.map((med: any, index: number) => (
        <div key={index} className="p-3 bg-white rounded border">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-orange-700">{med.name}</h4>
            <Badge variant="outline">{med.dosage}</Badge>
          </div>
          <div className="space-y-1">
            {med.reminders.map((rem: any, remIndex: number) => (
              <div key={remIndex} className="flex items-center text-sm">
                <Clock className="h-3 w-3 mr-2 text-orange-500" />
                <span>
                  {rem.time} - {rem.message}
                </span>
              </div>
            ))}
          </div>
          {med.specialInstructions && (
            <p className="text-xs text-orange-600 mt-2 italic">
              {med.specialInstructions}
            </p>
          )}
        </div>
      ))}

      <Separator />

      <div>
        <h4 className="font-semibold text-orange-700 mb-2">Important Tips</h4>
        <ul className="space-y-1">
          {reminder.tips.slice(0, 3).map((tip: string, index: number) => (
            <li key={index} className="text-sm flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </CardContent>
  </Card>
);

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

  // Enhanced message content formatting with special content handling
  const formatMessageContent = (content: string) => {
    // Split content into main content and sources
    const sourcesIndex = content.lastIndexOf("\n\nSources:");
    let mainContent = content;
    let sources = "";

    if (sourcesIndex !== -1) {
      mainContent = content.substring(0, sourcesIndex);
      sources = content.substring(sourcesIndex + 2);
    }

    // Extract special content patterns
    const videoMatches = mainContent.match(/\[VIDEO:([^:]+):([^\]]+)\]/g) || [];
    const dietPlanMatch = mainContent.match(/\[DIET_PLAN:([^\]]+)\]/);
    const exercisePlanMatch = mainContent.match(/\[EXERCISE_PLAN:([^\]]+)\]/);
    const healthTrackingMatch = mainContent.match(
      /\[HEALTH_TRACKING:([^\]]+)\]/
    );
    const medicationReminderMatch = mainContent.match(
      /\[MEDICATION_REMINDER:([^\]]+)\]/
    );

    // Remove special patterns from main content
    const cleanedContent = mainContent
      .replace(/\[VIDEO:[^\]]+\]/g, "")
      .replace(/\[DIET_PLAN:[^\]]+\]/g, "")
      .replace(/\[EXERCISE_PLAN:[^\]]+\]/g, "")
      .replace(/\[HEALTH_TRACKING:[^\]]+\]/g, "")
      .replace(/\[MEDICATION_REMINDER:[^\]]+\]/g, "");

    // Format main content
    const paragraphs = cleanedContent.split("\n\n").filter((p) => p.trim());

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
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 font-medium">{paragraph}</p>
            </div>
          </div>
        );
      }

      return (
        <p key={index} className="mb-3 last:mb-0">
          {paragraph}
        </p>
      );
    });

    // Render YouTube videos
    const videoComponents = videoMatches.map((match, index) => {
      const videoMatch = match.match(/\[VIDEO:([^:]+):([^\]]+)\]/);
      if (videoMatch) {
        const [, videoId, title] = videoMatch;
        return (
          <YouTubeVideo
            key={`video-${index}`}
            videoId={videoId}
            title={title}
          />
        );
      }
      return null;
    });

    // Parse and render special components (these would be populated by the AI tools)
    // For demo purposes, we'll show placeholder data
    const specialComponents:any[] = [];

    // Format sources if they exist
    let formattedSources = null;
    if (sources) {
      const sourceLines = sources.split("\n").filter((line) => line.trim());
      if (sourceLines.length > 1) {
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
        {videoComponents}
        {specialComponents}
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
        className="flex-1 overflow-y-auto p-4 space-y-4"
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
              Ask me anything about your health. I have advanced tools to help
              with medical information, diet planning, exercise routines, and
              more.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Search className="h-3 w-3 mr-1" />
                Web Search
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                <Play className="h-3 w-3 mr-1" />
                YouTube Videos
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Utensils className="h-3 w-3 mr-1" />
                Diet Planning
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Dumbbell className="h-3 w-3 mr-1" />
                Exercise Plans
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Brain className="h-3 w-3 mr-1" />
                Medical Knowledge
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                <Activity className="h-3 w-3 mr-1" />
                Health Tracking
              </Badge>
              <Badge variant="outline" className="bg-pink-50 text-pink-700">
                <Pill className="h-3 w-3 mr-1" />
                Medication Reminders
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
            placeholder="Ask me about your health, diet, exercise, or request YouTube videos..."
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
          Enhanced AI with web search, YouTube videos, diet planning, exercise
          routines, health tracking, and more. Consult healthcare professionals
          for medical advice.
        </p>
      </div>
    </div>
  );
}

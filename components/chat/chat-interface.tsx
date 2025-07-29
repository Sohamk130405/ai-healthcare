"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Mic, MicOff, Bot, User } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your AI health assistant. How can I help you today? You can ask me about symptoms, general health questions, or get guidance on when to see a doctor.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I understand your concern. Based on what you've described, I'd recommend monitoring your symptoms closely. If they persist or worsen, please consider consulting with a healthcare professional. Would you like me to help you find specialists in your area or check for related symptoms?",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Voice recording logic would go here
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="hidden lg:block bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center">
          <Bot className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Health Assistant</h1>
            <p className="text-sm text-gray-500">Get personalized health advice and guidance</p>
          </div>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-3 max-w-[85%] ${
                    message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {message.sender === "ai" ? (
                      <>
                        <AvatarFallback className="bg-blue-600 text-white">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarFallback className="bg-gray-600 text-white">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <Card
                      className={`p-4 ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white border-gray-200 shadow-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </Card>
                    <p
                      className={`text-xs mt-2 px-1 ${
                        message.sender === "user" ? "text-right text-gray-500" : "text-left text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[85%]">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-blue-600 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Card className="p-4 bg-white border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-white border-t flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your health concerns..."
                onKeyPress={handleKeyPress}
                className="pr-12 min-h-[44px] resize-none"
                disabled={isLoading}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleRecording}
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 ${
                  isRecording ? "text-red-500" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={sendMessage} disabled={!inputValue.trim() || isLoading} className="h-[44px] px-6">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI responses are for informational purposes only. Always consult healthcare professionals for medical
            advice.
          </p>
        </div>
      </div>
    </div>
  )
}

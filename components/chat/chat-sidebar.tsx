"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, MessageSquare, Trash2, Edit3 } from "lucide-react"

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  isActive?: boolean
}

export function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Headache and Fever Symptoms",
      lastMessage: "Based on your symptoms, I recommend...",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      messageCount: 12,
      isActive: true,
    },
    {
      id: "2",
      title: "Blood Pressure Questions",
      lastMessage: "Normal blood pressure ranges are...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 8,
    },
    {
      id: "3",
      title: "Diet and Nutrition Advice",
      lastMessage: "A balanced diet should include...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 15,
    },
    {
      id: "4",
      title: "Exercise Recommendations",
      lastMessage: "For your fitness level, I suggest...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      messageCount: 6,
    },
    {
      id: "5",
      title: "Sleep Issues Discussion",
      lastMessage: "Good sleep hygiene includes...",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      messageCount: 10,
    },
  ])

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      lastMessage: "Start a new conversation...",
      timestamp: new Date(),
      messageCount: 0,
    }
    setSessions([newSession, ...sessions])
  }

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter((session) => session.id !== sessionId))
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Chat History</h2>
          <Button size="sm" onClick={createNewChat} className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                session.isActive ? "bg-blue-50 border-blue-200 shadow-sm" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <h3 className="font-medium text-sm text-gray-900 truncate">{session.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{session.lastMessage}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{formatTimestamp(session.timestamp)}</span>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {session.messageCount}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-gray-400 hover:text-gray-600">
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-gray-400 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSession(session.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
          </p>
          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={createNewChat}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { formatMessageTime } from "../lib/utils"

interface Message {
  id: string
  userId: string
  content: string
  timestamp: number
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  typingUsers: string[]
}

export function MessageList({ messages, currentUserId, typingUsers }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typingUsers])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-2 ${message.userId === currentUserId ? "justify-end" : ""}`}
        >
          {message.userId !== currentUserId && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{message.userId.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}

          <div
            className={`max-w-[80%] ${message.userId === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}
          >
            {message.userId !== currentUserId && <div className="font-semibold text-xs mb-1">{message.userId}</div>}
            <div className="break-words">{message.content}</div>
            <div className="text-xs opacity-70 mt-1 text-right">
              {formatMessageTime(message.timestamp)}
            </div>
          </div>

          {message.userId === currentUserId && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{message.userId.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}

      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">
            {typingUsers.length === 1 ? `${typingUsers[0]} is typing...` : `${typingUsers.length} people are typing...`}
          </span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
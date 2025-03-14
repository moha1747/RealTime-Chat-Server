"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatSidebar } from "../components/chat-sidebar"
import { MessageList } from "../components/message-list"
import { Send, Loader2 } from "lucide-react"

// Define message type
interface Message {
  id: string
  userId: string
  content: string
  timestamp: number
}

// Define channel type
interface Channel {
  id: string
  name: string
}

export default function ChatPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string>("")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChannel, setActiveChannel] = useState<string>("general")
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const wsRef = useRef<WebSocket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [previousChannel, setPreviousChannel] = useState<string | null>(null)

  // Sample channels - in production this would come from your API
  const channels: Channel[] = [
    { id: "general", name: "General" },
    { id: "random", name: "Random" },
    { id: "support", name: "Support" },
  ]

  // Safely send WebSocket messages
  const safeSendWebSocketMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn("WebSocket not ready, cannot send message", message);
    return false;
  };

  useEffect(() => {
    // Check if user is logged in
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      router.push("/login")
      return
    }
    setUserId(storedUserId)

    // Initialize WebSocket connection
    const ws = new WebSocket("ws://localhost:8081")
    wsRef.current = ws

    ws.onopen = () => {
      console.log("Connected to WebSocket server")
      setIsConnected(true)

      // Join the default channel only after connection is established
      safeSendWebSocketMessage({
        event: "join_channel",
        userId: storedUserId,
        channelId: activeChannel,
      })
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log("Message received:", data)

      switch (data.event) {
        case "new_message":
        case "send_message":
          if (data.channelId === activeChannel) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                userId: data.userId,
                content: data.content,
                timestamp: data.timestamp || Date.now(),
              },
            ])
          }
          break
        case "user_typing":
          if (data.channelId === activeChannel && data.userId !== userId) {
            setTypingUsers((prev) => {
              if (data.isTyping) {
                const newSet = new Set(prev)
                newSet.add(data.userId)
                return newSet
              } else {
                const newSet = new Set(prev)
                newSet.delete(data.userId)
                return newSet
              }
            })
          }
          break
        case "user_joined":
          console.log(`User ${data.userId} joined channel ${data.channelId}`)
          break
        case "user_left":
          console.log(`User ${data.userId} left channel ${data.channelId}`)
          break
        case "channel_list":
          // Handle channel list if implementing dynamic channel loading
          console.log("Received channel list:", data.channels)
          break
        case "error":
          console.error("Error from server:", data.message)
          break
      }
    }

    ws.onclose = () => {
      console.log("Disconnected from server")
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
      setIsConnected(false)
    }

    return () => {
      // Leave channel and close connection on unmount
      if (ws.readyState === WebSocket.OPEN) {
        safeSendWebSocketMessage({
          event: "leave_channel",
          userId: storedUserId,
          channelId: activeChannel,
        })
        ws.close()
      }
    }
  }, [router])

  // Handle channel change
  useEffect(() => {
    if (!wsRef.current || !isConnected || !userId) return
    
    // Store previous channel
    if (previousChannel) {
      // Leave previous channel only if we were already connected
      safeSendWebSocketMessage({
        event: "leave_channel",
        userId,
        channelId: previousChannel,
      })
    }

    // Join new channel
    safeSendWebSocketMessage({
      event: "join_channel",
      userId,
      channelId: activeChannel,
    })

    // Clear messages when changing channels
    setMessages([])
    // Clear typing indicators
    setTypingUsers(new Set())
    
    // Update previous channel
    setPreviousChannel(activeChannel)
  }, [activeChannel, isConnected, userId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !isConnected) return

    safeSendWebSocketMessage({
      event: "send_message",
      userId,
      channelId: activeChannel,
      content: message,
    })

    setMessage("")

    // Stop typing indicator
    handleStopTyping()
  }

  const handleTyping = () => {
    if (!isTyping && isConnected) {
      setIsTyping(true)
      safeSendWebSocketMessage({
        event: "user_typing",
        userId,
        channelId: activeChannel,
        isTyping: true,
      })
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(handleStopTyping, 2000)
  }

  const handleStopTyping = () => {
    if (isTyping && isConnected) {
      setIsTyping(false)
      safeSendWebSocketMessage({
        event: "user_typing",
        userId,
        channelId: activeChannel,
        isTyping: false,
      })
    }
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    handleTyping()
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
        userId={userId}
      />

      <main className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">#{activeChannel}</h1>
          {!isConnected && (
            <div className="flex items-center text-sm text-red-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Disconnected - Trying to reconnect...
            </div>
          )}
        </div>

        <MessageList 
          messages={messages} 
          currentUserId={userId} 
          typingUsers={Array.from(typingUsers)} 
        />

        <div className="p-4 border-t mt-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder={`Message #${activeChannel}`}
              value={message}
              onChange={handleMessageChange}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!isConnected || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
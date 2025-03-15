"use client"

import { Button } from "@/components/ui/button"
import { Hash, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "./sidebar"

interface Channel {
  id: string
  name: string
}

interface ChatSidebarProps {
  channels: Channel[]
  activeChannel: string
  onChannelSelect: (channelId: string) => void
  userId: string
}

export function ChatSidebar({ channels, activeChannel, onChannelSelect, userId }: ChatSidebarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const resoponse = await fetch('http://localhost:8081/auth/logout', {
        method: 'GET', 
        credentials: 'include'
      }) 
      if (resoponse.ok) {
        router.push('/login')
      }
    } catch (error) {
        console.error('Logout Failed: ', error)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b p-4">
          <h2 className="font-bold text-lg">ChatApp</h2>
          <p className="text-sm text-muted-foreground">Logged in as {userId}</p>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Channels</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {channels.map((channel) => (
                  <SidebarMenuItem key={channel.id}>
                    <SidebarMenuButton
                      onClick={() => onChannelSelect(channel.id)}
                      isActive={channel.id === activeChannel}
                    >
                      <Hash className="h-4 w-4" />
                      <span>{channel.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  )
}
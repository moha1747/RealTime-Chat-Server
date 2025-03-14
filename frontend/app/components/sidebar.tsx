"use client"

import React from "react"
import { cn } from "@/lib/utils"

// Sidebar Components
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div
      className={cn("w-64 h-full border-r flex flex-col bg-background", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  return (
    <div className={cn("px-4 py-3", className)} {...props}>
      {children}
    </div>
  )
}

export interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)} {...props}>
      {children}
    </div>
  )
}

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, children, ...props }: SidebarFooterProps) {
  return (
    <div className={cn("mt-auto", className)} {...props}>
      {children}
    </div>
  )
}

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({ className, children, ...props }: SidebarGroupProps) {
  return (
    <div className={cn("py-2", className)} {...props}>
      {children}
    </div>
  )
}

export interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupLabel({ className, children, ...props }: SidebarGroupLabelProps) {
  return (
    <div className={cn("px-4 py-2 text-sm font-medium text-muted-foreground", className)} {...props}>
      {children}
    </div>
  )
}

export interface SidebarGroupContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupContent({ className, children, ...props }: SidebarGroupContentProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  )
}

export interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, children, ...props }: SidebarMenuProps) {
  return (
    <div className={cn("space-y-1 px-3", className)} {...props}>
      {children}
    </div>
  )
}

export interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenuItem({ className, children, ...props }: SidebarMenuItemProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}

export function SidebarMenuButton({
  className,
  children,
  isActive,
  ...props
}: SidebarMenuButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent",
        isActive && "bg-accent text-accent-foreground font-medium",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Provider component for context if needed
export interface SidebarContextProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarContextProps) {
  return <>{children}</>
}
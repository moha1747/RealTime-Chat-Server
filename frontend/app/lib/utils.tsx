import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with Tailwind CSS optimizations
 * This utility helps prevent duplicate class names and properly merges Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date for display
 */
export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Formats a timestamp for chat messages
 */
export function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit" 
  })
}

/**
 * Generates a user avatar fallback from their ID or username
 */
export function generateAvatarFallback(name: string): string {
  return name
    .substring(0, 2)
    .toUpperCase()
}
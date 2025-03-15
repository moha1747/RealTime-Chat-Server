import { WebSocket } from 'ws'

// Map of userId to their WebSocket connection
export const activeUsers: Map<string, WebSocket> = new Map()

// Map of channelId to a set of WebSocket connections in that channel
export const channelUsers: Map<string, Set<WebSocket>> = new Map()

// Map to track which channels a user is in (for cleanup when they disconnect)
export const userChannels: Map<string, Set<string>> = new Map()

/**
 * Add a user to a channel
 */
export const addUserToChannel = (userId: string, channelId: string, ws: WebSocket) => {
  // Add user to active users
  activeUsers.set(userId, ws)
  
  // Initialize channel if it doesn't exist
  if (!channelUsers.has(channelId)) {
    channelUsers.set(channelId, new Set())
  }
  
  // Add user to channel
  channelUsers.get(channelId).add(ws)
  
  // Track which channels this user is in
  if (!userChannels.has(userId)) {
    userChannels.set(userId, new Set())
  }
  userChannels.get(userId).add(channelId)
  
  // Set up cleanup when connection closes
  ws.on('close', () => removeUserFromAllChannels(userId, ws))
}

/**
 * Remove a user from a specific channel
 */
export const removeUser = (userId: string, channelId: string, ws: WebSocket) => {
  // Remove from the channel
  if (channelUsers.has(channelId)) {
    channelUsers.get(channelId).delete(ws)
    
    // If channel is empty, remove it
    if (channelUsers.get(channelId).size === 0) {
      channelUsers.delete(channelId)
    }
  }
  
  // Update user's channel list
  if (userChannels.has(userId)) {
    userChannels.get(userId).delete(channelId)
    
    // If user is not in any channels, remove from active users
    if (userChannels.get(userId).size === 0) {
      userChannels.delete(userId)
      activeUsers.delete(userId)
    }
  }
}

/**
 * Remove a user from all channels (used when they disconnect)
 */
export const removeUserFromAllChannels = (userId: string, ws: WebSocket) => {
  if (!userChannels.has(userId)) return
  
  // Get all channels this user is in
  const channels = Array.from(userChannels.get(userId))
  
  // Remove from each channel
  for (const channelId of channels) {
    removeUser(userId, channelId, ws)
    
    // Notify other users in the channel
    broadcastToChannel(channelId, {
      event: "user_left",
      userId,
      channelId
    })
  }
  
  // Clear user tracking
  userChannels.delete(userId)
  activeUsers.delete(userId)
}

/**
 * Broadcast a message to all users in a channel
 */
export const broadcastToChannel = (channelId: string, message: any) => {
  if (!channelUsers.has(channelId)) return
  
  const clients = channelUsers.get(channelId)
  
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  }
}
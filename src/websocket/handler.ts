import { WebSocket } from 'ws'
import { 
  activeUsers, 
  channelUsers, 
  addUserToChannel, 
  removeUser, 
  broadcastToChannel 
} from './manager.ts'
import ChannelModel from '../db/channel_model.ts'
import mongoose from 'mongoose'

export const join_channel = (payload: { event: string, userId: string, channelId: string }, ws: WebSocket) => {
  const { event, userId, channelId } = payload
  if (event !== "join_channel") return
  
  if (!userId || !channelId) {
    console.error("Missing userId or channelID")
    return
  }

  // Initialize channel if it doesn't exist yet
  if (!channelUsers.has(channelId)) {
    channelUsers.set(channelId, new Set())
  }
  
  // Add user to channel
  addUserToChannel(userId, channelId, ws)
  
  // Broadcast to all users in the channel
  broadcastToChannel(channelId, {
    event: "user_joined", 
    userId,
    channelId
  })
  
  console.log(`User ${userId} joined channel ${channelId}`)
}

export const leave_channel = (payload: { event: string, userId: string, channelId: string }, ws: WebSocket) => {
  const { event, userId, channelId } = payload
  if (event !== "leave_channel") return
  
  if (!userId || !channelId) {
    console.error("Missing userId or channelID")
    return
  }

  if (!channelUsers.has(channelId)) {
    console.log(`Channel ${channelId} does not exist`)
    return
  }
  
  if (!channelUsers.get(channelId).has(ws)) {
    console.error("User not in channel, cannot leave")
    return
  }
  
  removeUser(userId, channelId, ws)
  
  broadcastToChannel(channelId, {
    event: "user_left", 
    userId,
    channelId
  })
  
  console.log(`User ${userId} left channel ${channelId}`)
}

export const send_message = (payload: { event: string, userId: string, channelId: string, content: string }, ws: WebSocket) => {
  const { event, userId, channelId, content } = payload
  if (event !== "send_message") return
  
  if (!userId || !channelId || !content) {
    console.error("Missing userId, channelID, or content")
    return
  }

  if (!channelUsers.has(channelId)) {
    console.log(`Channel ${channelId} does not exist`)
    return
  }
  
  if (!channelUsers.get(channelId).has(ws)) {
    console.error("User not in channel, cannot send message")
    return
  }
  
  // Broadcast the message to all users in the channel
  broadcastToChannel(channelId, {
    event: "send_message", 
    userId,
    channelId,
    content,
    timestamp: Date.now()
  })
  
  console.log(`Message sent by ${userId} in channel ${channelId}: ${content}`)
}

export const user_typing = (payload: { event: string, userId: string, channelId: string, isTyping: boolean }, ws: WebSocket) => {
  const { event, userId, channelId, isTyping } = payload
  if (event !== "user_typing") return
  
  if (!userId || !channelId) {
    console.error("Missing userId or channelID")
    return
  }

  if (!channelUsers.has(channelId)) {
    console.log(`Channel ${channelId} does not exist`)
    return
  }
  
  if (!channelUsers.get(channelId).has(ws)) {
    console.error("User not in channel, cannot be typing")
    return
  }
  
  // Broadcast the typing status to all users in the channel
  broadcastToChannel(channelId, {
    event: "user_typing", 
    userId,
    channelId,
    isTyping
  })
}

export const createChannel = async (payload: { event: string, userId: string, cname: string }, ws: WebSocket) => {
  try {
    const { event, userId, cname } = payload
    if (event !== "create_channel") return
    
    if (!userId || !cname) {
      console.log("Missing user Id or channel name")
      return
    }
    
    const channelExists = await ChannelModel.findOne({ cname })
    if (channelExists) {
      console.log("Channel already exists")
      ws.send(JSON.stringify({
        event: "error",
        message: "Channel already exists"
      }))
      return
    }
    
    const newChannel = new ChannelModel({
      cname, 
      messages: [],
      users: [new mongoose.Types.ObjectId(userId)]
    })

    await newChannel.save()
    
    // Initialize the channel in memory
    channelUsers.set(cname, new Set())
    
    // Notify the creator that the channel was created
    ws.send(JSON.stringify({
      event: "channel_created",
      cname,
      createdBy: userId, 
      users: [userId]
    }))
    
    console.log(`Channel '${cname}' created by user '${userId}'`)
  } catch (error) {
    console.error("Error creating channel:", error)
    ws.send(JSON.stringify({
      event: "error",
      message: "Error creating channel"
    }))
  }
}

export const listChannel = async (payload: { event: string, userId: string }, ws: WebSocket) => {
  try {
    const { event, userId } = payload
    if (event !== "list_channel") return
    
    if (!userId) {
      console.log("No user selected")
      return
    }
    
    // Get all channels this user is a member of
    const channels = await ChannelModel.find({ users: userId })
    
    if (!channels || channels.length === 0) {
      console.log("No channels exist for that user")
      ws.send(JSON.stringify({
        event: "channel_list",
        channels: []
      }))
      return
    }
    
    ws.send(JSON.stringify({
      event: "channel_list",
      channels: channels.map(channel => ({ 
        id: channel.cname,
        name: channel.cname,
        users: channel.users 
      }))
    }))
    
    console.log(`Sent channel list to user ${userId}`)
  } catch (error) {
    console.error("Error listing channels:", error)
    ws.send(JSON.stringify({
      event: "error",
      message: "Error listing channels"
    }))
  }
}
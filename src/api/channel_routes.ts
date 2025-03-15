

import ChannelModel from "../db/channel_model.ts"
import { channelUsers, broadcastToChannel } from "../websocket/manager.ts"
import express from "express"
import mongoose from "mongoose"


interface CreateChannelPayload {
    event: string
    userId: string
    cname: string
}

interface ListChannelPayload {
    event: string
    userId: string
}



export const createChannel = async (payload: CreateChannelPayload, ws: WebSocket) => {
    try {
        const { event, userId, cname } = payload
        if (event != "create_channel") return
        if (!userId || !cname) {
            console.log("Missing user Id or channel name")
            return
        }
        const channelExists = await ChannelModel.findOne({ cname })
        if (channelExists) {
            console.log("Channel already exists")
            return
        }
        const newChannel = new ChannelModel({
            cname, 
            messages: [],
            users: [new mongoose.Types.ObjectId(userId)]
        })

        await newChannel.save()
        channelUsers.set(cname, new Set())
        broadcastToChannel(cname, {
            event: "channel_created",
            cname,
            createdBy: userId, 
            users: [userId]
        })
        console.log(`Channel '${cName}' created by user '${userId}'`)
    } catch (error) {
        console.log(error)
        console.error("Error creating channel:", error)
    }
}

export const listChannel = async (payload: ListChannelPayload, ws: WebSocket) => {
    const { event, userId } = payload
    if (event != "list_channel") return
    if (!userId) {
        console.log("No user selected")
        return
    }
    // no channels exist for that user 
    const channelExists = await ChannelModel.findOne({ users: userId })
    if (!channelExists) {
        console.log("No channels exist for that user")
        return
    }
    const allChannels = await ChannelModel.find({users: userId})
    ws.send(JSON.stringify({
        event: "channel_list",
        channel: allChannels.map(channel => ({ cname: channel.cname, users: channel.users }))
    }))
}



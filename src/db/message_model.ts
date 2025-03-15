import mongoose, { Schema, Document } from "mongoose"

interface Reaction {
    user: mongoose.Types.ObjectId
    emoji: string
}

interface Message extends Document {
    content: string, 
    sender: mongoose.Types.ObjectId
    channel: mongoose.Types.ObjectId
    timestamp: Date
    edited: boolean
    reactions: [{
        user: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
    }]
}

const MessageSchema = new Schema<Message>({
    content: { type: String, required: true },
    sender: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    channel: { type: mongoose.Types.ObjectId, ref: 'Channel', required: true },
    edited: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, emoji: String }],
    
})


const MessageModel = mongoose.model<Message>('Message', MessageSchema)
export default MessageModel
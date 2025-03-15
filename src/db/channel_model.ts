import { timeStamp } from "console"
import mongoose, { Schema, Document } from "mongoose"

interface Channel extends Document {
    cname: string
    messages: mongoose.Types.ObjectId[]
    users: mongoose.Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
}

const ChannelSchema = new Schema<Channel>({
    cname: { type: String, required: true },
    messages: [{ type: mongoose.Types.ObjectId, ref: 'Message' }],
    users: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    createdAt: {type: Date, default: Date.now()}
}, { timestamps: true })

const ChannelModel = mongoose.model<Channel>('Channel', ChannelSchema)
export default ChannelModel
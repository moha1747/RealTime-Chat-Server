import mongoose, { Schema, Document } from "mongoose"

interface User extends Document {
    username:   string
    email:      string
    password:   string
    channels: mongoose.Types.ObjectId[]
}

const UserSchema = new Schema<User>({
    username:  { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    channels: [{
        type: mongoose.Types.ObjectId, ref: 'Channel', default: []
     }]
})

const UserModel = mongoose.models.User || mongoose.model<User>('User', UserSchema)
export default UserModel

import { IGroupChat } from "@/types/groupChat.types";
import mongoose from "mongoose";

const groupChatSchema = new mongoose.Schema<IGroupChat>({
    type: {
        type: String,
        enum: ["TEXT", "IMAGE", "VIDEO", "PDF"],
        default: "TEXT"
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    seen: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, {timestamps: true})

export const groupChatModel = mongoose.models.GroupChat || mongoose.model<IGroupChat>("GroupChat", groupChatSchema)
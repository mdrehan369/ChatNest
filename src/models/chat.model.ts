import { IChat } from "@/types/chat.types";
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema<IChat>({
    type: {
        type: String,
        enum: ["TEXT", "IMAGE", "VIDEO", "PDF"],
        default: "TEXT"
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

export const chatModel = mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);

import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
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
    }
}, {timestamps: true})

export const chatModel = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

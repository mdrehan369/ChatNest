import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId, // Request Sender
        ref: "User"
    },
    acceptor: {
        type: mongoose.Schema.Types.ObjectId, // Request Acceptor
        ref: "User"
    },
    accepted: {
        type: Boolean,
        default: false
    }
})

export const friendModel = mongoose.models.friends || mongoose.model("Friend", friendSchema);

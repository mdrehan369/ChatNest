import { IFriend } from "@/types/friend.types";
import mongoose from "mongoose";

const friendSchema = new mongoose.Schema<IFriend>({
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

export const friendModel = mongoose.models.Friend || mongoose.model<IFriend>("Friend", friendSchema);

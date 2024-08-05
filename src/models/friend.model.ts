import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId, // Request Sender
        ref: "User"
    },
    accepter: {
        type: mongoose.Schema.Types.ObjectId, // Request Accepted
        ref: "User"
    }
})

export const friendModel = mongoose.model("Friend", friendSchema);

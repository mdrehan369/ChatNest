import mongoose from "mongoose";

export interface IFriend {
    sender: mongoose.Schema.Types.ObjectId,
    acceptor: mongoose.Schema.Types.ObjectId,
    accepted: boolean
}
import mongoose from "mongoose";

export enum ChatType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    PDF = "PDF",
}

export interface IChat {
    type?: ChatType,
    content: string,
    from: mongoose.Schema.Types.ObjectId,
    to: mongoose.Schema.Types.ObjectId,
    seen?: boolean
}
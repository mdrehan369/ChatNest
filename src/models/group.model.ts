import { IGroup } from "@/types/group.types";
import mongoose from "mongoose";

const groupSchema = new mongoose.Schema<IGroup>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    admins: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    image: {
        url: String,
        publicId: String
    }
}, {timestamps: true})

export const groupModel = mongoose.models.Group || mongoose.model<IGroup>("Group", groupSchema)
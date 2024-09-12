import { IPreferences } from "@/types/preferences.types";
import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema<IPreferences>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    theme: {
        type: String,
        enum: ["LIGHT", "DARK"],
        default: "LIGHT"
    },
    wallpapers: [
        {
            to: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            image: {
                url: String,
                publicId: String
            }
        }
    ]
})

export const preferencesModel = mongoose.models.Preferences || mongoose.model<IPreferences>("Preferences", preferencesSchema)


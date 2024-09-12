import mongoose from "mongoose";

export enum Theme {
    LIGHT = "LIGHT",
    DARK = "DARK"
}

export type Wallpaper = {
    to: mongoose.Schema.Types.ObjectId,
    image: {
        url: string,
        publicId: string
    }
}

export interface IPreferences {
    user: mongoose.Schema.Types.ObjectId,
    theme?: Theme,
    wallpapers: Array<Wallpaper>
}
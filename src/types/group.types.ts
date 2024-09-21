import mongoose from "mongoose"


export interface IGroup {
    name: string
    description?: string,
    createdBy: mongoose.Schema.Types.ObjectId
    admins: Array<mongoose.Schema.Types.ObjectId>
    members: Array<mongoose.Schema.Types.ObjectId>
    image?: {
        url: string
        publicId: string
    }
}
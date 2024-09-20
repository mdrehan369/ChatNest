import mongoose from "mongoose"
import { ChatType } from "./chat.types"

export interface IGroupChat {
    type?: ChatType
    group: mongoose.Schema.Types.ObjectId
    from: mongoose.Schema.Types.ObjectId
    content: string
    seen?: Array<boolean>
}
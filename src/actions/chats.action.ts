"use server"

import { chatModel } from "@/models/chat.model"
import { IChat } from "@/types/chat.types"
import { HydratedDocument } from "mongoose"

export const createChat = async (chat: IChat) => {
    try {
        const createdChat: HydratedDocument<IChat> = await chatModel.create(chat)
        return chat.content
    } catch (err) {
        console.log(err)
        return null
    }
}
import { CustomResponse } from "@/helpers/customResponse";
import { groupModel } from "@/models/group.model";
import { groupChatModel } from "@/models/groupChat.model";
import { ChatType } from "@/types/chat.types";
import { IGroup } from "@/types/group.types";
import { IGroupChat } from "@/types/groupChat.types";
import mongoose, { HydratedDocument } from "mongoose";
import { NextRequest } from "next/server";

// TODO: Assign more security checks in functions

type RequestBody = {
    type: ChatType
    group: mongoose.Schema.Types.ObjectId
    from: mongoose.Schema.Types.ObjectId
    content: string
    id: mongoose.Schema.Types.ObjectId // Chat ID
}

export async function GET(req: NextRequest) {
    try {
        const id = req.nextUrl.searchParams.get("groupId")
        const group: HydratedDocument<IGroup> | null = await groupModel.findById(id)
        if(!group) return CustomResponse(404, {}, "No Group Found")
        const chats: Array<HydratedDocument<IGroupChat>> = await groupChatModel.find({group: id}).exec()
        return CustomResponse(201, chats, "Fetched")
    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {message: err.message}, "Server Error")
    }
}

export async function POST(req: NextRequest) {
    try {
        const { type, group, from, content }: RequestBody = await req.json()
        await groupChatModel.create({
            type,
            group,
            from,
            content,
            seen: []
        })
        return CustomResponse(201, {}, "Created")
    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {message: err.message}, "Server Error")
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id }: RequestBody = await req.json()
        await groupChatModel.findByIdAndDelete(id)
        return CustomResponse(201, {}, "Deleted")
    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {message: err.message}, "Server Error")
    }
}
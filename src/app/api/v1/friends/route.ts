import { friendModel } from "@/models/friend.model";
import { CustomResponse } from "@/helpers/customResponse";
import { connect } from "@/helpers/connectDB";
import { NextRequest } from "next/server";
import { chatModel } from "@/models/chat.model";
import { HydratedDocument } from "mongoose";
import { IFriend } from "@/types/friend.types";
import { getDecodedToken } from "@/helpers/fetchUser";

connect()

// sends friend request
export async function POST(req: NextRequest) {
    try {

        const body = await req.json()
        let sender = body.sender
        const acceptor = body.acceptor

        if(!sender) {
            sender = await getDecodedToken()
            sender = sender.id
        }

        if(!sender || !acceptor) return CustomResponse(400, {}, "Some fields are missing")

        const areFriends: HydratedDocument<IFriend> = await friendModel.findOne({sender, acceptor}).exec()

        if(areFriends) return CustomResponse(403, {}, "Already friends")

        await friendModel.create({
            sender,
            acceptor,
        })

        return CustomResponse(201, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {"error": err.message}, "Server Error")
    }
}

// It accepts friend request
export async function GET(req: NextRequest) {
    try {

        const sender = req.nextUrl.searchParams.get("sender")
        const acceptor: any = await getDecodedToken()

        if(!sender || !acceptor) return CustomResponse(400, {}, "Some fields are missing")
        
        const coll: HydratedDocument<IFriend> = await friendModel.findOne({sender, acceptor: acceptor.id}).exec()
        if(!coll) return CustomResponse(400, {}, "No collection found")

        coll.accepted = true
        await coll.save()

        return CustomResponse(200, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {"error": err.message}, "Server Error")
    }
}

// unfriends
export async function DELETE(req: NextRequest) {
    try {

        const acceptor = req.nextUrl.searchParams.get("acceptor")
        const sender: any = getDecodedToken()

        if(!sender || !acceptor) return CustomResponse(400, {}, "Some fields are missing")
        
        const coll: HydratedDocument<IFriend> = await friendModel.findOne({
            $or: [{ sender: sender.id, acceptor }, { acceptor: sender.id, sender: acceptor }]
        }).exec()
        if(!coll) return CustomResponse(400, {}, "No collection found")

        await coll.deleteOne()
        await chatModel.deleteMany({
            $or: [
                {from: sender.id, to: acceptor},
                {from: acceptor, to: sender.id}
            ]
        })

        return CustomResponse(200, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {"error": err.message}, "Server Error")
    }
}
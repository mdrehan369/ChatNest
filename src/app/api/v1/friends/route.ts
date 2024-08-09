import { friendModel } from "@/models/friend.model";
import { CustomResponse } from "@/helpers/customResponse";
import { connect } from "@/helpers/connectDB";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken"

connect()

export async function POST(req: NextRequest) {
    try {

        const body = await req.json()
        let sender = body.sender
        const acceptor = body.acceptor

        if(!sender) {
            const token = req.cookies.get("accessToken")?.value
            sender = jwt.verify(token!, process.env.JWT_SECRET_KEY!)
            sender = sender.id
        }

        if(!sender || !acceptor) return CustomResponse(400, {}, "Some fields are missing")

        const areFriends = await friendModel.findOne({sender, acceptor})

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

export async function GET(req: NextRequest) {
    try {

        const token = req.cookies.get("accessToken")?.value
        const sender = req.nextUrl.searchParams.get("sender")
        const acceptor: any = jwt.verify(token!, process.env.JWT_SECRET_KEY!)

        if(!sender || !acceptor) return CustomResponse(400, {}, "Some fields are missing")
        
        const coll: any = await friendModel.findOne({sender, acceptor: acceptor.id})
        if(!coll) return CustomResponse(400, {}, "No collection found")

        coll.accepted = true
        await coll.save()

        return CustomResponse(200, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {"error": err.message}, "Server Error")
    }
}

export async function DELETE(req: NextRequest) {
    try {

        const token = req.cookies.get("accessToken")?.value
        const acceptor = req.nextUrl.searchParams.get("acceptor")
        const sender: any = jwt.verify(token!, process.env.JWT_SECRET_KEY!)

        if(!sender || !acceptor) return CustomResponse(400, {}, "Some fields are missing")
        
        const coll: any = await friendModel.findOne({
            $or: [{ sender: sender.id, acceptor }, { acceptor: sender.id, sender: acceptor }]
        })
        if(!coll) return CustomResponse(400, {}, "No collection found")

        await coll.deleteOne()

        return CustomResponse(200, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {"error": err.message}, "Server Error")
    }
}
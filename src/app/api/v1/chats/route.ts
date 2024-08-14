import { connect } from "@/helpers/connectDB"
import { userModel } from "@/models/user.model"
import { NextRequest } from "next/server"
import { CustomResponse } from "@/helpers/customResponse"
import { chatModel } from "@/models/chat.model"
import jwt from "jsonwebtoken"

connect()

function generateRoomId(from: string, to: string): string {

    let id = ""
    for (let i = 0; i < from.length; i++) {
        id += String.fromCharCode(97 + (from.charCodeAt(i) - 97 + to.charCodeAt(i) - 97) % 26)
    }
    return id
}

export async function GET(req: NextRequest) {
    try {

        const userId = req.nextUrl.searchParams.get("user")
        if (!userId) return CustomResponse(400, {}, "No user id found")
        const user = await userModel.findById(userId)
        if (!user) return CustomResponse(400, {}, "No user found")
        const decodedToken: any = jwt.verify(req.cookies.get("accessToken")?.value!, process.env.JWT_SECRET_KEY!)

        const chats = await chatModel.find({
            $or: [
                { from: user._id, to: decodedToken.id },
                { from: decodedToken.id, to: user._id },
            ]
        }).sort("createdAt")

        const roomId = generateRoomId(decodedToken.id, user._id.toString())

        return CustomResponse(200, { chats, user, roomId }, "Fetched")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, { error: err.message }, "Server Error")
    }
}

type Chats = {
    from: string,
    to: string,
    content: string,
    createdAt: string | undefined
}

export async function POST(req: NextRequest) {
    try {

        const body = await req.json()
        const chats: [Chats] = body.chats
        if (!chats.length) return CustomResponse(400, {}, "No chats given")

        await chatModel.insertMany(chats)

        return CustomResponse(201, {}, "Chats Saved")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, { error: err.message }, "Server Error")
    }
}

// Deletes all chats if selected chats parameter is ommited
export async function DELETE(req: NextRequest) {
    try {

        const user = req.nextUrl.searchParams.get("user")
        const loggeduser: any = jwt.verify(req.cookies.get("accessToken")?.value!, process.env.JWT_SECRET_KEY!)

        const chats: string | null= req.nextUrl.searchParams.get("chats")
        if (chats) {

            let chatsArr = chats.split(',').filter((chat: string) => chat !== "")
            await chatModel.deleteMany({ "_id": { "$in": chatsArr } })
            return CustomResponse(200, {}, "Messages deleted successfully!")

        } else {

            if (!user || !loggeduser) return CustomResponse(404, {}, "Some fields are missing")
            await chatModel.deleteMany({
                $or: [
                    { from: user, to: loggeduser.id },
                    { from: loggeduser.id, to: user }
                ]
            })

            return CustomResponse(200, {}, "Deleted successfully")
        }

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, { error: err.message }, "Server Error")
    }
}
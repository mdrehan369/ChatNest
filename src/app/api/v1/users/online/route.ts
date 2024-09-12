import { CustomResponse } from "@/helpers/customResponse";
import jwt from "jsonwebtoken"
import { userModel } from "@/models/user.model";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
    try {
        
        const decodedToken: any = jwt.verify(req.cookies.get("accessToken")?.value!, process.env.JWT_SECRET_KEY!)
        const user: any = await userModel.findById(decodedToken.id)
        user.isOnline = false
        await user.save()

        return CustomResponse(200, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {}, "Server Error")
    }
}
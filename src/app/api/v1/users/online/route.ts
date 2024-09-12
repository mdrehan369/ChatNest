import { CustomResponse } from "@/helpers/customResponse";
import jwt from "jsonwebtoken"
import { userModel } from "@/models/user.model";
import { NextRequest } from "next/server";
import { HydratedDocument } from "mongoose";
import { IUser } from "@/types/user.types";


export async function GET(req: NextRequest) {
    try {
        
        const decodedToken: any = jwt.verify(req.cookies.get("accessToken")?.value!, process.env.JWT_SECRET_KEY!)
        const user: HydratedDocument<IUser> = await userModel.findById(decodedToken.id).exec()
        user.isOnline = false
        await user.save()

        return CustomResponse(200, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {}, "Server Error")
    }
}
import { CustomResponse } from "@/helpers/customResponse";
import { userModel } from "@/models/user.model";
import { NextRequest } from "next/server";
import { HydratedDocument } from "mongoose";
import { IUser, JwtDecodedToken } from "@/types/user.types";
import { getDecodedToken } from "@/helpers/fetchUser";


export async function GET(req: NextRequest) {
    try {
        
        const decodedToken: JwtDecodedToken = await getDecodedToken()
        const user: HydratedDocument<IUser> = await userModel.findById(decodedToken.id).exec()
        user.isOnline = false
        await user.save()

        return CustomResponse(200, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {}, "Server Error")
    }
}
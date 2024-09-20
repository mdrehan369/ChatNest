import { CustomResponse } from "@/helpers/customResponse";
import { userModel } from "@/models/user.model";
import { NextRequest } from "next/server";
import { HydratedDocument } from "mongoose";
import { IUser } from "@/types/user.types";


export async function GET(req: NextRequest) {
    try {
        
        const userId = req.nextUrl.searchParams.get("userId")
        const user: HydratedDocument<IUser> = await userModel.findById(userId).exec()
        if(!user) throw Error("No User Found")

        user.isOnline = false
        await user.save()

        return CustomResponse(200, {}, "Done")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {}, "Server Error")
    }
}
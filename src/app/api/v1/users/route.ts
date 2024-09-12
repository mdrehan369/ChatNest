import { NextRequest } from "next/server";
import { connect } from "@/helpers/connectDB";
import { CustomResponse } from "@/helpers/customResponse";
import { userModel } from "@/models/user.model";
import jwt from "jsonwebtoken";
import { preferencesModel } from "@/models/preferences.model";
import { HydratedDocument } from "mongoose";
import { IUser } from "@/types/user.types";
import { IPreferences } from "@/types/preferences.types";

connect()

export async function GET(req: NextRequest) {
    try {
        if(req.cookies.get("accessToken")?.value) {
            const decodedToken: any = jwt.verify(req.cookies.get("accessToken")?.value!, process.env.JWT_SECRET_KEY!)
            const user: HydratedDocument<IUser> = await userModel.findById(decodedToken.id).select("-password").exec()
            const preferences: HydratedDocument<IPreferences> = await preferencesModel.findOne({user: user._id}).exec()
            user.isOnline = true
            await user.save()
            if(user) return CustomResponse(200, {"user": user, preferences}, "User fetched successfully")
            else return CustomResponse(404, {success: false}, "User not found")
        } else return CustomResponse(400, {success: false}, "No active session")
    } catch (err: any) {
        return CustomResponse(500, {error: err.message}, "Error in get");
    }
}
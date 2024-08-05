import { NextRequest } from "next/server";
import { connect } from "@/helpers/connectDB";
import { CustomResponse } from "@/helpers/customResponse";
import { userModel } from "@/models/user.model";
import jwt from "jsonwebtoken";

connect()

export async function GET(req: NextRequest) {
    try {
        if(req.cookies.get("accessToken")?.value) {
            const decodedToken: any = jwt.verify(req.cookies.get("accessToken")?.value!, process.env.JWT_SECRET_KEY!)
            const user = await userModel.findById(decodedToken.id).select("-password")
            if(user) return CustomResponse(200, {"user": user}, "User fetched successfully")
            else return CustomResponse(404, {success: false}, "User not found")
        } else return CustomResponse(400, {success: false}, "No active session")
    } catch (err: any) {
        return CustomResponse(500, {error: err.message}, "Error in get");
    }
}
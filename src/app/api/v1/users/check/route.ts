import { CustomResponse } from "@/helpers/customResponse";
import { NextRequest } from "next/server";
import { connect } from "@/helpers/connectDB";
import { userModel } from "@/models/user.model";

connect();

export async function GET(req: NextRequest) {
    try {
        const username = req.nextUrl.searchParams.get("username")
        const email = req.nextUrl.searchParams.get("email")

        const returnObj = {
            username: true,
            email: true
        }
    
        if(username) {
            const user = await userModel.findOne({username})
            if(user) returnObj.username = false
        }
    
        if(email) {
            const user = await userModel.findOne({email})
            if(user) returnObj.email = false
        }
    
        return CustomResponse(200, returnObj, "Fetched")
    } catch (err: any) {
        return CustomResponse(500, {error: err.message || ""}, "Fetched")
    }
}
import { NextRequest } from "next/server";
import { userModel } from "@/models/user.model";
import { connect } from "@/helpers/connectDB";
import { CustomResponse } from "@/helpers/customResponse";
import { cookies } from "next/headers";

connect();

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        const { usernameOrEmail, password } = body;

        if([usernameOrEmail, password].some(val => val?.trim() == "")) return CustomResponse(400, {
            "title": "Some fields are missing!",
            "message": "Please fill all the required fields"
        }, "Some fields are missing")

        const user = await userModel.findOne({$or: [{username: usernameOrEmail}, {email: usernameOrEmail}]})
        if(!user) return CustomResponse(403, {
            "title": "No User Found!",
            "message": "Please enter the correct username or email or signup"
        }, "User does not exists")

        const isValidPass = await user.verifyPassword(password);
        if(!isValidPass) return CustomResponse(400, {
            "title": "Wrong Password!",
            "message": "Please fill the correct password"
        }, "Invalid password")

        const token = user.generateAccessToken();
        cookies().set("accessToken", token)
        return CustomResponse(200, {user}, "User logged in successfully")

    } catch (err: any) {
        console.log(err.message)
        return CustomResponse(500, {error: err.message}, "Error")
    }
}

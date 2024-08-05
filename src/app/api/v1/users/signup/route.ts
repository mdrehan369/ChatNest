import { NextRequest } from "next/server";
import { userModel } from "@/models/user.model";
import { connect } from "@/helpers/connectDB";
import { CustomResponse } from "@/helpers/customResponse";

connect();

export async function POST(req: NextRequest) {

    try {
        const { username, email, password, name } = await req.json();

        if([username, email, password, name].some(val => val.trim() == "")) return CustomResponse(400, {}, "Some fields are missing")
        const user = await userModel.findOne({$or: [{username}, {email}]})
        if(user) return CustomResponse(403, {}, "User already exists")

        const newUser = await userModel.create({
            username,
            password,
            email,
            name
        });

        const token = newUser.generateAccessToken();
        req.cookies.set("accessToken", token)
        return CustomResponse(201, {user: newUser}, "User created successfully")

    } catch (err: any) {
        return CustomResponse(500, {error: err.message}, "Error")
    }
}
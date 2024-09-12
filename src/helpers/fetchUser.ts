import { userModel } from "@/models/user.model";
import { IUser, JwtDecodedToken } from "@/types/user.types";
import jwt from "jsonwebtoken"
import { HydratedDocument } from "mongoose";
import { cookies } from "next/headers";

export async function fetchUser(): Promise<HydratedDocument<IUser>> {
    try {

        const token = cookies().get("accessToken")?.value || ""
        if (token == "") throw new Error("No accesstoken found")

        const decodedToken: JwtDecodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtDecodedToken
        const user: HydratedDocument<IUser> = await userModel.findById(decodedToken.id).exec()

        if (!user) throw new Error("No user found")
        return user

    } catch (err: any) {
        console.log(err)
        throw new Error(err.message)
    }
}

export async function getDecodedToken(): Promise<JwtDecodedToken> {
    const token = cookies().get("accessToken")?.value || ""
    if (token == "") throw new Error("No accesstoken found")

    const decodedToken: JwtDecodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtDecodedToken
    return decodedToken
}
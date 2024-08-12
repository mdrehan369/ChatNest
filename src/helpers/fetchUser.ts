import { userModel } from "@/models/user.model";
import jwt from "jsonwebtoken"

export async function fetchUser(token: string) {
    try {

        if(token == "") throw new Error("No accesstoken found")

        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET_KEY!)
        const user = await userModel.findById(decodedToken.id)

        if(!user) throw new Error("No user found")

        return user

    } catch (err: any) {
        console.log(err)
        throw new Error(err.message)
    }
}
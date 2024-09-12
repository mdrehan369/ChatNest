'use server'

import { Data } from "@/app/(main)/profile/page"
import { userModel } from "@/models/user.model"
import { UserProfileData } from "@/types/user.types"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export const getUser = async (userId: string) => {
    try {
        if(userId.length === 0) return null
        const response = await userModel.findById(userId).select("-password")
        if(!response) return null

        const user: UserProfileData = {
            username: response.username,
            email: response.email,
            name: response.name,
            isOnline: response.isOnline,
            profile_pic: response.profile_pic,
            bio: response.bio
        }
        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateUser = async (data: Data) => {
    try {
        const token = cookies().get("accessToken")?.value
        if(!token) {
            console.log("No active session")
            return null
        }
        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET_KEY!)
        await userModel.findByIdAndUpdate(decodedToken.id!, {...data})
        return true
    } catch (err) {
        console.log(err)
        return null
    }
}
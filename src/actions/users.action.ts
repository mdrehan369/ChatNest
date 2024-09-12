'use server'

import { Data } from "@/app/(main)/profile/page"
import { userModel } from "@/models/user.model"
import { IUser, JwtDecodedToken, UserProfileData } from "@/types/user.types"
import { getDecodedToken } from "@/helpers/fetchUser"

export const getUser = async (userId: string): Promise<IUser | null | undefined> => {
    try {
        if(userId.length === 0) return null
        const user: IUser = await userModel.findById(userId).select("-password").exec()
        if(!user) return null
        return user
    } catch (err) {
        console.log(err)
    }
}

export const updateUser = async (data: Data) => {
    try {
        const decodedToken: JwtDecodedToken = await getDecodedToken()
        await userModel.findByIdAndUpdate(decodedToken.id!, {...data})
        return true
    } catch (err) {
        console.log(err)
        return null
    }
}
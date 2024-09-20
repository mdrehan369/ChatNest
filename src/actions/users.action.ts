'use server'

import { Data } from "@/app/(main)/profile/page"
import { userModel } from "@/models/user.model"
import { IUser, JwtDecodedToken } from "@/types/user.types"
import { fetchUser, getDecodedToken } from "@/helpers/fetchUser"
import { HydratedDocument } from "mongoose"
import chalk from "chalk"

export const getUser = async (userId: string): Promise<string | null> => {
    try {
        if(userId.length === 0) return null
        const user: HydratedDocument<IUser> = await userModel.findById(userId).select("-password").exec()
        if(!user) return null
        return JSON.stringify(user)
    } catch (err) {
        console.log(err)
        return null
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

export const test = async () => {
    console.log(chalk.magenta("leaved!"))
}

export const markOnline = async () => {
    try {
        const user = await fetchUser()
        user.isOnline = true
        await user.save()
    } catch (err) {
        console.log(err)
        return null
    }
}
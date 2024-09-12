import jwt from "jsonwebtoken"
import { Model } from "mongoose"

export interface IUser {
    username: string,
    email: string,
    name: string,
    password: string,
    profile_pic?: string,
    bio?: string,
    googleId?: string,
    githubId?: string,
    isOnline?: boolean,
}

export interface IUserMethods {
    generateAccessToken(): string,
    verifyAccessToken(token: string): jwt.JwtPayload | null | string,
    verifyPassword(password: string): Promise<Boolean>
}

export type UserModel = Model<IUser, {}, IUserMethods>

export type UserProfileData = {
    username: string,
    email: string,
    profile_pic?: string,
    name: string,
    isOnline: boolean,
    bio: string
}
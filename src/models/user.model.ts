import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, IUserMethods, UserModel } from "@/types/user.types";

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
    username: {
        type: String,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    profile_pic: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    googleId: {
        type: String
    },
    githubId: {
        type: String
    },
    isOnline: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

userSchema.pre("save", async function(next) {
    if(this.isModified("password")) {
        this.password = await bcryptjs.hash(this.password, 10);
    }
    next()
})

userSchema.methods.generateAccessToken = function (): string {
    return jwt.sign({
        "id": this._id,
        "username": this.username
    },
    process.env.JWT_SECRET_KEY || "shhhhh",
    {
        expiresIn: "1d"
    })
}

userSchema.methods.verifyAccessToken = function (token: string): jwt.JwtPayload | null | string {
    if(jwt.verify(token, process.env.JWT_SECRET_KEY || "")) {
        const decodedToken = jwt.decode(token);
        return decodedToken;
    } else {
        return null;
    }
}

userSchema.methods.verifyPassword = async function (password: string) : Promise<Boolean> {
    return await bcryptjs.compare(password, this.password);
}

export const userModel = mongoose.models.User || mongoose.model<IUser, UserModel>("User", userSchema);

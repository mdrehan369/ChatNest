import { NextRequest } from "next/server";
import { CustomResponse } from "@/helpers/customResponse";
import { fetchUser } from "@/helpers/fetchUser";
import { preferencesModel } from "@/models/preferences.model";
import { uploadFile } from "@/helpers/upload";
import jwt from "jsonwebtoken"
import { deleteImage } from "@/helpers/cloudinary";
import mongoose, { HydratedDocument } from "mongoose";
import { IPreferences } from "@/types/preferences.types";

// Updates the wallpaper
// upload via formdata with name 'file'
export async function POST(req: NextRequest) {

    try {
        const formData = await req.formData()
        const user: any = await fetchUser(req.cookies.get("accessToken")?.value!)
        let userPreference: HydratedDocument<IPreferences> = await preferencesModel.findOne({ user: user._id }).exec()

        if (!userPreference) {
            userPreference = await preferencesModel.create({ user: user._id })
        }

        const data = await uploadFile(formData)

        if (data.success) {
            for (let wallpaper of userPreference.wallpapers) {
                if (wallpaper.to == new mongoose.Schema.Types.ObjectId(formData.get("to")?.toString() || "")) {

                    await deleteImage(wallpaper.image.publicId)

                    wallpaper.image = {
                        url: data.data?.url || "",
                        publicId: data.data?.publicId || ""
                    }

                    await userPreference.save()
                    return CustomResponse(201, {url: data.data?.url}, "Saved")
                }
            }
            userPreference.wallpapers.push({
                to: new mongoose.Schema.Types.ObjectId(formData.get("to")?.toString()!),
                image: {
                    url: data.data?.url || "",
                    publicId: data.data?.publicId || ""
                }
            })

            await userPreference.save()
            return CustomResponse(201, {url: data.data?.url}, "Saved")
        } else {
            return CustomResponse(500, {}, "Error while uploading")
        }
    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, { error: err.message }, "Server Error")
    }

}


export async function GET(req: NextRequest) {
    try {
        const user: any = jwt.verify(req.cookies.get("accessToken")?.value!, process.env.JWT_SECRET_KEY!)
        const preference: HydratedDocument<IPreferences> = await preferencesModel.findOne({ user: user._id }).exec()
        return CustomResponse(200, preference, "Fetched")
    } catch (err: any) {
        console.log(err)
        return CustomResponse
    }
}
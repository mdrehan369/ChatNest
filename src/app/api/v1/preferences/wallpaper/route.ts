import { CustomResponse } from "@/helpers/customResponse"
import { NextRequest } from "next/server"
import { preferencesModel } from "@/models/preferences.model"
import { deleteImage } from "@/helpers/cloudinary"
import { getDecodedToken } from "@/helpers/fetchUser"
import { JwtDecodedToken } from "@/types/user.types"


export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("user")
        const loggedUser: JwtDecodedToken = await getDecodedToken()

        if(!loggedUser || !userId) return CustomResponse(400, {}, "Some fields are missing")

        const preference = await preferencesModel.findOne({user: loggedUser.id})
        
        if(!preference) return CustomResponse(404, {}, "Preference not found")

        for(let wallpaper of preference.wallpapers) {
            if(wallpaper.to == userId) return CustomResponse(200, wallpaper.image.url, "Fetched")
        }

        return CustomResponse(200, {}, "No wallpaper found for the user")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {error: err.message}, "Server Error")
    }
}

export async function DELETE(req: NextRequest) {
    try {

        const userId = req.nextUrl.searchParams.get("user")
        const loggedUser: JwtDecodedToken = await getDecodedToken()

        if(!loggedUser || !userId) return CustomResponse(400, {}, "Some fields are missing")

        const preference = await preferencesModel.findOne({user: loggedUser.id})
        if(!preference) return CustomResponse(404, {}, "Preferences not found")

        for(let wallpaper of preference.wallpapers) {
            if(wallpaper.to == userId) {
                await deleteImage(wallpaper.image.publicId)
                return CustomResponse(200, {}, "Deleted")
            }
        }

        return CustomResponse(300, {}, "No wallpaper was there to delete")

    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {error: err.message}, "Server Error")
    }
}
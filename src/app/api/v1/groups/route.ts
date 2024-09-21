import { connect } from "@/helpers/connectDB";
import { CustomResponse } from "@/helpers/customResponse";
import { fetchUser } from "@/helpers/fetchUser";
import { groupModel } from "@/models/group.model";
import { IGroup } from "@/types/group.types";
import mongoose, { HydratedDocument } from "mongoose";
import { NextRequest } from "next/server";

type RequestBody = {
    members: Array<mongoose.Schema.Types.ObjectId>
    name: string
    description?: string
    image?: {
        url: string,
        public_id: string
    }
    id?: mongoose.Schema.Types.ObjectId
}

connect()

// Creates a group
export async function POST(req: NextRequest) {
    try {
        const { name, members, description, image } : RequestBody = await req.json()
        if(members.length == 0) return CustomResponse(400, {}, "No members")
        
        const user = await fetchUser()

        const newGroup: HydratedDocument<IGroup> = await groupModel.create({
            name,
            members,
            description,
            image,
            createdBy: user._id,
            admins: [user._id]
        })

        if(!newGroup) throw new Error("Some error happened while creating group")

        return CustomResponse(201, newGroup, "Group created successfully!")
    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {error: err.message}, "Server Error")
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await fetchUser()
        const groups: Array<HydratedDocument<IGroup>> = await groupModel.aggregate([
            {
              '$match': {
                '$expr': {
                  '$in': [
                    new mongoose.Types.ObjectId(user._id), '$members'
                  ]
                }
              }
            }
          ])
        return CustomResponse(200, groups, "Groups Fetched Successfully")
    } catch (err: any) {
        console.log(err)
        return CustomResponse(500, {message: err.message}, "Server Error")
    }
}

export async function PUT(req: NextRequest) {
    try {
      const { name, description, image, id }: RequestBody = await req.json()
      const group: HydratedDocument<IGroup> = await groupModel.findById(id).exec()

      if(!group) return CustomResponse(404, {}, "No Group Found")

      await groupModel.findByIdAndUpdate(id, { name, description, image })

      return CustomResponse(200, {}, "Updated Successfully")

    } catch (err: any) {
      console.log(err)
      return CustomResponse(500, {message: err.message}, "Server Error")
    }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id")
    if(!id) return CustomResponse(400, {}, "No ID Found")
    const group: HydratedDocument<IGroup> = await groupModel.findById(id).exec()

    if(!group) return CustomResponse(404, {}, "No Group Found")

    await groupModel.findByIdAndDelete(id)

    return CustomResponse(200, {}, "Deleted Successfully")

  } catch (err: any) {
    console.log(err)
    return CustomResponse(500, {message: err.message}, "Server Error")
  }
}


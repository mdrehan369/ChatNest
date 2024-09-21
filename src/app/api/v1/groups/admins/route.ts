import { CustomResponse } from "@/helpers/customResponse";
import { groupModel } from "@/models/group.model";
import { IGroup } from "@/types/group.types";
import mongoose, { HydratedDocument } from "mongoose";
import { NextRequest } from "next/server";

type RequestBody = {
  memberId: mongoose.Schema.Types.ObjectId;
  groupId: mongoose.Schema.Types.ObjectId;
};

export async function POST(req: NextRequest) {
  try {
    const { memberId, groupId }: RequestBody = await req.json();
    const group: HydratedDocument<IGroup> = await groupModel
      .findById(groupId)
      .exec();
    if (!group) return CustomResponse(404, {}, "No Group Found");
    group.admins.push(memberId);
    await group.save();
    return CustomResponse(201, {}, "Added")
  } catch (err: any) {
    console.log(err);
    return CustomResponse(500, { message: err.message }, "Server Error");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { memberId, groupId }: RequestBody = await req.json();
    const group: HydratedDocument<IGroup> = await groupModel
      .findById(groupId)
      .exec();
    if (!group) return CustomResponse(404, {}, "No Group Found");
    group.admins = group.admins.filter((member) => {
        if(member != memberId) return member
    });
    await group.save();
    return CustomResponse(200, {}, "Deleted")
  } catch (err: any) {
    console.log(err);
    return CustomResponse(500, { message: err.message }, "Server Error");
  }
}


export async function GET(req: NextRequest) {
    try {
      const { groupId }: RequestBody = await req.json();
      const group: HydratedDocument<IGroup> = await groupModel
        .findById(groupId)
        .exec();
      if (!group) return CustomResponse(404, {}, "No Group Found");
      return CustomResponse(200, group.admins, "Fetched")
    } catch (err: any) {
      console.log(err);
      return CustomResponse(500, { message: err.message }, "Server Error");
    }
  }
import { NextRequest } from "next/server";
import { connect } from "@/helpers/connectDB";
import { CustomResponse } from "@/helpers/customResponse";
import { cookies } from "next/headers";

connect()

export async function GET(req: NextRequest) {
    try {
        cookies().delete("accessToken")
        return CustomResponse(200, {}, "Logged out successfully")
    } catch (err: any) {
        return CustomResponse(500, {error: err.message}, "Error")
    }
}
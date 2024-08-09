"use server"

import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/helpers/customResponse";


export async function middleware(req: NextRequest) {
    try {

        const token = req.cookies.get("accessToken")?.value
        if(!token) return CustomResponse(404, {success: false}, "sign in first")

        const response = NextResponse.next();
        return response;
        
    } catch (err: any) {
        return CustomResponse(500, {error: err.message}, "Error in middleware")
    }
}

export const config = {
    matcher: ['/api/...']
}
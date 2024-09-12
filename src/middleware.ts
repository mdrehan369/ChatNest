"use server"

import { NextRequest, NextResponse } from "next/server";
import { CustomResponse } from "@/helpers/customResponse";

export async function middleware(req: NextRequest) {
    try {

        const token = req.cookies.get("accessToken")?.value
        if(!token) return NextResponse.redirect(new URL("/login", req.nextUrl))

        const response = NextResponse.next();
        return response;
        
    } catch (err: any) {
        return CustomResponse(500, {error: err.message}, "Error in middleware")
    }
}

export const config = {
    matcher: [
      '/',
    //   '/login',
    //   '/signup'
    ]
  }
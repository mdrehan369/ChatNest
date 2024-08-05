import { NextResponse } from "next/server";

export function CustomResponse(status: number, data: any = {}, message: string = "", config: any | null = null) {
    return NextResponse.json({
        "message": message,
        "data": data,
    }, {
        status: status,
        ...config
    })
}
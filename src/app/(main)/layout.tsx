"use client"

import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { useEffect } from "react";
import { login } from "@/redux/features/users/userSlice";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    // if (typeof window !== "undefined") {
    //     window.onbeforeunload = async () => {
    //         try {
    //             await axios.get("/api/v1/users/online")
    //         } catch (err) {
    //             console.log(err)
    //         }
    //     }
    // }
    const status = useAppSelector(state => state.user.status)
    const dispatch = useAppDispatch()

    useEffect(() => {
        ; (async () => {
            try {
                if (status) return
                const response = await axios.get("/api/v1/users")
                dispatch(login(response.data.data.user))
            } catch (err) {
                console.log(err)
            }
        })()
    }, [])

    return (
        <div>
            <Header />
            {children}
            <Toaster />
        </div>
    );
}

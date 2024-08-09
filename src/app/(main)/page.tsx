"use client"

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login } from "@/redux/features/users/userSlice";
import Loading from "./loading"

export default function Home() {

    const router = useRouter()

    const user = useAppSelector(state => state.user.user)
    const [userState, setUserState]: any = useState(user);
    const [loader, setLoader] = useState(false)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!user) {
            ; (async () => {
                try {
                    setLoader(true)
                    const response = await axios.get('/api/v1/users')
                    dispatch(login(response.data.data.user))
                    setUserState(response.data.data.user)
                } catch (error) {
                    console.log(error);
                    router.push('/login')
                } finally {
                    setLoader(false)
                }
            })()
        }
    }, [])

    return (
        !loader && userState ?
        <main>
            Hello {userState?.name}
        </main>
        : <Loading />
    );
}

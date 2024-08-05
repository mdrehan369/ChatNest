"use client"

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login } from "@/redux/features/users/userSlice";

export default function Home() {

    const router = useRouter()

    const user = useAppSelector(state => state.user.user)
    const [userState, setUserState]: any = useState(user);
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!user) {
            ; (async () => {
                try {
                    const response = await axios.get('/api/v1/users')
                    dispatch(login(response.data.data.user))
                    console.log(response.data.data.user)
                    setUserState(response.data.data.user)
                } catch (error) {
                    console.log(error);
                    router.push('/login')
                }
            })()
        }
    }, [])

    return (
        <main>
            Hello {userState?.name}
        </main>
    );
}

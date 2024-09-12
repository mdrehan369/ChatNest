"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector } from "@/redux/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Header() {

    const user = useAppSelector(state => state.user.user)
    const router = useRouter()

    return (
        <header className="w-full flex items-center justify-between  border-b-2 border-gray-300">
            <div className="w-[20%] px-6 text-3xl font-bold">
                Chat Nest
            </div>
            <nav className="w-[60%]">
                <ul className="flex items-center justify-center gap-10">
                    <Link href='/' className="font-medium text-xl after:w-0 after:h-[3px] after:bg-blue-500 after:absolute relative after:bottom-0 hover:after:w-full after:left-0 after:transition-all after:duration-500">Chats</Link>
                    <Link href='/explore' className="font-medium text-xl after:w-0 after:h-[3px] after:bg-blue-500 after:absolute relative after:bottom-0 hover:after:w-full after:left-0 after:transition-all after:duration-500">Explore</Link>
                    <Link href='/groups' className="font-medium text-xl after:w-0 after:h-[3px] after:bg-blue-500 after:absolute relative after:bottom-0 hover:after:w-full after:left-0 after:transition-all after:duration-500">Groups</Link>
                </ul>
            </nav>
            <div className="w-[20%] flex items-center justify-end px-6 py-3">
                <Avatar onClick={() => router.push("/profile")}>
                    <AvatarImage src={user?.profile_pic || "https://github.com/shadcn.png"} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}
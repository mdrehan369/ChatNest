"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from "axios"
import { logout } from "@/redux/features/users/userSlice"
import { CldImage } from "next-cloudinary"


export default function Header() {

    const user = useAppSelector(state => state.user.user)
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleLogout = async () => {
        try {
            await axios.get("/api/v1/users/logout")
            dispatch(logout())
            router.push("/login")
        } catch (err) {
            console.log(err)
        }
    }

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
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar className=" hover:border-[1px] border-gray-500">
                            <CldImage width={100} height={100} alt="" className="object-cover" src={user?.profile_pic || "LawKeeper/ghb4flnfqwgk3fyd6zv2"} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
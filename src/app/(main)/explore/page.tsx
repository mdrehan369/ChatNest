"use client"
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Highlighter from "react-highlight-words";
import Loading from "@/app/(main)/loading"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CldImage } from "next-cloudinary";

// import Buttonloader from "@/components/ButtonLoader"

// Sound Effect by <a href="https://pixabay.com/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=199574">UNIVERSFIELD</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=199574">Pixabay</a>

export default function Explore() {

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [users, setUsers] = useState([])
    const [search, setSearch] = useState("")
    const [loader, setLoader] = useState(true)
    const loggedUser = useAppSelector(state => state.user.user)

    useEffect(() => {
        setLoader(true)
        const controller = new AbortController()
            ; (async () => {
                try {
                    const response = await axios.get(`/api/v1/users/explore?page=${page}&limit=${limit}&search=${search}`, { signal: controller.signal })
                    let data = response.data.data.users;
                    setUsers(data)
                } catch (err) {
                    console.log(err)
                } finally {
                    setLoader(false)
                }
            })()
        return () => controller.abort()
    }, [search, page, limit])

    const acceptRequest = async (id: string) => {
        try {

            await axios.get(`/api/v1/friends?sender=${id}`)
            setUsers((prev: any) => prev.map((user: any) => {
                if (user._id == id) {
                    user.friend.accepted = true
                }
                return user
            }))
            const audio = new Audio('/sounds/alert.mp3')
            await audio.play()

        } catch (err) {
            console.log(err)
        }
    }

    const addFriend = async (id: string) => {
        try {

            await axios.post(`/api/v1/friends`, {
                "acceptor": id
            })
            setUsers((prev: any) => prev.map((user: any) => {
                if (user._id == id) {
                    user.friend = {
                        accepted: false,
                        sender: loggedUser?._id,
                        acceptor: user._id
                    }
                }
                return user
            }))
            const audio = new Audio('/sounds/alert.mp3')
            await audio.play()

        } catch (err) {
            console.log(err)
        }
    }

    const unfriend = async (id: string) => {
        try {

            await axios.delete(`/api/v1/friends?acceptor=${id}`)
            setUsers((prev: any) => prev.map((user: any) => {
                if (user._id == id) {
                    user.friend = false
                }
                return user
            }))

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className="w-[100vw] p-8">
            <div className="w-[50%] mx-auto flex flex-col items-center justify-start gap-4">
                <div className=" self-end flex items-center justify-end gap-2 text-xs font-medium uppercase text-gray-700">
                    <label htmlFor="box">Users per page</label>
                    <Select onValueChange={(e) => setLimit(Number(e))}>
                        <SelectTrigger className="w-[100px] self-end" id="box">
                            <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="14">14</SelectItem>
                            <SelectItem value="16">16</SelectItem>
                            <SelectItem value="18">18</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                {
                    !loader ?
                        users.map((user: any, index) => <div className="w-full p-4 flex items-center justify-between border-[1px] hover:bg-gray-200 cursor-pointer transition-colors duration-500 border-gray-400 rounded" key={index}>
                            <div className="flex items-center justify-center gap-4">
                                <Avatar>
                                    <CldImage width={100} height={100} alt="" className=" object-cover" src={user.profile_pic || "LawKeeper/ghb4flnfqwgk3fyd6zv2"} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start justify-between">
                                    <Highlighter
                                        className="text-slate-900 text-xl font-bold"
                                        highlightStyle={{ color: "white", backgroundColor: "black" }}
                                        searchWords={[`${search}`]}
                                        autoEscape={true}
                                        textToHighlight={user.name}
                                    />
                                    <Highlighter
                                        highlightStyle={{ color: "white", backgroundColor: "black" }}
                                        className="text-slate-500 text-sm font-medium"
                                        searchWords={[`${search}`]}
                                        autoEscape={true}
                                        textToHighlight={`@${user.username}`}
                                    />
                                </div>
                            </div>
                            {
                                user.friend ?
                                    user.friend.accepted ?
                                        <Button id={user._id} onClick={() => unfriend(user._id)}>UnFriend</Button>
                                        : user.friend.acceptor === user._id ?
                                            <Button id={user._id} onClick={() => unfriend(user._id)} variant={"outline"}>Requested</Button>
                                            : <Button id={user._id} onClick={() => acceptRequest(user._id)}>Accept</Button>
                                    : <Button id={user._id} onClick={() => addFriend(user._id)}>Add Friend</Button>
                            }
                        </div>)
                        : <Loading />
                }
                {
                    !loader &&
                    users.length === 0 &&
                    <div className="text-xl font-bold text-center">
                        No Users Found
                    </div>
                }
                <div className="w-full flex items-center justify-between">
                    <Button disabled={page === 1} onClick={() => setPage(prev => prev - 1)}>Prev</Button>
                    <Button disabled={users.length < limit} onClick={() => setPage(prev => prev + 1)}>Next</Button>
                </div>
            </div>
        </div>
    )
}

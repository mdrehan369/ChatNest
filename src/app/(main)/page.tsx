"use client"

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { login } from "@/redux/features/users/userSlice";
import Loading from "./loading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import io from "socket.io-client"
import { BsThreeDots } from "react-icons/bs";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast";
import { uploadPreferences } from "@/redux/features/users/preferencesSlice";
import Highlighter from "react-highlight-words";


function ISOtoTime(isoDate: any) {
    const date = new Date(isoDate)
    const hours = date.getHours()
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
    return `${hours}: ${minutes}`
}

function ChatBox({ userId }: any) {

    const [chats, setChats] = useState([])
    const [newChats, setNewChats] = useState([])
    const [message, setMessage] = useState("")
    const [socket, setSocket]: any = useState(null)
    const roomId = useRef("")
    const loggedUserId = useAppSelector(state => state.user.user._id)
    const [user, setUser]: any = useState(null)
    const router = useRouter()
    const [wallpaper, setWallpaper]: any = useState("")
    const { toast } = useToast()

    useEffect((): any => {
        ; (async () => {
            try {

                const response = await axios.get(`/api/v1/chats?user=${userId}`)
                setChats(response.data.data.chats)
                setUser(response.data.data.user)
                setSocket(io())
                roomId.current = response.data.data.roomId
                const wallpaper = await axios.get(`/api/v1/preferences/wallpaper?user=${userId}`)
                setWallpaper(wallpaper.data.data)

            } catch (err) {
                console.log(err)
            }
        })()


    }, [])



    useEffect((): any => {
        if (socket) {
            socket.emit("joinRoom", roomId.current)

            socket.on("msgRecieved", (data: any) => {
                setNewChats((prev): any => [...prev, data])
            })

            socket.on("loadChats", (data: any) => {
                if (data.length === 0) return
                setNewChats((prev): any => [...prev, ...data])
            })
        }

        return () => {
            socket?.disconnect()
        }

    }, [socket])

    const sendMessage = () => {
        const data = {
            from: loggedUserId,
            to: userId,
            content: message,
            createdAt: new Date().toISOString()
        }
        socket.emit("sendMessage", data)
        setNewChats((prev): any => [...prev, data])
        setMessage("")
    }

    const unfriend = async () => {
        try {
            await axios.delete(`/api/v1/friends?acceptor=${userId}`)
            router.replace("/")
        } catch (err) {
            console.log(err)
        }
    }

    const deleteAllChats = async () => {
        try {
            await axios.delete(`/api/v1/chats?user=${userId}`)
            setNewChats([])
            setChats([])
            toast({
                description: "Messages deleted successfully!"
            })
        } catch (err) {
            console.log(err)
            toast({
                title: "Uh ohhh!",
                description: "An error occured! Try again",
                variant: "destructive"
            })
        }
    }

    const updateWallpaper = async (file: any) => {
        try {

            toast({
                title: "Uploading wallpaper..."
            })
            const formData = new FormData()

            formData.append("file", file)
            formData.append("to", userId)

            const response = await axios.post("/api/v1/preferences", formData)
            setWallpaper(response.data.data.url)

            toast({
                title: "Uploaded Successfully!"
            })

        } catch (err) {
            console.log(err)
            toast({
                title: "Error occured while uplaoding!",
                variant: "destructive"
            })
        }
    }

    const removeWallpaper = async () => {
        try {
            toast({
                title: "Deleting wallpaper..."
            })
            await axios.delete(`/api/v1/preferences/wallpaper?user=${userId}`)
            setWallpaper("")
            toast({
                title: "Deleted Successfully!"
            })

        } catch (err) {
            console.log(err)
            toast({
                title: "Error occured while deleting!",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="w-[77vw] h-[90vh] rounded border-[1px] border-gray-400" id="box">
            <div className="w-full h-[10%] flex items-center justify-between px-8 py-4 bg-gray-300 shadow-sm border-b-[1px] border-gray-400">
                <div className="flex items-center justify-start gap-3">
                    <Avatar>
                        <AvatarImage src={"https://github.com/shadcn.png"} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className=" flex flex-col items-start justify-center gap-0">
                        <span className="text-xl text-black font-medium">{user?.name}</span>
                        <span className="text-sm font-bold text-gray-500 italic">@{user?.username}</span>
                    </div>
                </div>
                <input
                    type="file"
                    id="wallpaper"
                    className="hidden"
                    name="wallpaper"
                    onChange={(e) => { updateWallpaper(e.currentTarget.files![0]) }} />
                <DropdownMenu>
                    <DropdownMenuTrigger><BsThreeDots className="hover:bg-gray-400 rounded p-1 transition-colors duration-300 size-8" /></DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>View {user?.name}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => unfriend()}>Unfriend {user?.name}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteAllChats()}>Delete all chats</DropdownMenuItem>
                        <DropdownMenuItem>
                            <label htmlFor="wallpaper">Wallpapers</label>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Search</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => removeWallpaper()}>Remove wallpaper</DropdownMenuItem>
                        <DropdownMenuItem>Media</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
            <div className=" overflow-y-scroll flex flex-col-reverse h-[80%] w-full relative" id="textBox"
                style={{ backgroundImage: `url("${wallpaper}")`, backgroundSize: "100%", backgroundRepeat: "no-repeat", objectFit: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
            >
                <div className="w-full flex flex-col items-start justify-end p-3 gap-1 relative z-0 min-h-full" id="inner">
                    {chats.concat(newChats).map((chat: any, index) => <div key={index} className={` w-fit flex items-center justify-start ${chat.from === userId ? ' flex-row self-start' : ' flex-row-reverse self-end'} gap-2 px-2 `}>
                        <Avatar>
                            <AvatarImage src={"https://github.com/shadcn.png"} />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        {
                            chat.from === userId ?
                                <div className=" bg-gray-200 text-black px-4 py-1 rounded flex flex-col items-start justify-between">
                                    <span>{chat.content}</span>
                                    <span className=" text-xs text-gray-400 self-end">{ISOtoTime(chat.createdAt)}</span>
                                </div>
                                : <div className=" bg-gray-200 text-black px-4 py-1 rounded flex flex-col items-end justify-between">
                                    <span>{chat.content}</span>
                                    <span className=" text-xs text-gray-400 self-end">{ISOtoTime(chat.createdAt)}</span>
                                </div>
                        }

                    </div>)}
                </div>
            </div>
            <div className=" w-full h-[10%] border-t-2 border-gray-300 flex items-center justify-between gap-2 px-10">
                <Input
                    className=""
                    placeholder="Write a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') sendMessage()
                    }} />
                <Button
                    variant={"default"}
                    onClick={() => sendMessage()}
                >
                    Send
                </Button>
            </div>
        </div>
    )
}

export default function Home() {

    const router = useRouter()

    const user = useAppSelector(state => state.user.user)
    const [userState, setUserState]: any = useState(user)
    const [loader, setLoader] = useState(true)
    const [friends, setFriends] = useState([])
    const [userId, setUserId] = useState("")
    const [search, setSearch] = useState("")
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!user) {
            ; (async () => {
                try {
                    setLoader(true)
                    const response = await axios.get('/api/v1/users')
                    const preferences = await axios.get('/api/v1/preferences')
                    dispatch(login(response.data.data.user))
                    dispatch(uploadPreferences(preferences.data.data))
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

    useEffect(() => {
        if (userState) {
            ; (async () => {
                try {
                    const response = await axios.get(`/api/v1/friends/all?search=${search}`)
                    console.log(response.data)
                    setFriends(response.data.data.friends)
                } catch (error) {
                    console.log(error);
                } finally {
                    setLoader(false)
                }
            })()
        }
    }, [userState, search])

    return (
        !loader && userState ?
            <main className="w-[100vw] h-[93vh] flex items-center justify-between p-4">
                <div className="w-[20vw] h-full bg-gray-100 p-3 rounded border-[1px] border-gray-400 flex flex-col items-center justify-start gap-2">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
                    {
                        friends.map((friend: any, index) => <div onClick={() => setUserId(friend._id)} key={index} className="w-full bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors duration-500 border-[1px] border-gray-400 rounded p-2 flex items-center justify-start gap-4 pl-4">
                            <Avatar>
                                <AvatarImage src={friend.profile_pic || "https://github.com/shadcn.png"} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className="w-full flex flex-col items-start justify-center gap-0">
                                <Highlighter
                                    className="text-slate-900 text-xl font-semibold"
                                    highlightStyle={{ color: "white", backgroundColor: "black" }}
                                    searchWords={[`${search}`]}
                                    autoEscape={true}
                                    textToHighlight={friend.name}
                                />
                                {/* <span className="text-xl font-semibold text-slate-800">{friend.name}</span> */}
                                <div className="w-full flex items-center justify-between text-sm text-gray-600 font-medium italic">
                                    {
                                        friend.lastChat &&
                                        <>
                                            <span>{friend.lastChat.from === friend._id ? friend.lastChat.content : `You: ${friend.lastChat.content}`}</span>
                                            <span>{ISOtoTime(friend.lastChat.createdAt)}</span>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>)
                    }

                </div>
                {
                    userId != "" &&
                    <ChatBox userId={userId} key={Date.now()} />
                }
            </main>
            : <Loading />
    );
}
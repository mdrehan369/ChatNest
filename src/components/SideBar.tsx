import { CldImage } from "next-cloudinary";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import Highlighter from "react-highlight-words";
import { useAppSelector } from "@/redux/hooks";

type MyArr = {
    profile_pic: string,
    isOnline?: boolean,
    id: string,
    name: string,
    lastChat: {
        seen: boolean,
        to: string,
        createdAt: string
    }
}

type Props = {
    search: string,
    setSearch: any,
    openChats: any,
    arr: Array<MyArr>
}

function ISOtoTime(isoDate: any) {
    const date = new Date(isoDate)
    const hours = date.getHours()
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
    return `${hours}: ${minutes}`
}

export default function SideBar({ search, setSearch, openChats, arr }: Props) {

    const user = useAppSelector(state => state.user.user)

    return(
        <div className="w-[20vw] h-full bg-gray-100 p-3 rounded border-[0px] border-gray-400 flex flex-col items-center justify-start gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className=" border-none" />
            <Separator className=" bg-gray-200 h-[2px]" />
            {
                arr.map((elem: any, index) => <div onClick={() => openChats(elem._id)} key={index} className="w-full bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors duration-500 border-[2px] border-gray-200 rounded p-2 flex items-center justify-start gap-4 pl-4">
                    <Avatar>
                        <CldImage src={elem.profile_pic || "LawKeeper/ghb4flnfqwgk3fyd6zv2"} width={100} height={100} alt="" className=" object-cover" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="w-full relative flex flex-col items-start justify-center gap-0">
                        <div className=" flex items-center justify-start gap-2">
                            {
                                elem?.isOnline &&
                                <div className="w-[7px] h-[7px] rounded-full bg-green-600"></div>
                            }
                            <Highlighter
                                className="text-slate-900 text-xl font-semibold"
                                highlightStyle={{ color: "white", backgroundColor: "black" }}
                                searchWords={[`${search}`]}
                                autoEscape={true}
                                textToHighlight={elem.name}
                            />
                        </div>
                        <div className="w-full flex items-center justify-between text-sm text-gray-600 font-medium italic">
                            {
                                elem.lastChat &&
                                <>
                                    <span className={!elem.lastChat.seen && elem.lastChat.to === user?._id ? 'text-green-600' : ''}>{elem.lastChat.from === elem._id ? elem.lastChat.content : `You: ${elem.lastChat.content}`}</span>
                                    <span>{ISOtoTime(elem.lastChat.createdAt)}</span>
                                </>
                            }
                        </div>
                    </div>
                </div>)
            }

        </div>
    )

}
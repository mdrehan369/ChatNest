"use client"

import { Textarea } from "@/components/ui/textarea"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { useEffect, useState } from "react"
import { getUser, updateUser } from "@/actions/users.action"
import { useRouter, useSearchParams } from "next/navigation"
import { CldImage, CldUploadWidget } from "next-cloudinary"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Loading from "../loading"
import { IUser, UserProfileData } from "@/types/user.types"
import { updateProfile } from "@/redux/features/users/userSlice"
import { HydratedDocument } from "mongoose"

export type Data = {
    bio?: string,
    profile_pic?: string
}

function useCld({results, setData}: any) {
    useEffect(() => {
        console.log(results)
        if (results?.event === "success") {
            setData((prev: any) => ({ ...prev, profile_pic: results?.info.public_id }))
        }
    }, [results])

}

export default function Profile() {

    const userId = useSearchParams().get("userId") || null
    const loggedInUser = useAppSelector(state => state.user.user)
    const [user, setUser] = useState<HydratedDocument<IUser> | undefined | null>(loggedInUser)
    const [data, setData] = useState<Data>({
        bio: user?.bio || "",
        profile_pic: user?.profile_pic || ""
    })
    const { toast } = useToast()
    const [loader, setLoader] = useState(true)
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleSave = async () => {
        const response = await updateUser(data)
        router.push("/")
        if (response) {
            dispatch(updateProfile(data))
            toast({
                title: "Profile Updated Successfully"
            })
        } else {
            toast({
                title: "An error occured while updating profile",
                variant: "destructive"
            })
        }
    }

    useEffect(() => {
        ; (async () => {
            try {
                console.log(userId)
                setLoader(true)
                if (userId) {
                    const response = await getUser(userId)
                    if (response !== null) {
                        const user = JSON.parse(response)
                        setUser(user)
                        setData({
                            bio: user?.bio,
                            profile_pic: user?.profile_pic
                        })
                    }
                } else {
                    setUser(loggedInUser)
                    setData({
                        bio: loggedInUser?.bio,
                        profile_pic: loggedInUser?.profile_pic
                    })
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoader(false)
            }
        })()
    }, [loggedInUser, userId])

    return (
        !loader ?
            <div className="w-full h-[90vh] flex items-center justify-center gap-10">
                <Card className="w-[25%] h-[90%] flex flex-col items-center justify-start gap-2 py-5 px-3">
                    <CardHeader>
                        <CldUploadWidget uploadPreset="Chatnest">
                            {
                                ({ open, results }: any) => {
                                    // useEffect(() => {
                                    //     console.log(results)
                                    //     if (results?.event === "success") {
                                    //         setData({ ...data, profile_pic: results?.info.public_id })
                                    //     }
                                    // }, [results])
                                    useCld({results, setData})
                                    return (
                                        <CldImage onClick={() => loggedInUser?._id === user?._id && open()} alt="" width={200} height={200} src={data?.profile_pic || "LawKeeper/ghb4flnfqwgk3fyd6zv2"} className="bg-gray-300 rounded-full p-2 w-[200px] h-[200px] object-cover" />
                                    )
                                }
                            }
                        </CldUploadWidget>
                    </CardHeader>
                    <CardContent className=" flex flex-col items-start justify-start gap-2 w-[90%]">
                        <p className="text-xl font-medium">{user?.name}</p>
                        <p className="text-sm font-medium text-gray-500">{user?.email}</p>
                        <p className="text-sm font-medium text-gray-500">@{user?.username}</p>
                        <label htmlFor="bio">Bio</label>
                        <Textarea value={data.bio} autoComplete={"true"} disabled={loggedInUser?._id !== user?._id} onChange={(e) => setData({ ...data, bio: e.target.value })} className="resize-none" id="bio" />
                    </CardContent>
                    <CardFooter>
                        {!userId && <Button onClick={handleSave}>Save</Button>}
                    </CardFooter>
                </Card>

            </div>
            : <Loading />
    )
}
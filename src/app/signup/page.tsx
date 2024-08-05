"use client"

import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { BsExclamationTriangle } from "react-icons/bs";
import axios from "axios";
import { login } from "@/redux/features/users/userSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { TiTickOutline } from "react-icons/ti";

const formSchema = z.object({
    name: z.string().min(1),
    username: z.string().toLowerCase(),
    email: z.string().toLowerCase(),
    password: z.string().min(4, { message: "Password should be atleast of 4 letters" })
})

export default function signup() {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            email: "",
            name: ""
        },
    })

    const dispatch = useAppDispatch()
    const router = useRouter()
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading]: any = useState(false);
    const [isFormValid, setIsFormValid] = useState(false)

    useEffect(() => {
        const controller = new AbortController()
        ; (async () => {
            try {
                const username = form.watch("username")
                const email = form.watch("email")

                const response = await axios.get(`/api/v1/users/check?username=${username}&email=${email}`, { signal: controller.signal })
                if (!response.data.data.username) {
                    form.setError("username", { "message": "Username Already Taken", type: "validate" })
                    setIsFormValid(false)
                } else {
                    setIsFormValid(true)
                    form.clearErrors("username")
                }
                if (!response.data.data.email) {
                    form.setError("email", { "message": "Email Already Taken", type: "validate" })
                    setIsFormValid(false)
                } else {
                    setIsFormValid(true)
                    form.clearErrors("email")
                }
            } catch (err: any) {
                if(axios.isCancel(err)) console.log("Previous request cancelled!")
                console.log(err);
            }
        })()

        return () => controller.abort()
    }, [form.watch("username"), form.watch("email")])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true)
            const response = await axios.post('/api/v1/users/signup', values)
            dispatch(login(response.data.data.user))
            router.push('/')
        } catch (err: any) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-[100vw] h-[100vh] flex flex-col items-center justify-center bg-[f1f1f1]">

            <Form {...form}>
                <h1 className="text-left w-[25%] p-2 font-bold text-2xl">Sign Up</h1>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-[25%] flex flex-col p-4 border-[1px] shadow-sm border-gray-200 rounded-md">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="For ex. john123" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <Input placeholder="For ex. john123" {...field} />
                                        {field.value != "" && (form.formState.errors.username ? <div className="w-full text-sm flex items-center justify-start gap-2">
                                            <BsExclamationTriangle className=" text-destructive" />
                                            <span className=" text-destructive">{form.formState.errors.username.message}</span>
                                        </div> :
                                            <div className="w-full text-sm flex items-center justify-start gap-2">
                                                <TiTickOutline className="text-green-600" />
                                                <span className=" text-green-600">
                                                    Available
                                                </span>
                                            </div>)}
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <div className="space-y-2">
                                        <Input placeholder="For ex. john123@example.com" {...field} />
                                        {field.value != "" && (form.formState.errors.email ? <div className="w-full text-sm flex items-center justify-start gap-2">
                                            <BsExclamationTriangle className=" text-destructive" />
                                            <span className=" text-destructive">{form.formState.errors.email.message}</span>
                                        </div> :
                                            <div className="w-full text-sm flex items-center justify-start gap-2">
                                                <TiTickOutline className="text-green-600" />
                                                <span className=" text-green-600">
                                                    Available
                                                </span>
                                            </div>)}
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="w-full flex flex-col items-start justify-between gap-2">
                                        <Input placeholder="8+ Characters" type={showPass ? "text" : "password"} {...field} />
                                        <div className="w-full flex items-center justify-start gap-2">
                                            <Checkbox id="showPass" onClick={() => setShowPass((prev) => !prev)} />
                                            <label htmlFor="showPass" className="cursor-pointer text-sm text-gray-700">Show Password</label>
                                        </div>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Link href={'/login'} className="text-sm w-fit self-start text-blue-500 hover:underline">Already a user? Sign In</Link>
                    <Button variant={"default"} disabled={!isFormValid || !form.formState.isValid || loading} type="submit" className="self-end">Sign Up</Button>
                </form>
            </Form>
        </div>
    )
}
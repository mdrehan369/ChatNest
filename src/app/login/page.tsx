"use client"

import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import axios from "axios";
import { useAppDispatch } from "@/redux/hooks";
import { login } from "@/redux/features/users/userSlice";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BsExclamationTriangle } from "react-icons/bs";


const formSchema = z.object({
    usernameOrEmail: z.string().min(1).toLowerCase(),
    password: z.string().min(4, { message: "Password should be atleast of 4 letters" })
})

export default function Login() {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            usernameOrEmail: "",
            password: ""
        },
    })

    const dispatch = useAppDispatch()
    const router = useRouter()
    const [showPass, setShowPass] = useState(false);
    const [error, setError]: any = useState(null);

    async function onSubmit(values: z.infer<typeof formSchema>) {

        try {
            const response = await axios.post('/api/v1/users/login', values)
            dispatch(login(response.data.data.user))
            router.push('/')
        } catch (err: any) {
            console.log(err);
            setError(err.response?.data.data)
        }
    }

    return (
        <div className="w-[100vw] h-[100vh] flex flex-col items-center justify-center bg-[f1f1f1]">
            
            {error && <Alert variant={"destructive"} className="w-[25%] absolute top-24 animate-appear">
                <BsExclamationTriangle className=" text-destructive" />

                <AlertTitle className="">{error.title}</AlertTitle>
                <AlertDescription>
                    {error.message}
                </AlertDescription>
            </Alert>}

            <Form {...form}>
                <h1 className="text-left w-[25%] p-2 font-bold text-2xl">Sign In</h1>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col w-[25%] p-4 border-[1px] shadow-sm border-gray-200 rounded-md">
                    <FormField
                        control={form.control}
                        name="usernameOrEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username or Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="For ex. john123" {...field} />
                                </FormControl>
                                <FormMessage />
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
                    <Link href={'/signup'} className="text-sm w-fit self-start text-blue-500 hover:underline">New user? Sign Up</Link>
                    <Button variant={"default"} type="submit" className="self-end">Sign In</Button>
                </form>
            </Form>
        </div>
    )
}
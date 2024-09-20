"use client";

import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { useEffect, useState } from "react";
import { login } from "@/redux/features/users/userSlice";
import { markOnline } from "@/actions/users.action";
import { uploadPreferences } from "@/redux/features/users/preferencesSlice";
import Loading from "./loading";
import { socketClient } from "@/helpers/socket";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const [loader, setLoader] = useState(true);
  //   const [socket, setSocket] = useState()

  useEffect(() => {

    const socket = socketClient;
    socket.connect();
    (async () => {
      try {
        if (user) return;
        const response = await axios.get("/api/v1/users");
        const preferences = await axios.get("/api/v1/preferences");
        dispatch(login(response.data.data.user));
        dispatch(uploadPreferences(preferences.data.data));
        await markOnline();
      } catch (err) {
        console.log(err);
      } finally {
        setLoader(false);
      }
    })();

    return () => {
      socket.removeAllListeners();
      socket?.emit("markOffline", user?._id.toString());
      socket?.disconnect();
    };
  }, []);

  return !loader ? (
    <div>
      <Header />
      {children}
      <Toaster />
    </div>
  ) : (
    <Loading className="w-[100vw] h-[100vh]" />
  );
}

"use client"

import { io, Socket } from "socket.io-client";

export const socketClient: Socket = io()
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import axios from "axios";
import chalk from "chalk";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    const roomsMap = new Map()
    const socketToRoomsMap = new Map()

    const globalRoomID = "GLOBAL"

    io.on("connection", async (socket) => {


        /*
        1. If one user is there, save all chats
        2. If two users came, then save chats locally and save them in continuous period or when any one user exits the socket
        3. Track the chats which are already saved in the database

        RoomsMap => roomId -> object{
                chats: [],
                size: number,
            }
        
        socketToRoomsMap => socketId -> roomId

        */


        console.log(chalk.greenBright("connected to socket!", socket.id))

        socket.on("joinGlobalRoom", () => {
            socket.join(globalRoomID)
        })

        socket.on("joinRoom", (data) => {
            socket.join(data)
            socketToRoomsMap.set(socket.id, data)
            if (roomsMap.has(data)) {
                let prev = roomsMap.get(data)
                prev.size += 1
                roomsMap.set(data, prev)
            } else {
                roomsMap.set(data, {
                    chats: [],
                    size: 1
                })
            }

            console.log(chalk.blueBright("room joined", data))
            // socket.join(data)
        })

        socket.on("sendMessage", (message) => {
            const roomId = socketToRoomsMap.get(socket.id)
            if (roomsMap.get(roomId)?.size == 1) {
                axios.post(`${process.env.SERVER}/api/v1/chats`, { chats: message }).then(() => {
                    console.log(chalk.yellowBright("chats saved"))
                })
            } else {
                const prev = roomsMap.get(socketToRoomsMap.get(socket.id))
                prev.chats.push(message)
                roomsMap.set(socketToRoomsMap.get(socket.id), prev)
                socket.broadcast.to(socketToRoomsMap.get(socket.id)).emit("msgRecieved", message)
            }
            io.to(globalRoomID).emit("globalMsgReceived", message)
        })

        socket.on("typing", () => {
            socket.broadcast.to(socketToRoomsMap.get(socket.id)).emit("typing")
        })

        socket.on("disconnecting", (reason) => {
            console.log(chalk.redBright("Socket ", socket.id, " disconnected due to ", reason))

            const roomId = socketToRoomsMap.get(socket.id)
            if (!roomId) return

            if (roomsMap.get(roomId).chats.length != 0) {
                axios.post(`${process.env.SERVER}/api/v1/chats`, { chats: roomsMap.get(roomId).chats }).then(() => {
                    console.log(chalk.yellowBright("chats saved"))
                })
                roomsMap.get(roomId).chats.length = 0
            }
            socketToRoomsMap.delete(socket.id)
            if (roomsMap.get(roomId)?.size == 1) {
                roomsMap.delete(roomId)
            } else {
                roomsMap.get(roomId).size -= 1
            }

        })

    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
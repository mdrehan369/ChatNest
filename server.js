import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import axios from "axios";
import chalk from "chalk";
import { Redis } from "ioredis";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

class RedisClient {
    HASHNAME = "socketToRoomsMap"
    redis = null

    constructor() {
        this.redis = new Redis({
            username: process.env.REDIS_USER,
            password: process.env.REDIS_PASSWORD,
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        })
    }

    async addRoomId(socketId, roomId) {
        await this.redis.hset(this.HASHNAME, socketId, roomId)
    }
    async delRoomId(socketId) {
        await this.redis.hdel(this.HASHNAME, socketId)
    }

    async getRoomId(socketId) {
        return await this.redis.hget(this.HASHNAME, socketId)
    }

    async doesRoomExists(roomId) {
        const room = await this.getRoom(roomId)
        if (room) return true
        else false
    }

    async addRoomData(roomId, data = { chats: [], size: 1 }) {
        return await this.redis.call("JSON.SET", roomId, '$', JSON.stringify(data))
    }

    async delRoomData(roomId) {
        return await this.redis.call("JSON.DEL", roomId)
    }

    async updateRoomData(roomId, data) {
        await this.redis.call("JSON.MSET", roomId, '$', JSON.stringify(data))
    }

    async updateRoomSize(roomId, inc) {
        const prev = await this.getRoom(roomId)
        if (!prev) return null
        prev.size = Number(prev.size) + Number(inc)
        await this.updateRoomData(roomId, prev)
    }

    async clearRoomChats(roomId) {
        const prev = await this.getRoom(roomId)
        if (!prev) return null
        prev.chats.length = 0
        await this.updateRoomData(roomId, prev)
    }

    async getRoom(roomId) {
        const data = await this.redis.call("JSON.GET", roomId)
        return JSON.parse(data)
    }

    async addChat(roomId, message) {
        const prev = await this.getRoom(roomId)
        message.seen = true
        prev.chats.push(message)
        await this.updateRoomData(roomId, prev)
    }
}

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    const redis = new RedisClient()

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
        let interval = null

        socket.on("joinGlobalRoom", () => {
            socket.join(globalRoomID)
        })

        socket.on("joinRoom", async (data) => {
            socket.join(data)
            await redis.addRoomId(socket.id, data)
            const room = await redis.doesRoomExists(data)
            if (room) {
                await redis.updateRoomSize(data, 1)
            } else {
                await redis.addRoomData(data)
            }

            console.log(chalk.blueBright("room joined", data))
        })


        socket.on("sendMessage", async (message) => {
            const roomId = await redis.getRoomId(socket.id)
            const room = await redis.getRoom(roomId)
            console.log("Message is", message)
            if (room?.size == 1) {
                await axios.post(`${process.env.SERVER}/api/v1/chats`, { chats: message })
                console.log(chalk.yellowBright("chats saved"))
            } else {
                await redis.addChat(roomId, message)
                socket.broadcast.to(roomId).emit("msgRecieved", message)
            }
            io.to(globalRoomID).emit("globalMsgReceived", message)
        })

        socket.on("typing", async () => {
            socket.broadcast.to(await redis.getRoomId(socket.id)).emit("typing")
        })

        socket.on("disconnecting", async (reason) => {
            console.log(chalk.redBright("Socket ", socket.id, " disconnected due to ", reason))
            const roomId = await redis.getRoomId(socket.id)
            const room = await redis.getRoom(roomId)
            if (!roomId) return

            if (room.chats.length != 0) {
                const chats = room.chats
                await axios.post(`${process.env.SERVER}/api/v1/chats`, { chats })
                console.log(chalk.yellowBright("chats saved"))
                await redis.clearRoomChats(roomId)
            }
            await redis.delRoomId(socket.id)
            if (room.size == 1) {
                await redis.delRoomData(roomId)
            } else {
                await redis.updateRoomSize(roomId, -1)
            }

            clearInterval(interval)

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
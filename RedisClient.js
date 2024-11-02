import { Redis } from "ioredis"

export class RedisClient {
    HASHNAME = "socketToRoomsMap"
    USERID_HASH = "socketToUserId"
    redis

    constructor() {
        this.redis = new Redis({
            // username: process.env.REDIS_USER,
            // password: process.env.REDIS_PASSWORD,
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

    async addUserEntry(socketId, userId) {
        await this.redis.hset(this.USERID_HASH, socketId, userId)
    }

    async getUserEntry(socketId) {
        const userId = await this.redis.hget(this.USERID_HASH, socketId)
        return userId
    }

    async delUserEntry(socketId) {
        await this.redis.hdel(this.USERID_HASH, socketId)
    }
}

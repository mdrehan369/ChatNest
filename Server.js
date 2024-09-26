import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import axios from "axios";
import chalk from "chalk";
import { RedisClient } from "./RedisClient.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  const redis = new RedisClient();

  const globalRoomID = "GLOBAL";

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

        socketToUserIdMap => socketId -> userId

        */

    console.log(chalk.greenBright("connected to socket!", socket.id));

    socket.on("joinGlobalRoom", async (userId) => {
      console.log(chalk.bgMagenta("joined global room", socket.id));
      socket.join(globalRoomID);
      await redis.addUserEntry(socket.id, userId);
    });

    socket.on("joinRoom", async (data) => {
      console.log(chalk.bgMagenta("joined private room", socket.id));
      socket.join(data);
      await redis.addRoomId(socket.id, data);
      const room = await redis.doesRoomExists(data);
      console.log("data is", data)
      if (room) {
        await redis.updateRoomSize(data, 1);
      } else {
        await redis.addRoomData(data);
      }

      console.log(chalk.blueBright("room joined", data));
    });

    socket.on("sendMessage", async (message) => {
      const roomId = await redis.getRoomId(socket.id);
      const room = await redis.getRoom(roomId);
      console.log("room is", room?.size);
      if (room?.size == 1) {
        await axios.post(`${process.env.SERVER}/api/v1/chats`, {
          chats: message,
        });
        console.log(chalk.yellowBright("chats saved"));
      } else {
        await redis.addChat(roomId, message);
        socket.broadcast.to(roomId).emit("msgRecieved", message);
      }
      io.to(globalRoomID).emit("globalMsgReceived", message);
    });

    socket.on("typing", async () => {
      socket.broadcast.to(await redis.getRoomId(socket.id)).emit("typing");
    });

    socket.on("leaveRoom", async (reason) => {
      console.log(
        chalk.redBright("Socket ", socket.id, " leaved due to ", reason)
      );
      const roomId = await redis.getRoomId(socket.id);
      if (!roomId) return;

      const room = await redis.getRoom(roomId);
      if (room.chats.length != 0) {
        const chats = room.chats;
        await axios.post(`${process.env.SERVER}/api/v1/chats`, { chats });
        console.log(chalk.yellowBright("chats saved"));
        await redis.clearRoomChats(roomId);
      }
      await redis.delRoomId(socket.id);
      if (room.size == 1) {
        await redis.delRoomData(roomId);
      } else {
        await redis.updateRoomSize(roomId, -1);
      }
    });

    socket.on("markOffline", (userId) => {
      console.log("offline event", userId);
      socket.broadcast.to(globalRoomID).emit("markOffline", userId);
    });

    socket.on("markOnline", (userId) => {
      console.log(userId);
      socket.broadcast.to(globalRoomID).emit("markOnline", userId);
    });

    socket.on("disconnect", async (reason) => {
      console.log(
        chalk.redBright("Socket ", socket.id, " disconnected due to ", reason)
      );
      const userId = await redis.getUserEntry(socket.id);
      socket.broadcast.to(globalRoomID).emit("markOffline", userId);
      if (userId)
        axios.get(
          `${process.env.SERVER}/api/v1/users/offline?userId=${userId}`
        );
      redis.delUserEntry(socket.id);
    });
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

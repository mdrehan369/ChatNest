import mongoose from "mongoose";

export const connect = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ChatNest")
        console.log("Connected To ", connection.connection.db.databaseName);
    } catch (err) {
        console.log("error while connecting to database ", err);
    }
}

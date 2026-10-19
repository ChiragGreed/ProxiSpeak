import { Server } from "socket.io";
import { createServer } from "node:http";
import app from "../app.js";

export const httpServer = createServer(app);

let io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};
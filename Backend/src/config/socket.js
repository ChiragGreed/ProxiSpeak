import { Server } from "socket.io";
import { createServer } from "node:http";
import app from "../app.js";

export const httpServer = createServer(app);

export let io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


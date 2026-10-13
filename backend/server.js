import app from './src/app.js'
import { Server } from "socket.io";
import { createServer } from 'http';
import ConnectToDB from './src/config/database.js';
import { Config } from "./src/config/config.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('A new connection was made');

    socket.on('cords', (cords) => {
        io.emit('serverCords', cords);
    })
});

ConnectToDB();


httpServer.listen(Config.PORT || 3000, () => {
    console.log(`Server running at port: ${Config.PORT}`);
})
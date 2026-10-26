import app from './src/app.js'
import { Server } from "socket.io";
import { createServer } from 'http';
import ConnectToDB from './src/config/database.js';
import { Config } from "./src/config/config.js";
import registerSocketHandlers from './src/sockets/index.js';

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173'],
        credentials: true
    }
});

registerSocketHandlers(io);

// io.on('connection', (socket) => {
//     console.log('A new connection was made');

//     socket.on('cords', (cords) => {
//         console.log(cords);
//         io.emit('serverCords', cords);
//     })
// });

ConnectToDB();

httpServer.listen(Config.PORT, () => {
    console.log(`Server running at port: ${Config.PORT}`);
})
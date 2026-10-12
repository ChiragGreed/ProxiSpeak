import { httpServer } from "./src/config/socket.js";
import config from "./src/config/config.js";


httpServer.listen(config.port,()=>{
    console.log(`Server running at port: ${config.port}`)
})

// app.listen(3000,()=>{
//     console.log('Server running at port: 3000')
// })
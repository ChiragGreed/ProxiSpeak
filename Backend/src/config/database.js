import mongoose from "mongoose"
import { Config } from "./config.js";

const ConnectToDB = () => {
    mongoose.connect(Config.MONGO_URI)
        .then(() => {
            console.log("MongoDB is Connected");
        })
}

export default ConnectToDB
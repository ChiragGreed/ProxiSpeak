import "dotenv/config";

if(!process.env.PORT) {
    throw new Error("PORT is not defined in the environment variables");
}

const config = {
    port: process.env.PORT
};

export default {
    port: process.env.PORT
};
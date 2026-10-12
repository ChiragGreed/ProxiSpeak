import express from 'express';

const app = express();

app.use(express.json());

//Default Request for Basic response Formate
app.get("/", (req, res) => {
    res.status(200).send({
        success: true,
        message: "Welcome To ProxiSpeak Backend",
        Date: new Date().toDateString(),
        Time: new Date().toTimeString()
    });
})

export default app;
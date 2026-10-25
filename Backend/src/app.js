import express from 'express';
import authRouter from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import meetingRouter from './routes/meetingRoute.js';
import cors from 'cors';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("tiny"));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.get("/", (req, res) => {
    res.status(200).json({
        message : "Welcome to ProxiSpeak Backend",
        Date : new Date().toLocaleDateString(),
        Time : new Date().toLocaleTimeString()
    });
})
app.use('/api/auth', authRouter);
app.use('/api/meeting', meetingRouter);

export default app;
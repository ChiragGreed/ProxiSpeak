import express from 'express';
import authRouter from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import meetingRouter from './routes/meetingRoute.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));



app.use('/api/auth', authRouter);
app.use('/api/meeting', meetingRouter);

export default app;
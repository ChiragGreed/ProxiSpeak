import express from 'express';
import { createMeeting, getMeetingUsers } from '../controllers/meetingController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const meetingRouter = express.Router();

meetingRouter.post('/create', verifyToken, createMeeting);
meetingRouter.get('/users/:meetingId', verifyToken, getMeetingUsers);

export default meetingRouter;
import express from 'express';
import { createMeeting, getMeetingDetails } from '../controllers/meetingController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const meetingRouter = express.Router();

meetingRouter.post('/create', verifyToken, createMeeting);
meetingRouter.get('/details/:meetingId', verifyToken, getMeetingDetails);

export default meetingRouter;
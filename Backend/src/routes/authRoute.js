import express from 'express';
import { getMe, login, logout, protectedRoute, register } from '../controllers/authController.js';
import { loginValidator, registerValidator } from '../validation/authValidation.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', registerValidator, register);

authRouter.post('/login', loginValidator, login);

authRouter.get('/logout', logout);

authRouter.get('/getMe', verifyToken, getMe);

authRouter.get('/protectedRoute', verifyToken, protectedRoute);


export default authRouter
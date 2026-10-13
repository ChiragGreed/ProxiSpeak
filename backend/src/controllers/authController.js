import { Config } from "../config/config.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import bcrypt from "bcryptjs";

function tokenGeneration(user, res) {

    const token = JWT.sign({
        userId: user._id,
        fullName: user.fullName,
    }, Config.JWT_SECRET,
        { expiresIn: '7d' });


    res.cookie("token", token);

}

export const register = async (req, res) => {
    const { fullName, email, password } = req.body;

    const userExist = await userModel.findOne({ $or: [{ fullName }, { email }] });

    if (userExist) return res.status(400).json({
        message: "User already exist from this " + (userExist.email == email ? "email" : "username"),
        success: false,
        error: "User already exist"
    })

    const user = await userModel.create({ fullName, email, password,  });

    tokenGeneration(user, res);

    res.status(201).json({
        message: "User registered",
        success: true,
        user
    })

}

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) return res.status(400).json({
        message: "Invalid credentials",
        success: false,
        error: "Invalid credentials"
    })

    const VerifyPassword = await bcrypt.compare(password, user.password);

    if (!VerifyPassword) return res.status(400).json({
        message: "Invalid credentials",
        success: false,
        error: "Invalid credentials"
    })


    tokenGeneration(user, res);

    res.status(201).json({
        message: "User Logged in",
        success: true,
        user,
    })

}

export const logout = async (req, res) => {

    res.clearCookie('token');

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}

export const getMe = async (req, res) => {

    const user = await userModel.findById(req.user);

    if (!user) return res.status(404).json({
        message: "User not found",
        success: false,
        error: "No user forund with this token"
    });

    res.status(200).json({
        message: "Fetched user details",
        success: true,
        user
    })

}

export const protectedRoute = async (req, res) => {
    res.status(200).json({
        message: "Protected route accessed",
        success: true,
    })
}


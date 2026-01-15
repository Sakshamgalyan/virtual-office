import type { Request, Response } from "express";
import { loginUserService, registerUserService } from "../services/User.services.js";
import { validationResult } from "express-validator";
import blackListTokenModel from "../models/blacklistToken.modal.js";

export const loginUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ error: "Missing credentials" });
        }

        const userResponse = await loginUserService(identifier, password);

        res.cookie('token', userResponse.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });

        return res.json({
            user: userResponse,
            success: true,
        });

    } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User not found") {
            return res.status(404).json({ error: "User not found" });
        }
        if (error.message === "Invalid password") {
            return res.status(401).json({ error: "Invalid password" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        const email = (req.body?.email ?? "").toString().toLowerCase().trim();
        const password = (req.body?.password ?? "").toString();
        const username = (req.body?.username ?? "").toString().trim();
        const name = (req.body?.name ?? "").toString();
        const mobile = (req.body?.mobile ?? "").toString().trim();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ error: "Invalid mobile number" });
        }

        const { user: userResponse, id } = await registerUserService({
            email,
            password,
            username,
            name,
            mobile
        });

        // Set auth cookie
        res.cookie('token', id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });

        return res.status(201).json({ user: userResponse, success: true });

    } catch (error: any) {
        console.error("Registration error:", error);
        if (error.message.includes("already exists")) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === "Missing required fields") {
            return res.status(400).json({ error: "Missing required fields" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        return res.status(200).json({ user });
    } catch (error: any) {
        console.error("Get user profile error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    try {
        res.clearCookie('token');
        const token = req.cookies['token'];
        await blackListTokenModel.create({ token });
        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error("Logout error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
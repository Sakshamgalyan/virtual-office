import jwt, { type JwtPayload } from 'jsonwebtoken';
import userModel from '@/models/User.modal.js';
import type { NextFunction, Request, Response } from 'express';

interface IUserPayload extends JwtPayload {
    _id: string;
}

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await userModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IUserPayload;
        const user = await userModel.findById(decoded._id);

        req.user = user;

        return next();

    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
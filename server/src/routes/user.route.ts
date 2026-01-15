import express, { Router } from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getUserProfile, logoutUser } from '../controllers/User.controller.js';
import { authUser } from '../middleware/auth.middleware.js';

const userRouter: Router = express.Router();

userRouter.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
    body('name').notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('mobile').matches(/^\d{10}$/).withMessage('Mobile number must be 10 digits')
],
    registerUser
);

userRouter.post('/login', [
    body('identifier').notEmpty().withMessage('Email or username is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
],
    loginUser
);

userRouter.get('/profile', authUser, getUserProfile)

userRouter.post('/logout', authUser, logoutUser);

export default userRouter;
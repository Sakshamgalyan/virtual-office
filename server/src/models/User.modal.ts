import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [3, 'Name must be at least 3 characters long.']
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'Username must be at least 3 characters long.']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        minlength: [5, 'Email must be at least 5 characters long.']
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, 'Mobile number must be 10 digits']
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    socketId: {
        type: String,
    },
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = function (): string {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return token;
};

userSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password: string) {
    return await bcrypt.hash(password, 10)
};

const userModel = mongoose.model('user', userSchema);

export default userModel;
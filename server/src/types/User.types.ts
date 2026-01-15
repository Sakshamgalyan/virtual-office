import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    name: string;
    username: string;
    email: string;
    mobile: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    id: string;
    name: string;
    username?: string;
    email: string;
    mobile?: string;
    role: string;
}
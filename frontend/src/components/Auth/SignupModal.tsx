"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Input from "../UI/Input";
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import Button from "../UI/Button";
import Typography from "../UI/Typography";
import SocialCard from "./SocialCard";
import api from "@/lib/apiClient";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

export default function SignupForm({ toggle }: { toggle: () => void }) {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        name: "",
        mobile: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/users/register", formData, {
                successMessage: "Account created successfully!",
            });

            if (data.success && data.user) {
                dispatch(setUser(data.user));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col gap-6"
        >
            <div className="text-left">
                <Typography variant="h2" weight="bold" textColor="text-forest-50">Register</Typography>
                <Typography variant="body1" textColor="text-forest-300">Join the Smart Office workspace today.</Typography>
            </div>

            <SocialCard />

            <div className="flex flex-col gap-4">
                <Input
                    borderRadius="1rem"
                    leftIcon={<Mail className="w-5 h-5" />}
                    label="Email"
                    name="email"
                    placeholder="name@company.com"
                    fullWidth
                    value={formData.email}
                    onChange={handleChange}
                />
                <Input
                    borderRadius="1rem"
                    leftIcon={<User className="w-5 h-5" />}
                    label="Name"
                    name="name"
                    placeholder="Enter your name"
                    fullWidth
                    value={formData.name}
                    onChange={handleChange}
                />
                <Input
                    borderRadius="1rem"
                    leftIcon={<User className="w-5 h-5" />}
                    label="Username"
                    name="username"
                    placeholder="Choose a username"
                    fullWidth
                    value={formData.username}
                    onChange={handleChange}
                />
                <Input
                    borderRadius="1rem"
                    leftIcon={<Phone className="w-5 h-5" />}
                    label="Mobile"
                    name="mobile"
                    placeholder="+1 (555) 000-0000"
                    fullWidth
                    value={formData.mobile}
                    onChange={handleChange}
                />
                <Input
                    borderRadius="1rem"
                    leftIcon={<Lock className="w-5 h-5" />}
                    label="Password"
                    name="password"
                    placeholder="Create a password"
                    type="password"
                    fullWidth
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>

            <Button
                size="lg"
                borderRadius="5rem"
                onClick={handleSignup}
                isloading={isLoading}
                loadingtext="Creating Account..."
            >
                Create Account
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <Typography variant="body1" textColor="text-forest-300" className="mt-6 text-center">Already have an account?
                <Button onClick={toggle} variant="link" size="sm" className="font-bold text-forest-50 text-lg">Login Here</Button>
            </Typography>
        </motion.div>
    );
}
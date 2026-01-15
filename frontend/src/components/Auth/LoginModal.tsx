"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, User, Lock } from "lucide-react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import Typography from "../UI/Typography";
import SocialCard from "./SocialCard";
import api from "@/lib/apiClient";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

export default function LoginForm({ toggle }: { toggle: () => void }) {
    const dispatch = useAppDispatch();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!identifier || !password) {
            if (!identifier) return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post("/users/login", { identifier, password }, {
                successMessage: "Login successful! Welcome back.",
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
            <div className="">
                <Typography
                    variant="h2"
                    weight="bold"
                    textColor="text-forest-50">
                    Login
                </Typography>
                <Typography
                    variant="body1"
                    textColor="text-forest-300">
                    Enter your credentials to access the workspace.
                </Typography>
            </div>

            <SocialCard />

            <div className="flex flex-col gap-4">
                <Input
                    borderRadius="1rem"
                    leftIcon={<User className="w-5 h-5" />}
                    label="Username / Email / Mobile"
                    placeholder="Enter your identifier"
                    fullWidth
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                />
                <Input
                    borderRadius="1rem"
                    leftIcon={<Lock className="w-5 h-5" />}
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />

                <div className="flex justify-end">
                    <Button variant="link">Forgot Password?</Button>
                </div>
            </div>

            <Button
                size="lg"
                borderRadius="5rem"
                onClick={handleLogin}
                isloading={isLoading}
                loadingtext="Logging in..."
            >
                Login to Workspace
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <Typography
                variant="body1"
                textColor="text-forest-300"
                className="mt-6 text-center"
            >
                Don't have an account?{" "}
                <Button
                    onClick={toggle}
                    variant="link"
                    size="sm"
                    className="font-bold text-forest-50 text-lg"
                >
                    Register Now
                </Button>
            </Typography>
        </motion.div>
    );
}
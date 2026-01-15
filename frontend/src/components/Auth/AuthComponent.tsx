"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./LoginModal";
import SignupForm from "./SignupModal";

export default function AuthComponent() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuth = () => setIsLogin(!isLogin);

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-forest-950 font-sans text-forest-50">
            <motion.div
                layout
                className="relative hidden w-1/2 flex-col items-center justify-center bg-forest-50 p-10 text-forest-900 lg:flex lg:w-[60%]"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="absolute left-8 top-8 flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-forest-800" />
                    <div className="text-sm font-bold text-forest-800">
                        SMART OFFICE<br /><span className="text-xs font-normal">WORKSPACE</span>
                    </div>
                </div>

                <div className="relative h-96 w-96">
                    <div className="absolute bottom-0 left-1/2 h-48 w-4 -translate-x-1/2 rounded-full bg-forest-900" />
                    <div className="absolute bottom-32 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-forest-700 blur-sm" />
                    <div className="absolute bottom-20 left-[40%] h-32 w-32 -translate-x-1/2 rounded-full bg-forest-800 opacity-80" />
                    <div className="absolute bottom-40 left-[60%] h-36 w-36 -translate-x-1/2 rounded-full bg-forest-600 opacity-90" />
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="absolute top-10 right-10 h-16 w-16 rounded-xl bg-forest-300 opacity-50 backdrop-blur-md"
                    />
                </div>

                <div className="z-10 mt-10 text-center">
                    <h1 className="text-4xl font-bold text-forest-900">Welcome Back</h1>
                    <p className="mt-4 max-w-md text-lg text-forest-700">
                        Experience the butter-smooth interactions of your new Smart Office environment.
                    </p>
                </div>

                <div className="absolute right-0 top-0 h-full w-24 translate-x-1/2">
                    <svg className="h-full w-full text-forest-950" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 0 C 50 20 20 80 50 100 L 100 100 L 100 0 Z" fill="currentColor" />
                    </svg>
                </div>
            </motion.div>
            <div className="relative z-20 flex w-full flex-col items-center justify-center p-8 lg:w-[40%]">
                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <LoginForm key="login" toggle={toggleAuth} />
                        ) : (
                            <SignupForm key="signup" toggle={toggleAuth} />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
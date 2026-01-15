'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// --- Types ---
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

// --- Event Manager (Simple Observer) ---
type Listener = (toasts: Toast[]) => void;
let toasts: Toast[] = [];
let listeners: Listener[] = [];

const notifyListeners = () => {
    listeners.forEach((listener) => listener([...toasts]));
};

export const toast = {
    show: (message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, message, type, duration };
        toasts = [...toasts, newToast];
        notifyListeners();

        if (duration > 0) {
            setTimeout(() => {
                toast.dismiss(id);
            }, duration);
        }
        return id;
    },
    success: (message: string, duration?: number) => toast.show(message, 'success', duration),
    error: (message: string, duration?: number) => toast.show(message, 'error', duration),
    info: (message: string, duration?: number) => toast.show(message, 'info', duration),
    warning: (message: string, duration?: number) => toast.show(message, 'warning', duration),
    dismiss: (id: string) => {
        toasts = toasts.filter((t) => t.id !== id);
        notifyListeners();
    },
};

// --- Toaster Component ---
export default function Toaster() {
    const [visibleToasts, setVisibleToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const handleChange = (updatedToasts: Toast[]) => {
            setVisibleToasts(updatedToasts);
        };
        listeners.push(handleChange);
        return () => {
            listeners = listeners.filter((l) => l !== handleChange);
        };
    }, []);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-forest-950" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-700" />;
            case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-700" />;
            case 'info': return <Info className="h-5 w-5 text-forest-950" />;
            default: return null;
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 font-dm-sans">
            <AnimatePresence>
                {visibleToasts.map((t) => (
                    <motion.div
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-forest-400 bg-[#8eb69b] p-4 text-forest-950 shadow-lg shadow-forest-900/20"
                        role="alert"
                    >
                        <div className="flex-shrink-0">
                            {getIcon(t.type)}
                        </div>
                        <div className="flex-1 text-sm font-medium">
                            {t.message}
                        </div>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-shrink-0 rounded-full p-1 text-forest-900 hover:bg-forest-900/10 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}


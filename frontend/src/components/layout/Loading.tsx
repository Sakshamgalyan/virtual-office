'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingProps {
    fullScreen?: boolean;
    text?: string;
    className?: string;
    size?: 'small' | 'medium' | 'large';
}

const Loading: React.FC<LoadingProps> = ({
    fullScreen = false,
    text = 'Loading...',
    className,
    size = 'medium',
}) => {
    const sizeClasses = {
        small: 'w-8 h-8 border-2',
        medium: 'w-12 h-12 border-[3px]',
        large: 'w-16 h-16 border-4',
    };

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center z-50 bg-[#051f20]/90',
                fullScreen ? 'fixed inset-0 backdrop-blur-sm' : 'w-full h-full min-h-[200px]',
                className
            )}
        >
            <motion.div
                className={cn(
                    'relative rounded-full border-[#163832] border-t-[#8eb69b]',
                    sizeClasses[size]
                )}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                {/* Inner pulsing dot */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#daf1de] rounded-full"
                    initial={{ width: 0, height: 0, opacity: 0.8 }}
                    animate={{
                        width: size === 'small' ? 4 : size === 'medium' ? 8 : 12,
                        height: size === 'small' ? 4 : size === 'medium' ? 8 : 12,
                        opacity: 0
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                    }}
                />
            </motion.div>

            {text && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-sm font-medium text-[#8eb69b] animate-pulse"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );
};

export default Loading;

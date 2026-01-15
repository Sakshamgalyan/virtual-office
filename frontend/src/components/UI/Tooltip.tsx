'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string;
}

export default function Tooltip({
    content,
    children,
    position = 'top',
    delay = 0.2,
    className,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full',
        bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full',
        left: '-left-2 top-1/2 -translate-y-1/2 -translate-x-full',
        right: '-right-2 top-1/2 -translate-y-1/2 translate-x-full',
    };

    const initialAnimation = {
        top: { opacity: 0, y: 10, x: '-50%' },
        bottom: { opacity: 0, y: -10, x: '-50%' },
        left: { opacity: 0, x: 10, y: '-50%' },
        right: { opacity: 0, x: -10, y: '-50%' },
    };

    const animateAnimation = {
        top: { opacity: 1, y: 0, x: '-50%' },
        bottom: { opacity: 1, y: 0, x: '-50%' },
        left: { opacity: 1, x: 0, y: '-50%' },
        right: { opacity: 1, x: 0, y: '-50%' },
    };

    const exitAnimation = {
        top: { opacity: 0, y: 10, x: '-50%' },
        bottom: { opacity: 0, y: -10, x: '-50%' },
        left: { opacity: 0, x: 10, y: '-50%' },
        right: { opacity: 0, x: -10, y: '-50%' },
    };

    return (
        <div
            className={cn('relative inline-flex', className)}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={initialAnimation[position]}
                        animate={animateAnimation[position]}
                        exit={exitAnimation[position]}
                        transition={{ duration: 0.2, delay }}
                        className={cn(
                            'absolute z-50 whitespace-nowrap rounded-md bg-forest-900 px-2 py-1 text-xs font-medium text-forest-50 shadow-md',
                            positionClasses[position]
                        )}
                    >
                        {content}
                        {/* Arrow (Optional, can be added with pseudo-element or svg) */}
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </div>
    );
}

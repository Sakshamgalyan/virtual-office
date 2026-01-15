'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'circle' | 'dots' | 'pulse';
export type SpinnerSpeed = 'slow' | 'normal' | 'fast';

export interface SpinnerProps {
    /** Size of the spinner */
    size?: SpinnerSize;
    /** Visual style of the spinner */
    variant?: SpinnerVariant;
    /** Animation speed */
    speed?: SpinnerSpeed;
    /** Optional label to display below the spinner */
    label?: string;
    /** Whether to center the spinner in its container */
    centered?: boolean;
    /** Whether to show as a full-screen overlay */
    fullscreen?: boolean;
    /** Thickness of the spinner ring (only for 'circle' variant) */
    thickness?: number;
    /** Accessibility label */
    ariaLabel?: string;
    /** Additional custom classes */
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    variant = 'circle',
    speed = 'normal',
    label,
    centered = false,
    fullscreen = false,
    thickness = 4,
    ariaLabel = 'Loading',
    className,
}) => {

    // Size Configurations
    const sizeMap = {
        xs: { dim: 'w-4 h-4', text: 'text-xs' },
        sm: { dim: 'w-6 h-6', text: 'text-sm' },
        md: { dim: 'w-10 h-10', text: 'text-base' },
        lg: { dim: 'w-16 h-16', text: 'text-lg' },
        xl: { dim: 'w-24 h-24', text: 'text-xl' },
    };

    const currentSize = sizeMap[size];

    // Container Classes
    const containerClasses = cn(
        "flex flex-col items-center justify-center gap-3 z-50",
        centered && "w-full h-full min-h-[100px]", // Minimum height if centered to ensure visibility
        fullscreen && "fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm",
        className
    );

    // Speed Durations (in seconds for Framer Motion / CSS anims)
    const speedMap = {
        slow: 1.5,
        normal: 0.8,
        fast: 0.4,
    };
    const duration = speedMap[speed];

    // Circle Variant Implementation
    const CircleSpinner = () => (
        <svg
            className={cn("animate-spin text-forest-700 dark:text-forest-300", currentSize.dim)}
            style={{ animationDuration: `${duration}s` }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={thickness}
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    // Dots Variant Implementation
    const DotsSpinner = () => (
        <div className="flex space-x-1.5 items-center justify-center">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={cn("rounded-full bg-forest-700 dark:bg-forest-300",
                        size === 'xs' ? 'w-1.5 h-1.5' :
                            size === 'sm' ? 'w-2 h-2' :
                                size === 'md' ? 'w-3 h-3' :
                                    size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
                    )}
                    animate={{
                        y: ["0%", "-100%", "0%"],
                        opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.2, // Stagger effect
                    }}
                />
            ))}
        </div>
    );

    // Pulse Variant Implementation
    const PulseSpinner = () => (
        <motion.div
            className={cn("rounded-full bg-forest-700 dark:bg-forest-300", currentSize.dim)}
            animate={{
                scale: [0.8, 1.1, 0.8],
                opacity: [0.5, 1, 0.5]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    );

    return (
        <div
            className={containerClasses}
            role="status"
            aria-label={ariaLabel}
        >
            {variant === 'circle' && <CircleSpinner />}
            {variant === 'dots' && <DotsSpinner />}
            {variant === 'pulse' && <PulseSpinner />}

            {label && (
                <span className={cn("font-medium text-forest-900 dark:text-forest-50 animate-pulse", currentSize.text)}>
                    {label}
                </span>
            )}
            <span className="sr-only">{ariaLabel}</span>
        </div>
    );
};

export default Spinner;

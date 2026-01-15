'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export type ProgressBarType = 'linear' | 'circular';
export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type ProgressBarSize = 'sm' | 'md' | 'lg' | 'xl';
export type LabelPosition = 'top' | 'bottom' | 'inside' | 'right' | 'center'; // Center for circular

export interface ProgressBarProps {
    /** The current value of the progress */
    value?: number;
    /** The maximum value (default 100) */
    max?: number;
    /** The minimum value (default 0) */
    min?: number;
    /** Visual type of the progress bar */
    type?: ProgressBarType;
    /** Color variant */
    variant?: ProgressBarVariant;
    /** Size of the progress bar */
    size?: ProgressBarSize;
    /** Whether to show the label (percentage or custom text) */
    showLabel?: boolean;
    /** Custom label text. If boolean true, shows rounded percentage. text-string allows custom override. */
    label?: string | boolean;
    /** Position of the label */
    labelPosition?: LabelPosition;
    /** Whether the progress is indeterminate (loading without known end) */
    isIndeterminate?: boolean; // corrected spelling from isintermediate
    /** Whether to show stripe animation */
    isAnimated?: boolean;
    /** Additional class names */
    className?: string;
    /** Custom color string to override variant */
    color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    value = 0,
    max = 100,
    min = 0,
    type = 'linear',
    variant = 'default',
    size = 'md',
    showLabel = false,
    label,
    labelPosition = 'top',
    isIndeterminate = false,
    isAnimated = false,
    className,
    color,
}) => {

    // Normalization
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

    // Display Text
    const labelText = typeof label === 'string' ? label : `${Math.round(percentage)}%`;

    // Colors
    const variantColors: Record<ProgressBarVariant, string> = {
        default: 'bg-forest-700',
        success: 'bg-forest-300', // Using bright sage for success
        warning: 'bg-yellow-500',
        error: 'bg-red-600',
        info: 'bg-blue-500',
    };

    const textColors: Record<ProgressBarVariant, string> = {
        default: 'text-forest-900',
        success: 'text-forest-700',
        warning: 'text-yellow-700',
        error: 'text-red-700',
        info: 'text-blue-700',
    };

    const selectedColor = color || variantColors[variant];
    const selectedTextColor = textColors[variant];

    // LINEAR IMPLEMENTATION
    if (type === 'linear') {
        // Height Mapping
        const heightMap = {
            sm: 'h-1.5',
            md: 'h-2.5',
            lg: 'h-4',
            xl: 'h-6',
        };

        return (
            <div className={cn("w-full flex flex-col gap-1", className)}>
                {/* Top Label */}
                {(showLabel || label) && labelPosition === 'top' && (
                    <div className="flex justify-between text-xs font-medium mb-1 dark:text-gray-300">
                        <span className={selectedTextColor}>{labelText}</span>
                    </div>
                )}

                {/* Bar Container */}
                <div className={cn("w-full bg-gray-200 rounded-full dark:bg-gray-700 overflow-hidden", heightMap[size])}>
                    <motion.div
                        className={cn(
                            "h-full rounded-full flex items-center justify-center transition-all",
                            selectedColor,
                            isAnimated && !isIndeterminate && "animate-[pulse_2s_infinite]", // Simple pulse or custom stripe could be better
                            // Stripe gradient for "animated" look if we want more complex css
                        )}
                        initial={{ width: 0 }}
                        animate={{
                            width: isIndeterminate ? "100%" : `${percentage}%`,
                            x: isIndeterminate ? ["-100%", "100%"] : 0
                        }}
                        transition={isIndeterminate ? {
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear"
                        } : { duration: 0.5, ease: "easeOut" }}
                    >
                        {/* Inside Label */}
                        {(showLabel || label) && labelPosition === 'inside' && size !== 'sm' && (
                            <span className="text-[10px] font-bold text-white px-2 truncate">
                                {labelText}
                            </span>
                        )}
                    </motion.div>
                </div>

                {/* Bottom Label */}
                {(showLabel || label) && labelPosition === 'bottom' && (
                    <div className="flex justify-end mt-1">
                        <span className={cn("text-xs font-medium", selectedTextColor)}>{labelText}</span>
                    </div>
                )}
            </div>
        );
    }

    // CIRCULAR IMPLEMENTATION
    if (type === 'circular') {
        // Size Mapping (Diameter)
        const dimMap = {
            sm: 40,
            md: 80,
            lg: 120,
            xl: 160
        };
        const dimension = dimMap[size];
        const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 8 : 10;
        const radius = (dimension - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className={cn("relative inline-flex items-center justify-center", className)}>
                <svg
                    width={dimension}
                    height={dimension}
                    viewBox={`0 0 ${dimension} ${dimension}`}
                    className={cn("transform -rotate-90", isIndeterminate && "animate-spin")}
                >
                    {/* Track */}
                    <circle
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Progress */}
                    <motion.circle
                        cx={dimension / 2}
                        cy={dimension / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        className={cn(selectedColor.replace('bg-', 'text-'))} // convert bg class to text class for SVG fill/stroke usually
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: isIndeterminate ? [circumference * 0.2, circumference * 0.8] : offset }} // simple indeterminate logic
                        transition={{ duration: isIndeterminate ? 1.5 : 0.5 }}
                        style={{ strokeDasharray: circumference }}
                    />
                </svg>

                {/* Center Text */}
                {(showLabel || label) && (labelPosition === 'center' || labelPosition === 'inside') && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn("font-semibold", selectedTextColor, size === 'sm' ? "text-[10px]" : "text-sm")}>
                            {labelText}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default ProgressBar;

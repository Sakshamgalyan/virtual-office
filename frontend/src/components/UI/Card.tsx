'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export type CardVariant = 'default' | 'filled' | 'outline' | 'ghost';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

export interface CardProps {
    children?: ReactNode;

    // Appearance
    variant?: CardVariant;
    padding?: CardPadding;
    shadow?: CardShadow;
    radius?: CardRadius;
    border?: boolean;
    backgroundColor?: string; // Custom class or hex

    // Behavior
    hoverEffect?: boolean; // Lift and shadow on hover
    onClick?: () => void;

    // Customization
    className?: string;
    customPadding?: string; // e.g. "p-6 py-8"

    // Loading State
    isLoading?: boolean;
    skeletonLines?: number; // Number of text lines to simulate
    skeletonContent?: ReactNode; // Custom loading placeholder
}

const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'md',
    shadow = 'sm',
    radius = 'lg',
    border = true,
    backgroundColor,
    hoverEffect = false,
    onClick,
    className,
    customPadding,
    isLoading = false,
    skeletonLines = 3,
    skeletonContent
}) => {

    // Styles Configuration
    const paddingStyles = {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-6',
        xl: 'p-8',
    }[padding];

    const shadowStyles = {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow',
        lg: 'shadow-md',
        xl: 'shadow-lg',
    }[shadow];

    const radiusStyles = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        full: 'rounded-full',
    }[radius];

    const variantStyles = {
        default: "bg-white dark:bg-forest-950",
        filled: "bg-forest-50 dark:bg-forest-900/50",
        outline: "bg-transparent",
        ghost: "bg-transparent border-none shadow-none",
    }[variant];

    const borderClass = (border && variant !== 'ghost')
        ? "border border-gray-200 dark:border-forest-800"
        : "border border-transparent";

    const computedPadding = customPadding || paddingStyles;

    // Loading Skeleton
    if (isLoading) {
        return (
            <div
                className={cn(
                    "w-full overflow-hidden relative",
                    variantStyles,
                    borderClass,
                    radiusStyles,
                    shadowStyles,
                    computedPadding,
                    className
                )}
            >
                {skeletonContent ? (
                    skeletonContent
                ) : (
                    <div className="animate-pulse space-y-3">
                        {/* Title / Header approximation */}
                        <div className="h-5 bg-gray-200 dark:bg-forest-800 rounded w-1/3 mb-4"></div>
                        {/* Body lines */}
                        {Array.from({ length: Math.max(1, skeletonLines) }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-3 bg-gray-200 dark:bg-forest-800 rounded",
                                    i === skeletonLines - 1 ? "w-2/3" : "w-full"
                                )}
                            ></div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default Content
    const Content = (
        <div
            className={cn(
                "relative transition-all duration-200 w-full overflow-hidden",
                variantStyles,
                // Apply background override if it looks like a class (starts with bg-), otherwise stick to variant. 
                // Actual inline style handled if not a class.
                backgroundColor?.startsWith('bg-') ? backgroundColor : '',
                borderClass,
                radiusStyles,
                shadowStyles,
                computedPadding,
                hoverEffect && !onClick && "hover:shadow-lg hover:-translate-y-1", // Simple CSS hover if not clickable
                onClick && "cursor-pointer active:scale-[0.99]", // Interaction feedback if clickable
                className
            )}
            style={backgroundColor && !backgroundColor.startsWith('bg-') ? { backgroundColor } : undefined}
            onClick={onClick}
        >
            {children}
        </div>
    );

    // If clickable with hover effect, wrap in Motion for smoother interaction
    if (onClick && hoverEffect) {
        return (
            <motion.div
                whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                    "w-full relative overflow-hidden",
                    variantStyles,
                    borderClass,
                    radiusStyles,
                    shadowStyles,
                    computedPadding,
                    className
                )}
                style={backgroundColor && !backgroundColor.startsWith('bg-') ? { backgroundColor } : undefined}
                onClick={onClick}
            >
                <div onClick={(e) => e.stopPropagation()}>{children}</div>
                {/* Note: children wrapped to handle bubbling if needed, but standard card just renders children */}
            </motion.div>
        );
    }

    return Content;
};

export default Card;

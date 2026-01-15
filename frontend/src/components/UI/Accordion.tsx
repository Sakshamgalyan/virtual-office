'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export type AccordionSize = 'sm' | 'md' | 'lg';
export type AccordionVariant = 'default' | 'filled' | 'minimal' | 'separated';
export type ExpandIconPosition = 'left' | 'right';

export interface AccordionProps {
    // Content
    title: ReactNode;
    children: ReactNode;
    subtitle?: ReactNode;
    icon?: ReactNode; // Icon next to title

    // Controlled State
    expanded?: boolean;
    onChange?: (isExpanded: boolean) => void;

    // Uncontrolled State
    defaultExpanded?: boolean;

    // Behavior
    disabled?: boolean;
    unmountOnExit?: boolean;

    // Appearance
    size?: AccordionSize;
    variant?: AccordionVariant;
    expandedIconPosition?: ExpandIconPosition;

    // Customization
    className?: string;
    contentClassName?: string;
}

const Accordion: React.FC<AccordionProps> = ({
    title,
    children,
    subtitle,
    icon,
    expanded,
    onChange,
    defaultExpanded = false,
    disabled = false,
    unmountOnExit = false,
    size = 'md',
    variant = 'default',
    expandedIconPosition = 'right',
    className,
    contentClassName
}) => {
    // State management for uncontrolled mode
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

    // Determine current state (controlled vs uncontrolled)
    const isExpanded = expanded !== undefined ? expanded : internalExpanded;

    const handleToggle = () => {
        if (disabled) return;

        const newState = !isExpanded;
        if (expanded === undefined) {
            setInternalExpanded(newState);
        }
        onChange?.(newState);
    };

    // Styling Maps
    const sizeConfig = {
        sm: { p: 'p-2', px: 'px-3', text: 'text-sm', iconSize: 16, titleGap: 'gap-2' },
        md: { p: 'p-3', px: 'px-4', text: 'text-base', iconSize: 20, titleGap: 'gap-3' },
        lg: { p: 'p-4', px: 'px-5', text: 'text-lg', iconSize: 24, titleGap: 'gap-4' },
    }[size];

    const variantWrapperClasses = {
        default: "border border-gray-200 dark:border-forest-800 rounded-lg bg-white dark:bg-forest-950 overflow-hidden",
        filled: "bg-forest-50 dark:bg-forest-900 rounded-lg border-transparent overflow-hidden",
        minimal: "border-b border-gray-200 dark:border-forest-800 bg-transparent rounded-none",
        separated: "border border-transparent bg-white dark:bg-forest-950 shadow-sm rounded-lg mb-2 last:mb-0", // Adds spacing implies usage in a list, but works independently too
    }[variant];

    const variantHeaderClasses = (expanded: boolean) => {
        if (variant === 'filled' && expanded) return "bg-forest-100 dark:bg-forest-800";
        if (variant === 'default' && expanded) return "bg-gray-50 dark:bg-forest-900/50 border-b border-gray-100 dark:border-forest-800";
        return "hover:bg-gray-50 dark:hover:bg-forest-900/30 transition-colors";
    };

    return (
        <div
            className={cn(
                "w-full transition-all duration-200",
                variantWrapperClasses,
                disabled && "opacity-60 cursor-not-allowed",
                isExpanded && variant !== 'minimal' && variant !== 'filled' && "border-forest-200 dark:border-forest-700", // Subtle highlight when open
                className
            )}
        >
            {/* Header / Summary */}
            <div
                role="button"
                aria-expanded={isExpanded}
                tabIndex={disabled ? -1 : 0}
                onClick={handleToggle}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggle();
                    }
                }}
                className={cn(
                    "flex items-center justify-between w-full cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-forest-300 focus-visible:ring-inset",
                    sizeConfig.p,
                    sizeConfig.px,
                    variantHeaderClasses(isExpanded)
                )}
            >
                <div className={cn("flex items-center flex-1", sizeConfig.titleGap)}>
                    {/* Left Icon (Expand or Custom) */}
                    {expandedIconPosition === 'left' && (
                        <motion.div
                            initial={false}
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-400 dark:text-gray-500"
                        >
                            <ChevronDown size={sizeConfig.iconSize} />
                        </motion.div>
                    )}

                    {icon && (
                        <span className="text-forest-600 dark:text-forest-400">
                            {icon}
                        </span>
                    )}

                    <div className="flex flex-col text-left">
                        <span className={cn("font-medium text-forest-950 dark:text-forest-50", sizeConfig.text)}>
                            {title}
                        </span>
                        {subtitle && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Icon (Expand) */}
                {expandedIconPosition === 'right' && (
                    <motion.div
                        initial={false}
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400 dark:text-gray-500 ml-3"
                    >
                        <ChevronDown size={sizeConfig.iconSize} />
                    </motion.div>
                )}
            </div>

            {/* Content / Detail */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div
                            className={cn(
                                "border-t-0",
                                sizeConfig.p,
                                sizeConfig.px,
                                "text-gray-600 dark:text-gray-300",
                                size === 'sm' ? 'text-sm' : 'text-base',
                                contentClassName
                            )}
                        >
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Accordion;

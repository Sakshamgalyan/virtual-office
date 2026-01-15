'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TabItem {
    id: string | number;
    label: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export type TabVariant = 'classic' | 'button' | 'pill';
export type TabSize = 'sm' | 'md' | 'lg';

export interface TabProps {
    /** Array of tab items to display */
    items: TabItem[];
    /** ID of the currently active tab */
    activeTab: string | number;
    /** Callback when a tab is selected */
    onTabChange: (id: string | number) => void;
    /** Visual style of the tabs */
    variant?: TabVariant;
    /** Size of the tabs */
    size?: TabSize;
    /** Whether tabs should stretch to fill the container width */
    fullWidth?: boolean;
    /** Additional container classes */
    className?: string;
}

const Tab: React.FC<TabProps> = ({
    items,
    activeTab,
    onTabChange,
    variant = 'classic',
    size = 'md',
    fullWidth = false,
    className,
}) => {
    // Size Configurations
    const sizeClasses = {
        sm: 'text-sm px-3 py-1.5 gap-1.5',
        md: 'text-sm px-4 py-2 gap-2',
        lg: 'text-base px-6 py-3 gap-2.5',
    };

    const iconSizes = {
        sm: 16,
        md: 18,
        lg: 20,
    };

    // Container Classes based on variant
    const containerClasses = cn(
        "flex items-center",
        fullWidth ? 'w-full' : 'w-auto',
        variant === 'button' && 'bg-forest-50/50 p-1 rounded-lg', // Segmented control bg
        variant === 'pill' && 'gap-2',
        (variant === 'classic') && 'border-b border-gray-200 w-full',
        className
    );

    return (
        <div className={containerClasses}>
            {items.map((item) => {
                const isActive = activeTab === item.id;
                const isDisabled = item.disabled;

                return (
                    <button
                        key={item.id}
                        onClick={() => !isDisabled && onTabChange(item.id)}
                        disabled={isDisabled}
                        className={cn(
                            "relative flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-300 rounded-md z-10",
                            sizeClasses[size],
                            fullWidth ? 'flex-1' : 'flex-initial',
                            isDisabled && "opacity-50 cursor-not-allowed",

                            // Text Color Logic
                            variant === 'classic' && (isActive ? "text-forest-900" : "text-gray-500 hover:text-forest-700"),
                            variant === 'button' && (isActive ? "text-white" : "text-forest-900 hover:text-forest-700"),
                            variant === 'pill' && (isActive ? "text-white" : "text-forest-900 hover:bg-forest-50")
                        )}
                    >
                        {/* Animations for Active State */}
                        {isActive && !isDisabled && (
                            <>
                                {variant === 'classic' && (
                                    <motion.div
                                        layoutId={`tab-classic-underline-${className || 'default'}`} // using className as part of id to scope if multiple tabs exist
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-700 -mb-[1px]" // -mb-[1px] pushes it onto the border line
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                {variant === 'button' && (
                                    <motion.div
                                        layoutId={`tab-button-bg-${className || 'default'}`}
                                        className="absolute inset-0 bg-forest-700 rounded-md -z-10 shadow-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                {variant === 'pill' && (
                                    <motion.div
                                        layoutId={`tab-pill-bg-${className || 'default'}`}
                                        className="absolute inset-0 bg-forest-700 rounded-full -z-10 shadow-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </>
                        )}

                        {/* Content */}
                        {item.icon && (
                            <span className={cn("inline-flex", isActive && (variant === 'button' || variant === 'pill') ? 'text-white' : '')}>
                                {/* Ensure icon inherits color or force it if needed */}
                                {item.icon}
                            </span>
                        )}
                        <span className="relative z-10">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default Tab;

'use client';

import React, { ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export interface ChipItem {
    label: string;
    value: string | number;
    icon?: ReactNode;
    disabled?: boolean;
}

export type ChipVariant = 'solid' | 'light' | 'outline';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface ChipsProps {
    // Data
    items: ChipItem[];
    selectedChips?: (string | number)[]; // Array of selected value IDs

    // Behavior
    multiselect?: boolean;
    onChipChange?: (values: (string | number)[]) => void;
    clickable?: boolean;

    // Appearance
    variant?: ChipVariant;
    size?: ChipSize;
    color?: string; // Optional custom color override (class name)
    gap?: number;

    // Customization
    className?: string;
    renderItem?: (item: ChipItem, isSelected: boolean) => ReactNode;
}

const Chips: React.FC<ChipsProps> = ({
    items,
    selectedChips = [],
    multiselect = false,
    onChipChange,
    clickable = true,
    variant = 'light',
    size = 'md',
    color,
    gap = 2,
    className,
    renderItem
}) => {

    const handleChipClick = (item: ChipItem) => {
        if (!clickable || item.disabled) return;

        const isSelected = selectedChips.includes(item.value);
        let newSelection: (string | number)[];

        if (multiselect) {
            if (isSelected) {
                newSelection = selectedChips.filter(v => v !== item.value);
            } else {
                newSelection = [...selectedChips, item.value];
            }
        } else {
            // Single select: toggle off if clicking same, or switch to new
            if (isSelected) {
                newSelection = [];
            } else {
                newSelection = [item.value];
            }
        }

        onChipChange?.(newSelection);
    };

    // Style Configurations
    const sizeStyles = {
        sm: { px: 'px-2', py: 'py-0.5', text: 'text-xs', icon: 12, height: 'h-6' },
        md: { px: 'px-3', py: 'py-1', text: 'text-sm', icon: 14, height: 'h-8' },
        lg: { px: 'px-4', py: 'py-1.5', text: 'text-base', icon: 16, height: 'h-10' },
    }[size];

    const getVariantClasses = (isSelected: boolean, isDisabled: boolean) => {
        if (isDisabled) {
            return "bg-gray-100 dark:bg-forest-900/40 text-gray-400 border-transparent cursor-not-allowed";
        }

        switch (variant) {
            case 'solid':
                return isSelected
                    ? "bg-forest-700 text-white border-transparent hover:bg-forest-800"
                    : "bg-gray-200 dark:bg-forest-800 text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-300 dark:hover:bg-forest-700";
            case 'outline':
                return isSelected
                    ? "bg-forest-50 dark:bg-forest-900 border-forest-600 text-forest-700 dark:text-forest-300"
                    : "bg-transparent border-gray-300 dark:border-forest-700 text-gray-600 dark:text-gray-300 hover:border-forest-400";
            case 'light':
            default:
                return isSelected
                    ? "bg-forest-100 dark:bg-forest-800/80 text-forest-800 dark:text-forest-100 border-transparent"
                    : "bg-gray-100 dark:bg-forest-900/60 text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-200 dark:hover:bg-forest-800";
        }
    };

    // Dynamic Gap
    const gapClass = {
        1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
        5: 'gap-5', 6: 'gap-6', 8: 'gap-8'
    }[gap] || 'gap-2';

    return (
        <div className={cn("flex flex-wrap w-full", gapClass, className)}>
            <AnimatePresence>
                {items.map((item) => {
                    const isSelected = selectedChips.includes(item.value);

                    return (
                        <motion.div
                            key={item.value}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => handleChipClick(item)}
                            className={cn(
                                "relative flex items-center justify-center rounded-full border transition-all duration-200 select-none",
                                sizeStyles.height,
                                sizeStyles.px,
                                sizeStyles.text,
                                clickable && !item.disabled ? "cursor-pointer active:scale-95" : "",
                                getVariantClasses(isSelected, !!item.disabled),
                                color // Allow custom overrides if passed
                            )}
                        >
                            {renderItem ? (
                                renderItem(item, isSelected)
                            ) : (
                                <>
                                    {isSelected && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            className="mr-1.5 flex items-center"
                                        >
                                            <Check size={sizeStyles.icon} />
                                        </motion.span>
                                    )}

                                    {item.icon && (
                                        <span className={cn("mr-1.5 opacity-80", isSelected ? "text-current" : "")}>
                                            {item.icon}
                                        </span>
                                    )}

                                    <span className="font-medium truncate max-w-[150px]">
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default Chips;

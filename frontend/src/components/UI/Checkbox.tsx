'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'primary' | 'secondary' | 'success' | 'danger';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
    label?: React.ReactNode;
    checked?: boolean;
    indeterminate?: boolean; // Corrected spelling from 'indetermidate'
    variant?: CheckboxVariant;
    size?: CheckboxSize;
    color?: string; // Custom color override
    isDisabled?: boolean;
    isRequired?: boolean;
    onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
    label,
    checked = false,
    indeterminate = false,
    variant = 'primary',
    size = 'md',
    color,
    isDisabled = false,
    isRequired = false,
    className,
    onChange,
    id,
    ...props
}, ref) => {
    const defaultRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || defaultRef;

    // Handle indeterminate state natively
    useEffect(() => {
        if (resolvedRef.current) {
            resolvedRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate, resolvedRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isDisabled) return;
        onChange?.(e.target.checked, e);
    };

    // Color & Variant Logic
    const variantClasses: Record<CheckboxVariant, string> = {
        primary: 'border-forest-700 data-[state=checked]:bg-forest-700 data-[state=indeterminate]:bg-forest-700 text-white',
        secondary: 'border-forest-300 data-[state=checked]:bg-forest-300 data-[state=indeterminate]:bg-forest-300 text-forest-900',
        success: 'border-green-600 data-[state=checked]:bg-green-600 data-[state=indeterminate]:bg-green-600 text-white',
        danger: 'border-red-600 data-[state=checked]:bg-red-600 data-[state=indeterminate]:bg-red-600 text-white',
    };

    // Size Logic
    const sizeClasses: Record<CheckboxSize, string> = {
        sm: 'h-4 w-4 rounded',
        md: 'h-5 w-5 rounded-md',
        lg: 'h-6 w-6 rounded-md',
    };

    const iconSizes: Record<CheckboxSize, number> = {
        sm: 12,
        md: 14,
        lg: 16,
    };

    // Construct custom style if color prop is present
    const customStyle = color ? {
        borderColor: color,
        backgroundColor: (checked || indeterminate) ? color : 'transparent',
    } : {};

    const genId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={cn("inline-flex items-center gap-2", isDisabled && "opacity-50 cursor-not-allowed", className)}>
            <div className="relative flex items-center">
                <input
                    ref={resolvedRef}
                    id={genId}
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    disabled={isDisabled}
                    required={isRequired}
                    onChange={handleChange}
                    aria-checked={indeterminate ? 'mixed' : checked}
                    {...props}
                />
                <motion.div
                    className={cn(
                        "flex items-center justify-center border-2 transition-colors duration-200 cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-forest-300 peer-focus-visible:ring-offset-2",
                        sizeClasses[size],
                        !color && (
                            (checked || indeterminate)
                                ? variantClasses[variant]
                                : "border-gray-300 bg-white dark:bg-forest-950 dark:border-forest-700 hover:border-forest-400"
                        )
                    )}
                    style={customStyle}
                    initial={false}
                    animate={checked || indeterminate ? "checked" : "unchecked"}
                    whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                >
                    <AnimatePresence initial={false} mode='wait'>
                        {indeterminate ? (
                            <motion.div
                                key="indeterminate"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.1 }}
                            >
                                <Minus size={iconSizes[size]} strokeWidth={3} />
                            </motion.div>
                        ) : checked ? (
                            <motion.div
                                key="checked"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.1 }}
                            >
                                <Check size={iconSizes[size]} strokeWidth={3} />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </motion.div>
            </div>

            {label && (
                <label
                    htmlFor={genId}
                    className={cn(
                        "cursor-pointer select-none font-medium text-gray-700 dark:text-gray-200",
                        size === 'sm' && "text-xs",
                        size === 'md' && "text-sm",
                        size === 'lg' && "text-base",
                        isDisabled && "cursor-not-allowed"
                    )}
                >
                    {label}
                    {isRequired && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
        </div>
    );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;

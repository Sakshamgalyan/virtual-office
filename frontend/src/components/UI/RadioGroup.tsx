'use client';

import React, { useState, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface RadioOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface RadioGroupProps {
    /** Array of options to display */
    options: RadioOption[];
    /** Group name attribute */
    name?: string;
    /** Selected value (controlled) */
    value?: string | number;
    /** Default selected value (uncontrolled) */
    defaultValue?: string | number;
    /** Callback when selection changes */
    onChange?: (value: string | number) => void;
    /** Size of the radio buttons */
    size?: 'sm' | 'md' | 'lg';
    /** Layout orientation */
    orientation?: 'horizontal' | 'vertical';
    /** Main label for the group */
    label?: string;
    /** Helper text displayed below the group */
    helperText?: string;
    /** Error state styling */
    hasError?: boolean;
    /** Disable the entire group */
    isDisabled?: boolean;
    /** Mark as required */
    isRequired?: boolean;
    /** Additional container classes */
    className?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
    options,
    name,
    value,
    defaultValue,
    onChange,
    size = 'md',
    orientation = 'vertical',
    label,
    helperText,
    hasError = false,
    isDisabled = false,
    isRequired = false,
    className,
}) => {
    // Generate unique ID prefix if name not provided
    const uniqueId = useId();
    const groupName = name || `radio-group-${uniqueId}`;

    // Internal state for uncontrolled usage
    const [internalValue, setInternalValue] = useState<string | number | undefined>(
        defaultValue
    );

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (val: string | number) => {
        if (isDisabled) return;

        if (!isControlled) {
            setInternalValue(val);
        }

        if (onChange) {
            onChange(val);
        }
    };

    // Size Configuration
    const sizeConfig = {
        sm: { circle: 'w-4 h-4', dot: 'w-2 h-2', text: 'text-sm' },
        md: { circle: 'w-5 h-5', dot: 'w-2.5 h-2.5', text: 'text-base' },
        lg: { circle: 'w-6 h-6', dot: 'w-3 h-3', text: 'text-lg' },
    };

    const currentSize = sizeConfig[size];

    return (
        <div className={cn("flex flex-col gap-2", className)} role="radiogroup" aria-labelledby={`${groupName}-label`}>
            {label && (
                <label
                    id={`${groupName}-label`}
                    className={cn(
                        "font-medium transition-colors",
                        size === 'sm' ? "text-sm" : "text-base", // Label size scaling? Usually label stays defined or slight scale.
                        isDisabled ? "text-gray-400" : (hasError ? "text-red-500" : "text-forest-900")
                    )}
                >
                    {label}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className={cn(
                "flex",
                orientation === 'vertical' ? "flex-col gap-3" : "flex-row gap-4 flex-wrap"
            )}>
                {options.map((option) => {
                    const isSelected = currentValue === option.value;
                    const isOptionDisabled = isDisabled || option.disabled;
                    const optionId = `${groupName}-${option.value}`;

                    return (
                        <label
                            key={option.value}
                            htmlFor={optionId}
                            className={cn(
                                "inline-flex items-center cursor-pointer group select-none transition-opacity",
                                isOptionDisabled && "cursor-not-allowed opacity-50"
                            )}
                        >
                            {/* Radio Circle Input Wrapper */}
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="radio"
                                    id={optionId}
                                    name={groupName}
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={() => handleChange(option.value)}
                                    disabled={isOptionDisabled}
                                    className="sr-only" // Hide default radio
                                />

                                {/* Custom Radio Circle */}
                                <div
                                    className={cn(
                                        "rounded-full border transition-all duration-200 ease-in-out flex items-center justify-center bg-white dark:bg-black",
                                        currentSize.circle,
                                        hasError
                                            ? (isSelected ? "border-red-500" : "border-red-300")
                                            : (isSelected ? "border-forest-700" : "border-gray-300 group-hover:border-forest-300"),
                                        // Focus ring for accessibility on the wrapper since input is hidden. 
                                        // Wait, handling focus on custom inputs is tricky. 
                                        // Usually better to leave input visible but opactiy 0 on top, OR use focus-within on wrapper.
                                    )}
                                >
                                    {isSelected && (
                                        <motion.div
                                            layoutId={`${groupName}-dot`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            className={cn(
                                                "rounded-full",
                                                currentSize.dot,
                                                hasError ? "bg-red-500" : "bg-forest-700"
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Label Text */}
                            <span className={cn(
                                "ml-2 font-dm-sans transition-colors",
                                currentSize.text,
                                isOptionDisabled ? "text-gray-400" : "text-gray-700 dark:text-gray-200",
                                isSelected && !isOptionDisabled && "text-forest-900 dark:text-forest-50 font-medium"
                            )}>
                                {option.label}
                            </span>
                        </label>
                    );
                })}
            </div>

            {helperText && (
                <p className={cn(
                    "text-xs transition-colors",
                    hasError ? "text-red-500" : "text-gray-500"
                )}>
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default RadioGroup;

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

export interface ToggleProps {
    /** current state of the toggle */
    checked: boolean;
    /** callback when state changes */
    onChange: (checked: boolean) => void;
    /** Optional label text to display next to the toggle */
    label?: string;
    /** Whether to show icons (Check/X) inside the toggle thumb */
    withIcon?: boolean;
    /** disbaled state */
    isDisabled?: boolean;
    /** Additional class names */
    className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
    checked,
    onChange,
    label,
    withIcon = false,
    isDisabled = false,
    className,
}) => {
    const handleToggle = () => {
        if (!isDisabled) {
            onChange(!checked);
        }
    };

    return (
        <div className={cn("inline-flex items-center gap-2", className)}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={handleToggle}
                disabled={isDisabled}
                className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-300 focus-visible:ring-offset-2",
                    checked ? "bg-forest-700" : "bg-gray-200 hover:bg-gray-300",
                    isDisabled && "cursor-not-allowed opacity-50"
                )}
            >
                <span className="sr-only">{label || 'Toggle'}</span>
                <span
                    className={cn(
                        "pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                >
                    {withIcon && (
                        <span className="h-3.5 w-3.5">
                            {checked ? (
                                <Check className="h-full w-full text-forest-700" strokeWidth={3} />
                            ) : (
                                <X className="h-full w-full text-gray-400" strokeWidth={3} />
                            )}
                        </span>
                    )}
                </span>
            </button>
            {label && (
                <label
                    onClick={handleToggle}
                    className={cn(
                        "cursor-pointer select-none text-sm font-medium text-forest-950",
                        isDisabled && "cursor-not-allowed opacity-50"
                    )}
                >
                    {label}
                </label>
            )}
        </div>
    );
};

export default Toggle;

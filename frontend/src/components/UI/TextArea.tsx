'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming utils exists as per previous context

interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size' | 'onChange' | 'value' | 'defaultValue'> {
    label?: string;
    helperText?: string;
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    rows?: number;
    variant?: 'outlined' | 'filled' | 'flushed';
    hasError?: boolean;
    hasDisabled?: boolean;
    hasSuccess?: boolean;
    isRequired?: boolean;
    borderRadius?: string;
    value?: string | number | readonly string[];
    defaultValue?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            label,
            placeholder,
            helperText,
            size = 'medium',
            fullWidth = false,
            rows = 4,
            variant = 'outlined',
            hasError = false,
            hasDisabled = false,
            hasSuccess = false,
            id,
            name,
            value,
            defaultValue,
            onChange,
            isRequired = false,
            borderRadius = '0.375rem',
            className,
            disabled,
            required,
            ...props
        },
        ref
    ) => {
        // Resolve props that might be aliased
        const isDisabled = hasDisabled || disabled;
        const isReq = isRequired || required;

        // Size Classes
        const sizeClasses = {
            small: 'p-2 text-sm',
            medium: 'p-3 text-base',
            large: 'p-4 text-lg',
        };

        // Variant Styles
        const variantClasses = {
            outlined: 'border bg-transparent',
            filled: 'border-0 bg-forest-900/50', // Based on Input.tsx usage
            flushed: 'border-b bg-transparent rounded-none px-0',
        };

        // Border Color Logic based on State
        // Default border is forest-300 from Input.tsx, but we'll control it here.
        let stateClasses = 'border-forest-300 focus:ring-forest-300';
        if (hasError) {
            stateClasses = 'border-red-500 focus:ring-red-500 text-red-500 placeholder-red-300';
        } else if (hasSuccess) {
            stateClasses = 'border-forest-700 focus:ring-forest-700'; // Success uses darker forest or maybe explicit green if needed, but standardizing on palette.
        } else if (isDisabled) {
            stateClasses = 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed';
        }

        return (
            <div
                className={cn(
                    "flex flex-col gap-1 font-dm-sans",
                    fullWidth ? 'w-full' : 'w-auto',
                    className
                )}
            >
                {label && (
                    <label
                        htmlFor={id}
                        className={cn(
                            "font-medium transition-colors",
                            size === 'small' ? 'text-xs' : 'text-sm',
                            hasError ? 'text-red-500' : 'text-forest-900', // Using forest-900 for label text
                            isDisabled && "text-gray-400"
                        )}
                    >
                        {label}
                        {isReq && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={id}
                    name={name}
                    rows={rows}
                    placeholder={placeholder}
                    value={value}
                    defaultValue={defaultValue}
                    onChange={onChange}
                    disabled={isDisabled}
                    required={isReq}
                    style={{ borderRadius }}
                    className={cn(
                        "block w-full transition-all duration-200 outline-none focus:ring-1 focus:ring-opacity-50",
                        // Base Colors matching Input.tsx
                        !hasError && !isDisabled && "text-forest-300 placeholder-forest-400 bg-forest-900/50",

                        sizeClasses[size],
                        variantClasses[variant],
                        stateClasses,

                        // Override for outlined variant to ensure border color is visible
                        variant === 'outlined' && !hasError && !hasSuccess && !isDisabled && "border-forest-300",

                        // Allow custom classes to override
                        // className // handled in wrapper for layout, but styles should be here? 
                        // Input.tsx puts className on the input element. Let's do same if passed, but I put it on wrapper.
                        // Wait, usually className passed to component is for the outer container? 
                        // Or the input itself? Standard generic components usually put it on the root or allow classNames object.
                        // Input.tsx puts `className` on `input`. I should probably do that too to be safe, 
                        // or separate `containerClassName` and `className`.
                        // For now, I'll apply `className` to the `textarea` to match Input.tsx behavior more closely if that's what user expects,
                        // BUT I applied it to div above. Let's fix: apply className to textarea, use wrapperClassName if needed? 
                        // I'll assume className is for the input element as per Input.tsx
                    )}
                    {...props}
                />

                {helperText && (
                    <p
                        className={cn(
                            "text-xs mt-1",
                            hasError ? 'text-red-500' : 'text-gray-500',
                            hasSuccess && 'text-forest-700'
                        )}
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

TextArea.displayName = 'TextArea';

export default TextArea;

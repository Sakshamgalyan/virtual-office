import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'indo' | 'link';
    size?: 'sm' | 'md' | 'lg';
    fullwidth?: boolean;
    outline?: boolean;
    preicon?: ReactNode;
    posticon?: ReactNode;
    isloading?: boolean;
    loadingtext?: string;
    disabled?: boolean;
    borderRadius?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    fullwidth = false,
    outline = false,
    preicon,
    posticon,
    isloading = false,
    loadingtext = 'Loading...',
    disabled,
    borderRadius,
    ...props
}) => {
    // Base classes always applied
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    // Variant mappings
    const variants = {
        primary: 'bg-forest-300 text-forest-950 hover:bg-forest-50 hover:shadow-lg hover:shadow-forest-300/20 active:scale-95 focus:ring-forest-700',
        secondary: 'bg-forest-50 text-forest-900 hover:bg-forest-300 focus:ring-forest-300', // Adjusted secondary to be lighter base
        tertiary: 'bg-forest-800 text-white hover:bg-forest-900 focus:ring-forest-800',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
        indo: 'bg-forest-950 text-white hover:bg-forest-900 focus:ring-forest-950',
        link: 'text-forest-300 underline-offset-4 hover:underline hover:text-white bg-transparent shadow-none',
    };

    // Outline variant mappings override
    const outlineVariants = {
        primary: 'border-2 border-forest-700 text-forest-700 bg-transparent hover:bg-forest-50',
        secondary: 'border-2 border-forest-300 text-forest-800 bg-transparent hover:bg-forest-50',
        tertiary: 'border-2 border-forest-800 text-forest-800 bg-transparent hover:bg-forest-50',
        warning: 'border-2 border-yellow-500 text-yellow-600 bg-transparent hover:bg-yellow-50',
        danger: 'border-2 border-red-600 text-red-600 bg-transparent hover:bg-red-50',
        indo: 'border-2 border-forest-950 text-forest-950 bg-transparent hover:bg-forest-50',
        link: '', // No outline for link
    };

    // Size mappings
    const sizes = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
    };

    // Resolve final variant classes
    let variantClasses = variants[variant];
    if (outline && variant !== 'link') {
        variantClasses = outlineVariants[variant];
    }

    return (
        <button
            className={cn(
                baseClasses,
                variantClasses,
                sizes[size],
                fullwidth && 'w-full',
                className
            )}
            style={{ borderRadius }}
            disabled={disabled || isloading}
            {...props}
        >
            {isloading ? (
                <>
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    {loadingtext}
                </>
            ) : (
                <>
                    {preicon && <span className="mr-2 flex items-center">{preicon}</span>}
                    {children}
                    {posticon && <span className="ml-2 flex items-center">{posticon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;

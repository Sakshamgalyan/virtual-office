import React, { forwardRef } from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    helperText?: string;
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    hasError?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    onClickLeftIcon?: () => void;
    onClickRightIcon?: () => void;
    borderRadius?: string;
    borderColor?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            helperText,
            size = 'medium',
            fullWidth = false,
            type = 'text',
            hasError = false,
            disabled = false,
            leftIcon,
            rightIcon,
            onClickLeftIcon,
            onClickRightIcon,
            className,
            id,
            borderRadius = '0.375rem', // default tailwind rounded-md
            borderColor = '#8eb69b',
            ...props
        },
        ref
    ) => {
        // Size configurations
        const sizeClasses = {
            small: 'py-1 text-sm',
            medium: 'py-2 text-base',
            large: 'py-3 text-lg',
        };

        const iconSizeClasses = {
            small: 'w-4 h-4',
            medium: 'w-5 h-5',
            large: 'w-6 h-6',
        };

        return (
            <div className={`${fullWidth ? 'w-full' : 'w-auto'} flex flex-col gap-1 font-dm-sans`}>
                {label && (
                    <label
                        htmlFor={id}
                        className={`font-medium ${disabled ? 'text-gray-400' : hasError ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                            } ${size === 'small' ? 'text-xs' : 'text-sm'}`}
                    >
                        {label}
                    </label>
                )}

                <div className="relative flex items-center">
                    {leftIcon && (
                        <button
                            type="button"
                            onClick={onClickLeftIcon}
                            disabled={disabled || !onClickLeftIcon}
                            className={`absolute left-3 text-gray-500 flex items-center justify-center ${onClickLeftIcon ? 'cursor-pointer hover:text-gray-700' : 'cursor-default'
                                }`}
                        >
                            <span className={iconSizeClasses[size]}>{leftIcon}</span>
                        </button>
                    )}

                    <input
                        ref={ref}
                        id={id}
                        type={type}
                        disabled={disabled}
                        style={{
                            borderColor: hasError ? 'red' : borderColor,
                            borderRadius: borderRadius,
                        }}
                        className={`
              block 
              bg-transparent
              border
              border-forest-300
              ${leftIcon ? 'pl-10' : 'pl-3'} 
              ${rightIcon ? 'pr-10' : 'pr-3'} 
              ${sizeClasses[size]} 
              ${fullWidth ? 'w-full' : 'w-auto'}
              text-forest-300 
              group-focus-within:text-forest-50
              transition-colors
              placeholder-forest-400
              focus:outline-none 
              focus:ring-1
              focus:ring-opacity-50
              duration-200
              ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-forest-900/50'}
              ${className || ''}
            `}
                        {...props}
                    />

                    {rightIcon && (
                        <button
                            type="button"
                            onClick={onClickRightIcon}
                            disabled={disabled || !onClickRightIcon}
                            className={`absolute right-3 text-gray-500 flex items-center justify-center ${onClickRightIcon ? 'cursor-pointer hover:text-gray-700' : 'cursor-default'
                                }`}
                        >
                            <span className={iconSizeClasses[size]}>{rightIcon}</span>
                        </button>
                    )}
                </div>

                {helperText && (
                    <p
                        className={`text-xs ${hasError ? 'text-red-500' : 'text-gray-500'
                            }`}
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Info,
    X,
    LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success' | 'neutral';
export type BannerStyle = 'solid' | 'border' | 'subtle';
export type BannerSize = 'sm' | 'md' | 'lg';

export interface BannerProps {
    /** The type of banner to display */
    variant?: BannerVariant;
    /** Visual style of the banner */
    bannerstyle?: BannerStyle;
    /** Main title text */
    title?: string;
    /** Secondary description text */
    description?: string;
    /** Size of the banner padding and text */
    size?: BannerSize;
    /** Custom icon to override default based on variant. Pass null to hide icon. */
    icon?: React.ReactNode | null;
    /** Action button or element to display */
    button?: React.ReactNode;
    /** Whether the banner takes full width (removes rounded corners) */
    fullwidth?: boolean;
    /** Whether the banner can be dismissed */
    dismissible?: boolean;
    /** Callback when banner is dismissed */
    onDismiss?: () => void;
    /** Additional CSS classes */
    className?: string;
}

const defaultIcons: Record<BannerVariant, LucideIcon> = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    success: CheckCircle,
    neutral: Info,
};

const Banner: React.FC<BannerProps> = ({
    variant = 'info',
    bannerstyle = 'subtle',
    title,
    description,
    size = 'md',
    icon,
    button,
    fullwidth = false,
    dismissible = false,
    onDismiss,
    className,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    // Base classes and layout
    const baseClasses = 'relative flex items-start w-full transition-all overflow-hidden';
    const roundedClasses = fullwidth ? '' : 'rounded-lg';

    // Variant Styles Configuration
    // We use the custom Forest palette for Success/Neutral where appropriate, 
    // and standard functional colors for others (Tailwind defaults).
    const styles: Record<
        BannerVariant,
        Record<BannerStyle, { container: string; icon: string; title: string; desc: string; close: string }>
    > = {
        info: {
            solid: {
                container: 'bg-blue-600 text-white border-transparent',
                icon: 'text-white',
                title: 'text-white font-semibold',
                desc: 'text-blue-50',
                close: 'text-blue-100 hover:bg-blue-700',
            },
            subtle: {
                container: 'bg-blue-50 text-blue-900 border border-blue-100', // added border for definition
                icon: 'text-blue-600',
                title: 'text-blue-900 font-semibold',
                desc: 'text-blue-700',
                close: 'text-blue-500 hover:bg-blue-100',
            },
            border: {
                container: 'bg-transparent border-l-4 border-blue-600 text-blue-900', // Left border style usually looks good for "border" variant
                icon: 'text-blue-600',
                title: 'text-blue-900 font-semibold',
                desc: 'text-blue-700',
                close: 'text-blue-400 hover:bg-blue-50',
            },
        },
        success: {
            // Using Forest Palette
            // Forest-300 is bright sage (#8EB69B), Forest-700 is distinct green.
            solid: {
                container: 'bg-forest-700 text-white border-transparent',
                icon: 'text-white',
                title: 'text-white font-semibold',
                desc: 'text-forest-50',
                close: 'text-forest-300 hover:bg-forest-800',
            },
            subtle: {
                container: 'bg-forest-50 text-forest-950 border border-forest-300/30',
                icon: 'text-forest-700',
                title: 'text-forest-900 font-semibold',
                desc: 'text-forest-800',
                close: 'text-forest-700 hover:bg-forest-300/20',
            },
            border: {
                container: 'bg-transparent border-l-4 border-forest-300 text-forest-950',
                icon: 'text-forest-700',
                title: 'text-forest-900 font-semibold',
                desc: 'text-forest-800',
                close: 'text-forest-400 hover:bg-forest-50',
            },
        },
        warning: {
            solid: {
                container: 'bg-amber-500 text-white border-transparent',
                icon: 'text-white',
                title: 'text-white font-semibold',
                desc: 'text-amber-50',
                close: 'text-amber-100 hover:bg-amber-600',
            },
            subtle: {
                container: 'bg-amber-50 text-amber-900 border border-amber-100',
                icon: 'text-amber-600',
                title: 'text-amber-900 font-semibold',
                desc: 'text-amber-800',
                close: 'text-amber-600 hover:bg-amber-100',
            },
            border: {
                container: 'bg-transparent border-l-4 border-amber-500 text-amber-900',
                icon: 'text-amber-500',
                title: 'text-amber-900 font-semibold',
                desc: 'text-amber-800',
                close: 'text-amber-400 hover:bg-amber-50',
            },
        },
        error: {
            solid: {
                container: 'bg-red-600 text-white border-transparent',
                icon: 'text-white',
                title: 'text-white font-semibold',
                desc: 'text-red-50',
                close: 'text-red-100 hover:bg-red-700',
            },
            subtle: {
                container: 'bg-red-50 text-red-900 border border-red-100',
                icon: 'text-red-600',
                title: 'text-red-900 font-semibold',
                desc: 'text-red-700',
                close: 'text-red-500 hover:bg-red-100',
            },
            border: {
                container: 'bg-transparent border-l-4 border-red-600 text-red-900',
                icon: 'text-red-600',
                title: 'text-red-900 font-semibold',
                desc: 'text-red-700',
                close: 'text-red-400 hover:bg-red-50',
            },
        },
        neutral: {
            solid: {
                container: 'bg-gray-800 text-white border-transparent',
                icon: 'text-gray-400',
                title: 'text-white font-semibold',
                desc: 'text-gray-300',
                close: 'text-gray-400 hover:bg-gray-700',
            },
            subtle: {
                container: 'bg-gray-100 text-gray-900 border border-gray-200',
                icon: 'text-gray-500',
                title: 'text-gray-900 font-semibold',
                desc: 'text-gray-600',
                close: 'text-gray-500 hover:bg-gray-200',
            },
            border: {
                container: 'bg-transparent border-l-4 border-gray-500 text-gray-900',
                icon: 'text-gray-500',
                title: 'text-gray-900 font-semibold',
                desc: 'text-gray-600',
                close: 'text-gray-400 hover:bg-gray-100',
            },
        },
    };

    const selectedStyle = styles[variant][bannerstyle];


    // Size Configurations
    const sizeClasses: Record<BannerSize, string> = {
        sm: 'p-3 text-sm gap-3',
        md: 'p-4 text-sm gap-4',
        lg: 'p-6 text-base gap-5',
    };

    const iconSizes: Record<BannerSize, number> = {
        sm: 18,
        md: 22,
        lg: 26,
    };

    // Border variant handling: The configuration uses border-l-4 for "border" style.
    // We might want full border for "solid" or "subtle" (handled in config)
    // but "border" style usually implies a cleaner look with just one accent.

    // Icon Resolution
    const IconComponent = defaultIcons[variant];
    // If icon is undefined, use default. If null, show nothing.
    const resolvedIcon = icon === undefined ? <IconComponent size={iconSizes[size]} /> : icon;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        baseClasses,
                        roundedClasses,
                        sizeClasses[size],
                        selectedStyle.container,
                        className
                    )}
                    role="alert"
                >
                    {/* Icon Section */}
                    {resolvedIcon && (
                        <div className={cn('flex-shrink-0', selectedStyle.icon, 'mt-0.5')}>
                            {resolvedIcon}
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                        {title && <h3 className={cn('block mb-1', selectedStyle.title)}>{title}</h3>}
                        {description && (
                            <div className={cn('text-pretty', selectedStyle.desc)}>
                                {description}
                            </div>
                        )}
                        {button && (
                            <div className="mt-3">
                                {button}
                            </div>
                        )}
                    </div>

                    {/* Dismiss Button */}
                    {dismissible && (
                        <div className="flex-shrink-0 ml-4">
                            <button
                                onClick={handleDismiss}
                                className={cn(
                                    'rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-current focus:ring-inherit',
                                    selectedStyle.close
                                )}
                                aria-label="Dismiss"
                            >
                                <X size={size === 'lg' ? 24 : 18} />
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Banner;

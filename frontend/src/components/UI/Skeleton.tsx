'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Visual variant of the skeleton */
    variant?: 'circle' | 'rectangular' | 'rounded' | 'text';
    /** Width of the skeleton */
    width?: string | number;
    /** Height of the skeleton */
    height?: string | number;
    /** Animation type */
    animation?: 'pulse' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'rounded',
    width,
    height,
    animation = 'pulse',
    className,
    style,
    ...props
}) => {

    const baseClasses = cn(
        "bg-forest-50/80 dark:bg-forest-900/40", // Using forest palette placeholders
        animation === 'pulse' && "animate-pulse",
        className
    );

    const variantClasses = {
        circle: "rounded-full",
        rectangular: "rounded-none",
        rounded: "rounded-md",
        text: "rounded mt-1 mb-1 h-4 w-full origin-left scale-y-75", // mimics text line
    };

    return (
        <div
            className={cn(baseClasses, variantClasses[variant])}
            style={{
                width: width,
                height: height,
                ...style,
            }}
            {...props}
        />
    );
};

export default Skeleton;

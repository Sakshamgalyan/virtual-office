import React, { ElementType, HTMLAttributes, ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption';
type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
    variant?: Variant;
    component?: ElementType;
    size?: string; // Accepts tailwind text sizes (e.g., 'text-lg') or custom values
    weight?: FontWeight;
    align?: TextAlign;
    margin?: string; // Accepts tailwind margin classes (e.g., 'mb-4')
    textColor?: string; // Accepts tailwind color classes (e.g., 'text-forest-900') or hex codes
    children: ReactNode;
    className?: string;
}

const variantMapping: Record<Variant, ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
};

const variantStyles: Record<Variant, string> = {
    h1: 'text-4xl md:text-5xl font-bold',
    h2: 'text-3xl md:text-4xl font-bold',
    h3: 'text-2xl md:text-3xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg md:text-xl font-semibold',
    h6: 'text-base md:text-lg font-semibold',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs',
};

const weightStyles: Record<FontWeight, string> = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
};

const alignStyles: Record<TextAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
};

const Typography = ({
    variant = 'body1',
    component,
    size,
    weight,
    align = 'left',
    margin,
    textColor,
    className,
    children,
    ...props
}: TypographyProps) => {
    const Component = component || variantMapping[variant] || 'p';

    // Handle textColor: if it starts with #, treat as hex style, otherwise as class
    const isHexColor = textColor?.startsWith('#');
    const colorClass = !isHexColor && textColor ? textColor : 'text-forest-900'; // Default to a dark forest color if no color provided, or use inheritance? Usually inheritance is better, but user specified colors. I'll default to inheriting or standard text color if not provided. Let's stick to no default class for flexibility, or maybe 'text-forest-950' as the primary text color based on the palette prompt.
    // Actually, let's leave default empty to inherit from parent, unless 'text-gray-900' or similar is standard.
    // Given the user specifically gave a palette, maybe they want these available properties to default to something nice.
    // However, for a generic component, it's safer to not enforce color unless specified.

    return (
        <Component
            className={cn(
                variantStyles[variant],
                weight && weightStyles[weight],
                align && alignStyles[align],
                margin,
                size, // Allow explicit size override or addition
                !isHexColor && textColor, // Apply color class if not hex
                className
            )}
            style={{
                ...(isHexColor ? { color: textColor } : {}),
                ...props.style
            }}
            {...props}
        >
            {children}
        </Component>
    );
};

export default Typography;

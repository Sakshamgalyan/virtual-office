'use client';

import React, { ReactNode } from 'react';
import { ChevronRight, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export interface BreadCrumbItem {
    id: string | number;
    label: ReactNode;
    href?: string;
    icon?: ReactNode;
    active?: boolean;
}

export type BreadCrumbSize = 'sm' | 'md' | 'lg';
export type BreadCrumbVariant = 'default' | 'contained' | 'minimal';

export interface BreadCrumbProps {
    items: BreadCrumbItem[];
    separator?: ReactNode;
    onItemClick?: (item: BreadCrumbItem) => void;

    // Back Button
    showBackButton?: boolean;
    onBackClick?: () => void;

    // Appearance
    size?: BreadCrumbSize;
    variant?: BreadCrumbVariant;
    className?: string;
}

const BreadCrumb: React.FC<BreadCrumbProps> = ({
    items,
    separator,
    onItemClick,
    showBackButton = false,
    onBackClick,
    size = 'md',
    variant = 'default',
    className
}) => {

    // Styles
    const sizeConfig = {
        sm: { text: 'text-xs', icon: 14, gap: 'gap-1.5' },
        md: { text: 'text-sm', icon: 16, gap: 'gap-2' },
        lg: { text: 'text-base', icon: 18, gap: 'gap-3' },
    }[size];

    const variantClasses = {
        default: "bg-transparent",
        contained: "bg-gray-100 dark:bg-forest-900/40 px-4 py-2 rounded-lg border border-gray-200 dark:border-forest-800",
        minimal: "border-b border-gray-100 dark:border-forest-800 pb-2 px-1"
    }[variant];

    const DefaultSeparator = <ChevronRight size={size === 'sm' ? 12 : 14} className="text-gray-400" />;
    const separatorIcon = separator || DefaultSeparator;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn(
                "flex items-center w-full",
                sizeConfig.gap,
                variantClasses,
                className
            )}
        >
            {/* Back Button */}
            {showBackButton && (
                <div className="flex items-center pr-2 border-r border-gray-300 dark:border-forest-700 mr-2">
                    <button
                        onClick={onBackClick}
                        className="p-1 hover:bg-forest-100 dark:hover:bg-forest-800 rounded-full text-forest-700 dark:text-forest-200 transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={sizeConfig.icon} />
                    </button>
                </div>
            )}

            <ol className="flex items-center flex-wrap gap-1 md:gap-2">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isActive = item.active ?? isLast;

                    // Render Content
                    const Content = (
                        <div className="flex items-center gap-1.5">
                            {item.icon && (
                                <span className={isActive ? "text-current" : "text-gray-400"}>
                                    {item.icon}
                                </span>
                            )}
                            <span>{item.label}</span>
                        </div>
                    );

                    return (
                        <li key={item.id} className="flex items-center">
                            {/* Separator (before item if not first) */}
                            {index > 0 && (
                                <span
                                    className="mx-1 md:mx-2 select-none text-gray-400"
                                    aria-hidden="true"
                                >
                                    {separatorIcon}
                                </span>
                            )}

                            {/* Item */}
                            {isActive ? (
                                <span
                                    className={cn(
                                        "font-semibold text-forest-900 dark:text-forest-50",
                                        sizeConfig.text
                                    )}
                                    aria-current="page"
                                >
                                    {Content}
                                </span>
                            ) : (
                                <div
                                    className={cn(
                                        "text-gray-500 dark:text-gray-400 hover:text-forest-700 dark:hover:text-forest-300 transition-colors cursor-pointer",
                                        sizeConfig.text
                                    )}
                                    onClick={() => onItemClick ? onItemClick(item) : undefined}
                                >
                                    {item.href ? (
                                        <Link href={item.href} className="flex items-center">
                                            {Content}
                                        </Link>
                                    ) : (
                                        <div role="button" tabIndex={0} className="flex items-center">
                                            {Content}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BreadCrumb;

'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuItem {
    id: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
    children?: MenuItem[];
    href?: string; // Optional link
}

export type MenuOrientation = 'vertical' | 'horizontal';
export type MenuSize = 'sm' | 'md' | 'lg';
export type MenuVariant = 'default' | 'sidebar' | 'pill';

export interface MenuProps {
    /** Array of menu items (recursive) */
    items: MenuItem[];
    /** Layout orientation */
    orientation?: MenuOrientation;
    /** Size of menu items */
    size?: MenuSize;
    /** Visual variant */
    variant?: MenuVariant;
    /** Callback when an item is clicked */
    onItemClick?: (id: string, item: MenuItem) => void;
    /** ID of the currently active item */
    activeItemId?: string;
    /** Whether the menu supports collapsing groups (only vertical) */
    collapsible?: boolean;
    /** Whether groups are collapsed by default */
    defaultCollapsed?: boolean;
    /** Custom background/text color for active item (Tailwind class or hex) */
    activeMenuItemColor?: string;
    /** Max height for scrolling */
    maxHeight?: string | number;
    /** Whether to render in a portal (scenarios like context menu or dropdown root) */
    usePortal?: boolean;
    /** Read only mode (non-interactive) */
    readOnly?: boolean;
    /** Additional class names */
    className?: string;
}

const Menu: React.FC<MenuProps> = ({
    items,
    orientation = 'vertical',
    size = 'md',
    variant = 'default',
    onItemClick,
    activeItemId,
    collapsible = true,
    defaultCollapsed = true,
    activeMenuItemColor,
    maxHeight,
    usePortal = false,
    readOnly = false,
    className,
}) => {
    const [mounted, setMounted] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setMounted(true);
        // Initialize expanded state if not defaultCollapsed, expand all parents if possible? 
        // Implementing simple logic: if defaultCollapsed is false, expand all parents with children.
        if (!defaultCollapsed) {
            const allIds = new Set<string>();
            const collectParams = (items: MenuItem[]) => {
                items.forEach(i => {
                    if (i.children) {
                        allIds.add(i.id);
                        collectParams(i.children);
                    }
                });
            };
            collectParams(items);
            setExpandedIds(allIds);
        }
    }, [items, defaultCollapsed]);

    // Expand parent if active item is deep inside? 
    // Omitted for simplicity unless requested, but good UX usually requires it.

    const toggleExpand = (id: string) => {
        if (readOnly) return;
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleClick = (item: MenuItem, e: React.MouseEvent) => {
        if (item.disabled || readOnly) return;

        e.stopPropagation();

        // Handle Collapse toggle
        if (item.children && collapsible && orientation === 'vertical') {
            toggleExpand(item.id);
        }

        // Trigger callback
        if (onItemClick) {
            onItemClick(item.id, item);
        }
    };

    // Size Configuration
    const sizeClasses = {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3',
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    // Recursive Item Renderer
    const renderItems = (menuItems: MenuItem[], level: number = 0) => {
        return (
            <ul className={cn(
                "flex",
                orientation === 'horizontal' ? "flex-row gap-1 items-center" : "flex-col w-full gap-0.5",
                level > 0 && orientation === 'vertical' && "ml-4 border-l border-gray-100 dark:border-forest-800/50 pl-2" // Indentation for Nested
            )}>
                {menuItems.map((item) => {
                    const isActive = activeItemId === item.id;
                    const isExpanded = expandedIds.has(item.id);
                    const hasChildren = item.children && item.children.length > 0;

                    // Determine Active Styling
                    let activeClasses = "";
                    let textClasses = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-forest-900/50";

                    if (isActive) {
                        textClasses = ""; // Clear generic text/hover
                        if (activeMenuItemColor) {
                            // If custom color is provided (assuming tailwind class for simplicity or handling separately)
                            // For safety with 'activeMenuItemColor' being a raw value (like hex), we'd use style. 
                            // If it's a class string, we append it. Let's assume it might be a class string like 'bg-red-500'.
                            // But user asked for Forest scheme default.
                            activeClasses = activeMenuItemColor;
                        } else {
                            // Default Forest Styling based on Variant
                            if (variant === 'sidebar') {
                                activeClasses = "bg-forest-50 dark:bg-forest-900 text-forest-900 dark:text-forest-50 font-medium";
                            } else if (variant === 'pill') {
                                activeClasses = "bg-forest-700 text-white shadow-sm";
                            } else { // default
                                activeClasses = "text-forest-700 dark:text-forest-300 font-semibold bg-forest-50/50";
                            }
                        }
                    }

                    return (
                        <li key={item.id} className="relative group">
                            <div
                                onClick={(e) => handleClick(item, e)}
                                className={cn(
                                    "flex items-center cursor-pointer rounded-md transition-colors duration-200 select-none",
                                    sizeClasses[size],
                                    textClasses,
                                    activeClasses,
                                    item.disabled && "opacity-50 cursor-not-allowed",
                                    readOnly && "cursor-default hover:bg-transparent"
                                )}
                            >
                                {/* Icon */}
                                {item.icon && (
                                    <span className={cn("mr-2 flex-shrink-0", isActive && variant === 'pill' ? "text-white" : "")}>
                                        {item.icon}
                                    </span>
                                )}

                                {/* Label */}
                                <span className="flex-1 truncate">{item.label}</span>

                                {/* Collapse Icon */}
                                {hasChildren && collapsible && orientation === 'vertical' && (
                                    <span className="ml-2 text-gray-400">
                                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </span>
                                )}
                            </div>

                            {/* Children (Vertical Collapse) */}
                            {hasChildren && orientation === 'vertical' && (
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            {renderItems(item.children!, level + 1)}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}

                            {/* Children (Horizontal Dropdown - Simplified) */}
                            {hasChildren && orientation === 'horizontal' && (
                                // Horizontal recursive menus are complex (dropdowns). 
                                // For this task, assuming simpler "list" or just showing first level if horizontal 
                                // unless we implement full dropdown logic. 
                                // Let's implement active-hover dropdown for horizontal.
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-forest-950 shadow-lg rounded-md border border-gray-100 hidden group-hover:block z-50">
                                    <div className="p-1">
                                        {renderItems(item.children!, level + 1)}
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const content = (
        <nav
            className={cn(
                "w-full",
                maxHeight && "overflow-y-auto",
                className
            )}
            style={{ maxHeight: maxHeight }}
        >
            {renderItems(items)}
        </nav>
    );

    if (usePortal && mounted) {
        return createPortal(content, document.body);
    }

    return content;
};

export default Menu;

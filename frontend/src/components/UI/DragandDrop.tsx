'use client';

import React, { ReactNode } from 'react';
import { Reorder, useDragControls, motion } from 'framer-motion';
import { GripVertical, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export interface DnDItem {
    id: string | number;
    content: ReactNode;
}

export type DnDLayout = 'list' | 'grid';
export type DnDSize = 'sm' | 'md' | 'lg';

export interface DragandDropProps {
    // Data
    items: DnDItem[];
    reorder: (newOrder: DnDItem[]) => void;

    // Events
    onDragStart?: () => void;
    onDragEnd?: () => void;

    // Appearance
    layout?: DnDLayout;
    size?: DnDSize;
    columns?: number; // Only for 'grid' layout e.g. 2, 3, 4
    gap?: number; // Gap class scale e.g 4 -> gap-4

    // Structure
    label?: ReactNode;
    helperText?: ReactNode;

    // States
    hasError?: boolean;
    isDisabled?: boolean;
    isRequired?: boolean;
}

const DraggableItem = ({
    item,
    layout,
    size,
    isDisabled
}: {
    item: DnDItem;
    layout: DnDLayout;
    size: DnDSize;
    isDisabled: boolean;
}) => {
    const controls = useDragControls();

    const sizeStyles = {
        sm: 'p-2 text-sm',
        md: 'p-3 text-base',
        lg: 'p-4 text-lg',
    };

    return (
        <Reorder.Item
            value={item}
            dragListener={!isDisabled}
            dragControls={controls}
            className={cn(
                "relative bg-white dark:bg-forest-900 border border-gray-100 dark:border-forest-800 rounded-lg shadow-sm select-none",
                "hover:border-forest-300 dark:hover:border-forest-700 transition-colors",
                isDisabled && "opacity-60 cursor-not-allowed hover:border-gray-100 dark:hover:border-forest-800",
                sizeStyles[size],
                layout === 'grid' ? "h-full" : "flex items-center gap-3"
            )}
            whileDrag={{
                scale: 1.02,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 50
            }}
        >
            {/* Drag Handle */}
            <div
                className={cn(
                    "text-gray-400 hover:text-forest-500 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-forest-50 dark:hover:bg-forest-800 transition-colors",
                    isDisabled && "cursor-not-allowed pointer-events-none text-gray-300",
                    layout === 'grid' ? "absolute top-2 right-2" : ""
                )}
                onPointerDown={(e) => controls.start(e)}
            >
                <GripVertical size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            </div>

            {/* Content */}
            <div className={cn("flex-1", layout === 'grid' ? "mt-2" : "")}>
                {item.content}
            </div>
        </Reorder.Item>
    );
};

const DragandDrop: React.FC<DragandDropProps> = ({
    items,
    reorder,
    onDragStart,
    onDragEnd,
    layout = 'list',
    size = 'md',
    columns = 3,
    gap = 3,
    label,
    helperText,
    hasError = false,
    isDisabled = false,
    isRequired = false,
}) => {

    // Map gap value to tailwind gap classes usually up to reasonable limit
    const getGapClass = (g: number) => {
        const gaps: Record<number, string> = {
            0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3', 4: 'gap-4',
            5: 'gap-5', 6: 'gap-6', 8: 'gap-8', 10: 'gap-10', 12: 'gap-12'
        };
        return gaps[g] || 'gap-3';
    };

    const containerGap = getGapClass(gap);

    const gridStyles = layout === 'grid'
        ? {
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }
        : {
            display: 'flex',
            flexDirection: 'column' as const,
        };

    return (
        <div className="w-full flex flex-col gap-1.5">
            {/* Label */}
            {label && (
                <label className="flex items-center gap-1 text-sm font-medium text-forest-900 dark:text-forest-50 ml-1">
                    {label}
                    {isRequired && <span className="text-red-500">*</span>}
                </label>
            )}

            {/* DnD Container */}
            <Reorder.Group
                axis={layout === 'grid' ? undefined : 'y'} // 'y' is strictly vertical list, undefined allows x/y for grid-like feel (though Reorder.Group is primarily list-based, simple grids work with custom styles)  
                // Note: Framer Motion Reorder is best for Lists. For true Grids, custom solution is often needed, 
                // but applying CSS Grid to the ul/div of Reorder.Group works for simple cases. 
                // We utilize 'values' to track state.
                values={items}
                onReorder={reorder}
                className={cn(
                    "w-full",
                    containerGap
                )}
                style={gridStyles} // Apply grid styles inline to overrule default motion styles if needed, or better, via class if possible but grid-cols is dynamic
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
                {items.map((item) => (
                    <DraggableItem
                        key={item.id}
                        item={item}
                        layout={layout}
                        size={size}
                        isDisabled={isDisabled}
                    />
                ))}
            </Reorder.Group>

            {/* Helper / Error Text */}
            {(helperText || hasError) && (
                <div className={cn(
                    "text-xs ml-1 flex items-center gap-1.5",
                    hasError ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"
                )}>
                    {hasError && <AlertCircle size={12} />}
                    <span>{helperText}</span>
                </div>
            )}
        </div>
    );
};

export default DragandDrop;

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface StepItem {
    title: string;
    description?: string;
    icon?: React.ReactNode;
}

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md' | 'lg';
export type StepperVariant = 'circle' | 'dot' | 'line';

export interface StepperProps {
    /** Array of steps to display */
    steps: StepItem[];
    /** Current active step index (0-based) */
    activeStep: number;
    /** Layout orientation */
    orientation?: StepperOrientation;
    /** Size of the stepper elements */
    size?: StepperSize;
    /** Visual variant of the stepper */
    variant?: StepperVariant;
    /** Callback when a step is clicked. If not provided, steps are not interactive. */
    onStepClick?: (index: number) => void;
    /** Additional class names */
    className?: string;
    /** Optional container style */
    style?: React.CSSProperties;
}

const Stepper: React.FC<StepperProps> = ({
    steps,
    activeStep,
    orientation = 'horizontal',
    size = 'md',
    variant = 'circle',
    onStepClick,
    className,
    style,
}) => {

    // Handling Click
    const handleStepClick = (index: number) => {
        if (onStepClick) {
            onStepClick(index);
        }
    };

    const isVertical = orientation === 'vertical';

    // Size Mapping
    const sizeMap = {
        sm: { circle: 'w-6 h-6 text-xs', dot: 'w-2.5 h-2.5', title: 'text-sm', desc: 'text-xs', lineThickness: 'h-0.5 w-full', vLineThickness: 'w-0.5 h-full' },
        md: { circle: 'w-8 h-8 text-sm', dot: 'w-3.5 h-3.5', title: 'text-base', desc: 'text-sm', lineThickness: 'h-[2px] w-full', vLineThickness: 'w-[2px] h-full' },
        lg: { circle: 'w-10 h-10 text-base', dot: 'w-4.5 h-4.5', title: 'text-lg', desc: 'text-base', lineThickness: 'h-1 w-full', vLineThickness: 'w-1 h-full' },
    };

    const currentSize = sizeMap[size];

    return (
        <div
            className={cn(
                "flex",
                isVertical ? "flex-col h-full" : "flex-row w-full items-center",
                className
            )}
            style={style}
        >
            {steps.map((step, index) => {
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;
                const isLast = index === steps.length - 1;
                const isClickable = !!onStepClick;

                return (
                    <React.Fragment key={index}>
                        <div
                            className={cn(
                                "relative flex",
                                isVertical ? "flex-row flex-1" : "flex-col items-center flex-1",
                                isLast && !isVertical ? "flex-none" : "", // Horizontal last item shouldn't take full remaining space if unnecessary, but flex-1 usually good for equal spacing
                                isVertical && isLast ? "h-auto" : ""
                            )}
                        >
                            {/* Step Marker & Content Wrapper */}
                            <div
                                className={cn(
                                    "flex items-center",
                                    isVertical ? "flex-col" : "flex-col items-center w-full",
                                    isClickable ? "cursor-pointer group" : ""
                                )}
                                onClick={() => isClickable && handleStepClick(index)}
                            >

                                {/* Marker (Circle/Dot) */}
                                <div
                                    className={cn(
                                        "relative flex items-center justify-center transition-all duration-300 z-10 bg-white dark:bg-black", // bg needed to hide line behind if transparent
                                        variant === 'circle' && cn(
                                            "rounded-full border-2 font-semibold",
                                            currentSize.circle,
                                            isCompleted ? "bg-forest-700 border-forest-700 text-white" : "",
                                            isActive ? "border-forest-300 text-forest-900" : "",
                                            !isCompleted && !isActive ? "border-gray-300 text-gray-400" : ""
                                        ),
                                        variant === 'dot' && cn(
                                            "rounded-full",
                                            currentSize.dot,
                                            isCompleted ? "bg-forest-700" : "",
                                            isActive ? "bg-forest-300 ring-2 ring-forest-100 ring-offset-1" : "",
                                            !isCompleted && !isActive ? "bg-gray-300" : ""
                                        ),
                                        isClickable && !isActive && !isCompleted && "group-hover:border-forest-300 group-hover:text-forest-300"
                                    )}
                                >
                                    {variant === 'circle' ? (isCompleted ? <Check className="w-[60%] h-[60%]" strokeWidth={3} /> : (step.icon || index + 1)) : null}
                                    {variant === 'dot' && step.icon && (
                                        // If icon is provided in dot mode, maybe we show it alongside or ignore? 
                                        // Usually dot stepper is just dots. Let's ignore icon inside the dot itself, but it could be shown in label.
                                        null
                                    )}
                                </div>

                                {/* Content (Title/Desc) */}
                                <div className={cn(
                                    "mt-2 text-center",
                                    isVertical ? "mt-0 ml-4 text-left absolute left-8 top-[-5px]" : "w-max max-w-[150px]", // vertical positioning absolute next to dot
                                    variant === 'dot' && isVertical ? "ml-6" : ""
                                )}>
                                    <h3 className={cn(
                                        "font-medium leading-tight",
                                        currentSize.title,
                                        isActive || isCompleted ? "text-forest-900" : "text-gray-500",
                                    )}>
                                        {step.title}
                                    </h3>
                                    {step.description && (
                                        <p className={cn(
                                            "mt-0.5 text-gray-500",
                                            currentSize.desc
                                        )}>
                                            {step.description}
                                        </p>
                                    )}
                                </div>

                            </div>

                            {/* Connecting Line */}
                            {!isLast && (
                                <div className={cn(
                                    "transition-all duration-500",
                                    isVertical ? cn(
                                        "absolute left-0 top-0 ml-[calc(50%-1px)]",
                                        currentSize.vLineThickness,
                                        // Adjust line position and height for vertical
                                        variant === 'circle' ? "top-8 h-[calc(100%-8px)]" : "top-3 h-[calc(100%-12px)]",
                                        // Centering logic: The line needs to be centered on the marker. 
                                        // Circle is e.g. w-8, center is 1rem (16px). left-4.
                                        variant === 'circle' && size === 'sm' && "left-3",
                                        variant === 'circle' && size === 'md' && "left-4",
                                        variant === 'circle' && size === 'lg' && "left-5",
                                        variant === 'dot' && size === 'sm' && "left-1.5",
                                        variant === 'dot' && size === 'md' && "left-2",
                                        variant === 'dot' && size === 'lg' && "left-2.5",
                                        "ml-[-1px]" // Fine tuning 
                                    ) : cn(
                                        "absolute top-0 w-full left-[50%] right-[-50%]", // Horizontal line spanning to next
                                        currentSize.lineThickness,
                                        // Vertical center of the marker
                                        variant === 'circle' && size === 'sm' && "top-3",
                                        variant === 'circle' && size === 'md' && "top-4",
                                        variant === 'circle' && size === 'lg' && "top-5",
                                        variant === 'dot' && size === 'sm' && "top-1.5",
                                        variant === 'dot' && size === 'md' && "top-2",
                                        variant === 'dot' && size === 'lg' && "top-2.5",
                                        "translate-y-[-50%]"
                                    ),
                                    "bg-gray-200",
                                    // If we want a "filled" line effect for completed steps, we can duplicate this line or use logic
                                )}>
                                    {/* Filled Line Overlay */}
                                    <div
                                        className={cn(
                                            "h-full w-full bg-forest-700 transition-all duration-500 origin-left",
                                            isCompleted ? "scale-100" : "scale-0"
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Stepper;

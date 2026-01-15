'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export interface BarChartDataPoint {
    label: string;
    value: number;
    color?: string; // Optional override
}

export interface BarChartProps {
    data: BarChartDataPoint[];
    height?: number;
    showTooltip?: boolean;
    animated?: boolean;

    // Style
    barColor?: string; // Default bar color class
    barWidth?: number; // 0-1 percentage of band width, or fixed px? SVG usually easier with % or band
    className?: string;

    // Axes
    showXAxis?: boolean;
    showYAxis?: boolean;
    yAxisFormatter?: (value: number) => string;
}

const BarChart: React.FC<BarChartProps> = ({
    data,
    height = 300,
    showTooltip = true,
    animated = true,
    barColor = "text-forest-700 dark:text-forest-300",
    className,
    showXAxis = true,
    showYAxis = true,
    yAxisFormatter = (val) => val.toString(),
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Dimensions
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }; // Space for labels

    // Scales Calculation
    const maxValue = useMemo(() => {
        const max = Math.max(...data.map(d => d.value), 0);
        return max === 0 ? 10 : max * 1.1; // Add 10% headroom
    }, [data]);

    // Helpers
    const getBarHeight = (value: number) => {
        const chartHeight = height - padding.top - padding.bottom;
        return (value / maxValue) * chartHeight;
    };

    return (
        <div
            className={cn("w-full relative select-none", className)}
            style={{ height }}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            <div className="w-full h-full">
                {/* 
                   Using simple Flexbox implementation allows meaningful accessibility and responsiveness 
                   without complex SVG scaling math for width, but SVG is better for precise chart drawing.
                   Let's use a Hybrid: HTML/CSS grid for layout, motion divs for bars.
                   Actually SVG is standard for charts. Let's do SVG with percentage widths.
                */}
                <svg
                    width="100%"
                    height="100%"
                    className="overflow-visible"
                >
                    {/* Grid Lines (Optional, simple horizontal lines) */}
                    {showYAxis && [0, 0.25, 0.5, 0.75, 1].map((tick) => {
                        const yVal = maxValue * (1 - tick); // Invert for drawing top-down
                        const yPos = padding.top + (tick * (height - padding.top - padding.bottom));
                        return (
                            <g key={tick}>
                                <line
                                    x1={padding.left}
                                    y1={yPos}
                                    x2="100%"
                                    y2={yPos}
                                    className="stroke-gray-100 dark:stroke-forest-900"
                                    strokeDasharray="4 4"
                                    strokeWidth={1}
                                />
                                <text
                                    x={padding.left - 10}
                                    y={yPos + 4}
                                    textAnchor="end"
                                    className="fill-gray-400 text-xs font-mono"
                                >
                                    {yAxisFormatter(Math.round(maxValue * (1 - tick)))}
                                </text>
                            </g>
                        );
                    })}

                    {/* Bars */}
                    {data.map((d, i) => {
                        const barHeight = getBarHeight(d.value);
                        // Distribute bars evenly
                        const barSlotWidth = `${100 / data.length}%`; // This logic needs to account for padding manually or use simple x coords
                        // SVG mixing % and px is tricky. 
                        // Let's us standard x coordinates based on 100% width and ViewBox? 
                        // No, responsiveness is hard with ViewBox.
                        // Let's use x as percentage.

                        // Calculate x position as a percentage 
                        // Available width % = 100% - fixed left padding? No, hard to mix.
                        // We will use nested SVG for the data area to handle "100%" relative to data area

                        return null;
                    })}
                </svg>

                {/* 
                   Redoing approach: Flexbox is much safer for responsive "simple" bar charts 
                   where bars just need to be columns. Scaling SVG x-axis is painful responsive-wise.
                */}
                <div
                    className="absolute inset-0 flex items-end justify-between gap-2"
                    style={{
                        paddingLeft: showYAxis ? padding.left : 10,
                        paddingBottom: showXAxis ? padding.bottom : 10,
                        paddingTop: padding.top,
                        paddingRight: padding.right
                    }}
                >
                    {data.map((d, i) => {
                        const h = (d.value / maxValue) * 100;
                        const isHovered = hoveredIndex === i;

                        return (
                            <div
                                key={i}
                                className="relative flex flex-col items-center justify-end h-full flex-1 group"
                                onMouseEnter={() => setHoveredIndex(i)}
                            >
                                {/* Tooltip Positioned Relative to Bar */}
                                <AnimatePresence>
                                    {showTooltip && isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: -0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute bottom-full mb-2 bg-forest-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none"
                                        >
                                            <div className="font-semibold">{d.label}</div>
                                            <div>{yAxisFormatter(d.value)}</div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-forest-900"></div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* The Bar */}
                                <motion.div
                                    initial={animated ? { height: 0 } : { height: `${h}%` }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.05 }}
                                    className={cn(
                                        "w-full max-w-[40px] rounded-t-sm transition-opacity duration-200",
                                        d.color || (isHovered ? "bg-forest-600" : "bg-forest-300 dark:bg-forest-700"), // Default colors
                                        isHovered ? "opacity-100" : "opacity-90"
                                    )}
                                />

                                {/* X Axis Label */}
                                {showXAxis && (
                                    <div className="absolute top-full mt-2 text-xs text-gray-500 truncate w-full text-center">
                                        {d.label}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Y Axis Labels Rendering (HTML Overlay) */}
                {showYAxis && (
                    <div
                        className="absolute top-0 bottom-0 left-0 flex flex-col justify-between text-xs text-gray-400 font-mono pointer-events-none"
                        style={{
                            paddingTop: padding.top - 6, // alignment adjustment
                            paddingBottom: padding.bottom - 6,
                            width: padding.left
                        }}
                    >
                        <span>{yAxisFormatter(Math.round(maxValue))}</span>
                        <span>{yAxisFormatter(Math.round(maxValue * 0.75))}</span>
                        <span>{yAxisFormatter(Math.round(maxValue * 0.5))}</span>
                        <span>{yAxisFormatter(Math.round(maxValue * 0.25))}</span>
                        <span>0</span>
                    </div>
                )}

                {/* Horizontal Grid Lines using absolute positioning to match flex container */}
                {showYAxis && (
                    <div
                        className="absolute inset-0 pointer-events-none flex flex-col justify-between"
                        style={{
                            paddingTop: padding.top,
                            paddingBottom: padding.bottom,
                            left: padding.left,
                            right: padding.right
                        }}
                    >
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className="w-full border-t border-gray-100 dark:border-forest-800/50 border-dashed h-0" />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default BarChart;

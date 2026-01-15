'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export interface ChartDataPoint {
    label: string;
    value: number;
}

export interface ChartProps {
    data: ChartDataPoint[];
    height?: number;

    // Type
    filled?: boolean; // Area chart
    curved?: boolean; // Smooth lines

    // Appearance
    color?: string; // Text class for color e.g. "text-forest-500"
    strokeWidth?: number;
    showDots?: boolean;
    showGrid?: boolean;

    // Behavior
    showTooltip?: boolean;
    animated?: boolean;
    loading?: boolean;

    // Customization
    className?: string;
    yAxisFormatter?: (value: number) => string;
}

// --- Geometry Helpers for Smooth Curves ---

const getCoordinates = (value: number, index: number, total: number, height: number, width: number, max: number) => {
    // x: distributed evenly
    // y: scaled to value (inverted because SVG y=0 is top)
    // padding included in height/width passed? Let's assume passed dimensions are "drawable area"

    // We'll normalize coordinates 0-1 and scale in render
    // x = index / (total - 1)
    // y = value / max
    return {
        x: index / (total - 1),
        y: value / max
    };
};

const controlPoint = (current: number[], previous: number[], next: number[], reverse?: boolean) => {
    // Simple smoothing logic
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;

    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;

    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
};

const line = (pointA: number[], pointB: number[]) => {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    };
};

const svgPath = (points: number[][], command: (point: number[], i: number, a: number[][]) => string) => {
    return points.reduce((acc, point, i, a) => i === 0
        ? `M ${point[0]},${point[1]}`
        : `${acc} ${command(point, i, a)}`
        , '');
};

const bezierCommand = (point: number[], i: number, a: number[][]) => {
    // start control point
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    // end control point
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
};

const lineCommand = (point: number[]) => `L ${point[0]},${point[1]}`;

// --- Component ---

const Chart: React.FC<ChartProps> = ({
    data,
    height = 300,
    filled = false,
    curved = true,
    color = "text-forest-500", // We'll extract hex from CSS var if needed, or use currentColor. For SVG fill/stroke, classes work best.
    strokeWidth = 2,
    showDots = true,
    showGrid = true,
    showTooltip = true,
    animated = true,
    loading = false,
    className,
    yAxisFormatter = (val) => val.toString(),
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Layout
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };

    // Scales
    const maxValue = useMemo(() => {
        const max = Math.max(...data.map(d => d.value), 0);
        return max === 0 ? 10 : max * 1.1; // 10% headroom
    }, [data]);

    // Generate Points [x, y] in SVG local coordinates
    // We'll use a 1000x1000 coordinate system for simplicity in path generation, then scale via viewBox?
    // Or simpler: use 0-100 percentages in logic? SVG paths don't like % in 'd'.
    // Let's use fixed internal resolution e.g. 1000 width, Height proportional.
    // Actually, getting container width is hard in server components / essential hydration mismatch.
    // Standard trick: viewBox="0 0 100 100" and preserveAspectRatio="none".
    // Then x is 0-100, y is 0-100.

    const points = useMemo(() => {
        if (data.length < 2) return [];
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100; // 0 to 100
            const y = 100 - ((d.value / maxValue) * 100); // 100 to 0 (inverted Y)
            return [x, y];
        });
    }, [data, maxValue]);

    const pathD = useMemo(() => {
        if (points.length === 0) return '';
        return svgPath(points, curved ? bezierCommand : lineCommand);
    }, [points, curved]);

    const areaD = useMemo(() => {
        if (!filled || points.length === 0) return '';
        return `${pathD} L 100,100 L 0,100 Z`;
    }, [pathD, filled, points]);

    if (loading) {
        return (
            <div className={cn("flex flex-col items-center justify-center w-full", className)} style={{ height }}>
                <Loader2 className="animate-spin text-forest-500 mb-2" size={24} />
                <span className="text-xs text-forest-700 dark:text-forest-400">Loading chart data...</span>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={cn("flex items-center justify-center w-full bg-forest-50/50 dark:bg-forest-900/10 rounded-lg", className)} style={{ height }}>
                <span className="text-sm text-gray-500">No data available</span>
            </div>
        );
    }

    return (
        <div
            className={cn("w-full relative select-none", className)}
            style={{ height }}
            ref={containerRef}
            onMouseLeave={() => setHoveredIndex(null)}
        >
            {/* SVG Content */}
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 100 100`}
                preserveAspectRatio="none"
                className="overflow-visible"
            >
                {/* Grid */}
                {showGrid && [0, 0.25, 0.5, 0.75, 1].map(t => (
                    <line
                        key={t}
                        x1="0"
                        y1={t * 100}
                        x2="100"
                        y2={t * 100}
                        stroke="currentColor"
                        strokeOpacity={0.1}
                        vectorEffect="non-scaling-stroke" // Keeps line thin
                        className="text-gray-400 dark:text-gray-500"
                    />
                ))}

                {/* Area Fill */}
                {filled && (
                    <motion.path
                        d={areaD}
                        initial={animated ? { opacity: 0 } : { opacity: 1 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className={cn("fill-current opacity-20", color)}
                        stroke="none"
                    />
                )}

                {/* Line Path */}
                <motion.path
                    d={pathD}
                    initial={animated ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    vectorEffect="non-scaling-stroke"
                    className={cn(color)}
                />
            </svg>

            {/* Interaction Layer & Dots (HTML overlay for easier positioning without distortion) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* 
                  Since we used preserveAspectRatio="none", the SVG is stretched. 
                  HTML elements positioned with % will match the SVG points exactly.
                */}
                {data.map((d, i) => {
                    const xPct = (i / (data.length - 1)) * 100;
                    const yPct = 100 - ((d.value / maxValue) * 100);
                    const isHovered = hoveredIndex === i;

                    return (
                        <div
                            key={i}
                            className="absolute flex items-center justify-center group pointer-events-auto"
                            style={{
                                left: `${xPct}%`,
                                top: `${yPct}%`,
                                width: '20px',
                                height: '20px',
                                transform: 'translate(-50%, -50%)' // Center on point
                            }}
                            onMouseEnter={() => setHoveredIndex(i)}
                        >
                            {/* Visible Dot */}
                            {showDots && (
                                <motion.div
                                    initial={false}
                                    animate={{ scale: isHovered ? 1.5 : 1 }}
                                    className={cn(
                                        "w-2 h-2 rounded-full border-2 bg-white dark:bg-forest-950",
                                        color.replace('text-', 'border-') // Try to map text color to border color, or valid class needs to be passed
                                    )}
                                    style={{
                                        // Fallback if class mapping fails, relies on parent text color
                                        borderColor: 'currentColor',
                                        backgroundColor: isHovered ? 'currentColor' : undefined
                                    }}
                                >
                                    {/* Inner dot color logic tricky with classes. 
                                      Simplest: White dot with colored border. 
                                      Hover: Colored dot.
                                  */}
                                </motion.div>
                            )}

                            {/* Tooltip */}
                            <AnimatePresence>
                                {showTooltip && isHovered && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: -8, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="absolute bottom-full mb-2 bg-forest-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none"
                                    >
                                        <span className="font-semibold block">{d.label}</span>
                                        <span className="opacity-90">{yAxisFormatter(d.value)}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Y-Axis Labels (Simple Overlay) */}
            <div className="absolute left-0 top-0 bottom-0 -ml-10 w-8 flex flex-col justify-between text-[10px] text-gray-400 text-right py-0 leading-none pointer-events-none">
                <span>{yAxisFormatter(Math.round(maxValue))}</span>
                <span>{yAxisFormatter(Math.round(maxValue / 2))}</span>
                <span>{yAxisFormatter(0)}</span>
            </div>

        </div>
    );
};

export default Chart;

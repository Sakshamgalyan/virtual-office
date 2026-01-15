'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    X,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---

export type DatePickerSize = 'sm' | 'md' | 'lg';
export type DatePickerVariant = 'default' | 'outline' | 'ghost';
export type DatePickerPlacement = 'top' | 'bottom';
export type DatePickerAlign = 'left' | 'right';

export interface DatePreset {
    label: string;
    getValue: () => Date;
}

export interface DatePickerProps {
    // Value
    value?: Date | null;
    onChange?: (date: Date | null) => void;

    // Display
    placeholder?: string;
    dateFormat?: string; // e.g., 'MM/DD/YYYY'
    label?: ReactNode;
    helperText?: ReactNode;

    // Appearance
    size?: DatePickerSize;
    variant?: DatePickerVariant;
    className?: string;
    preIcon?: ReactNode;
    postIcon?: ReactNode;

    // Configuration
    showTime?: boolean;
    showPresets?: boolean;
    presets?: DatePreset[];
    minDate?: Date;
    maxDate?: Date;
    disableFutureDates?: boolean;
    firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday

    // States
    disabled?: boolean;
    hasError?: boolean; // alias for error state

    // Behavior
    onOpen?: () => void;
    onClose?: () => void;
    onApply?: (date: Date | null) => void;
    onCancel?: () => void;

    // Portal/Positioning
    usePortal?: boolean;
    placement?: DatePickerPlacement;
    align?: DatePickerAlign;
    zIndex?: number;
}

// --- Helpers ---

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Simple date formatter (lightweight alternative to date-fns)
const formatDate = (date: Date | null | undefined, format: string): string => {
    if (!date || isNaN(date.getTime())) return '';

    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const H = date.getHours();
    const M = date.getMinutes();
    const S = date.getSeconds();

    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;

    return format
        .replace('YYYY', `${y}`)
        .replace('MM', pad(m))
        .replace('DD', pad(d))
        .replace('HH', pad(H))
        .replace('mm', pad(M))
        .replace('ss', pad(S));
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const isSameDate = (d1?: Date | null, d2?: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
};

const getDefaultPresets = (): DatePreset[] => [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Tomorrow', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
    { label: 'Next Week', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d; } },
];

// --- Component ---

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = 'Select date',
    dateFormat = 'YYYY-MM-DD',
    label,
    helperText,
    size = 'md',
    variant = 'default',
    className,
    preIcon,
    postIcon,
    showTime = false,
    showPresets = false,
    presets = getDefaultPresets(),
    minDate,
    maxDate,
    disableFutureDates = false,
    firstDayOfWeek = 0,
    disabled = false,
    hasError = false,
    onOpen,
    onClose,
    onApply,
    onCancel,
    usePortal = false,
    placement = 'bottom',
    align = 'left',
    zIndex = 50,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value || new Date()); // Date used for calendar navigation
    const [tempDate, setTempDate] = useState<Date | null>(value || null); // Currently selected date in popup (before apply)
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0, width: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Sync value
    useEffect(() => {
        if (value) {
            setTempDate(value);
            setViewDate(value);
        }
    }, [value]);

    // Cleanup on close
    useEffect(() => {
        if (!isOpen) {
            // Reset temp to actual value if cancelled implicitly
            if (value) setTempDate(value);
            onClose?.();
        } else {
            onOpen?.();
        }
    }, [isOpen]);

    // Click Outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node) &&
                (!calendarRef.current || !calendarRef.current.contains(e.target as Node))
            ) {
                setIsOpen(false);
                onCancel?.();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    const updatePosition = () => {
        if (containerRef.current && isOpen) {
            const rect = containerRef.current.getBoundingClientRect();
            setPopupPosition({
                top: placement === 'bottom' ? rect.bottom + window.scrollY + 4 : rect.top + window.scrollY - 4,
                left: align === 'left' ? rect.left + window.scrollX : rect.right + window.scrollX,
                width: rect.width
            });
        }
    };

    useEffect(() => {
        updatePosition();
    }, [isOpen, placement, align]);

    // Validation Logic
    const isDateDisabled = (date: Date) => {
        if (disableFutureDates) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date > today) return true;
        }
        if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
        if (maxDate && date > new Date(maxDate.setHours(0, 0, 0, 0))) return true;
        return false;
    };

    // Handlers
    const toggleOpen = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

        // Preserve time from tempDate or current if new
        const currentHours = tempDate ? tempDate.getHours() : 0;
        const currentMinutes = tempDate ? tempDate.getMinutes() : 0;
        newDate.setHours(currentHours, currentMinutes);

        if (isDateDisabled(newDate)) return;

        setTempDate(newDate);
        if (!showTime) {
            // If no time selection, apply immediately (or wait for confirm button? usually immediate for date-only)
            // But if user requested 'onApply', maybe we should wait? 
            // Standard UX: Date only -> close on select. Date+Time -> wait for Apply.
            // However, requested props include onApply/onCancel, suggesting footer actions.
            // We'll keep it open if showTime is true, else close.
            // Actually let's just update temp and let user decide with buttons if they exist or auto-save

            // Let's adopt this strategy:
            // 1. Update temp state
            // 2. If !showTime, trigger change immediately
            handleApply(newDate, !showTime);
        }
    };

    const handleApply = (dateToApply: Date | null, shouldClose: boolean = true) => {
        if (onChange) onChange(dateToApply);
        if (onApply) onApply(dateToApply);
        if (shouldClose) setIsOpen(false);
    };

    const handleMonthChange = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
        let num = parseInt(val);
        if (isNaN(num)) return;

        const newDate = new Date(tempDate || new Date());
        if (type === 'hours') {
            if (num < 0) num = 23;
            if (num > 23) num = 0;
            newDate.setHours(num);
        } else {
            if (num < 0) num = 59;
            if (num > 59) num = 0;
            newDate.setMinutes(num);
        }
        setTempDate(newDate);
        // If we adjust time, we don't close automatically
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        // Adjust for firstDayOfWeek
        const startingSlot = (firstDay - firstDayOfWeek + 7) % 7;

        const days = [];
        // Empty slots
        for (let i = 0; i < startingSlot; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateToCheck = new Date(year, month, d);
            const disabledDate = isDateDisabled(dateToCheck);
            const isSelected = tempDate && isSameDate(dateToCheck, tempDate);
            const isToday = isSameDate(dateToCheck, new Date());

            days.push(
                <button
                    key={d}
                    onClick={(e) => { e.stopPropagation(); handleDateClick(d); }}
                    disabled={disabledDate}
                    className={cn(
                        "w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all",
                        isSelected
                            ? "bg-forest-600 text-white shadow-md hover:bg-forest-700"
                            : isToday
                                ? "bg-forest-50 text-forest-700 font-semibold border border-forest-200"
                                : "hover:bg-gray-100 dark:hover:bg-forest-800 text-gray-700 dark:text-gray-200",
                        disabledDate && "opacity-30 cursor-not-allowed hover:bg-transparent"
                    )}
                >
                    {d}
                </button>
            );
        }

        return days;
    };

    // Styling Maps
    const sizeConfig = {
        sm: { height: 'h-8', text: 'text-xs', icon: 14, px: 'px-2' },
        md: { height: 'h-10', text: 'text-sm', icon: 16, px: 'px-3' },
        lg: { height: 'h-12', text: 'text-base', icon: 18, px: 'px-4' },
    }[size];

    const PopupContent = (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: placement === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            ref={calendarRef}
            style={{
                position: usePortal ? 'absolute' : 'absolute',
                top: usePortal ? popupPosition.top : (placement === 'bottom' ? '100vw' : 'auto'), // '100%' handled by class logic or relative usually, but for portal we need exact coords
                left: usePortal ? popupPosition.left : (align === 'left' ? 0 : 'auto'),
                right: !usePortal && align === 'right' ? 0 : 'auto',
                // For non-portal relative positioning:
                marginTop: usePortal ? 0 : (placement === 'bottom' ? '8px' : '0'),
                marginBottom: usePortal ? 0 : (placement === 'top' ? '8px' : '0'),
                bottom: !usePortal && placement === 'top' ? '100%' : 'auto',
                transform: usePortal && align === 'right' ? 'translateX(-100%)' : 'none',
                zIndex
            }}
            className={cn(
                "bg-white dark:bg-forest-950 border border-gray-100 dark:border-forest-800 rounded-lg shadow-xl p-4 w-[320px] flex flex-col gap-4",
                !usePortal && "absolute mt-2" // simplified for non-portal
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-forest-800 rounded-full text-gray-500">
                    <ChevronLeft size={20} />
                </button>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-forest-800 rounded-full text-gray-500">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {/* Weekdays */}
                {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} className="text-xs font-medium text-gray-400 uppercase">
                        {DAYS_SHORT[(i + firstDayOfWeek) % 7]}
                    </span>
                ))}
                {/* Days */}
                {renderCalendar()}
            </div>

            {/* Time Picker */}
            {showTime && (
                <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100 dark:border-forest-800">
                    <Clock size={16} className="text-gray-400" />
                    <div className="flex items-center bg-gray-50 dark:bg-forest-900 rounded-md p-1 border border-gray-200 dark:border-forest-800">
                        <input
                            type="number"
                            min="0" max="23"
                            value={tempDate ? tempDate.getHours().toString().padStart(2, '0') : '00'}
                            onChange={(e) => handleTimeChange('hours', e.target.value)}
                            className="w-10 bg-transparent text-center text-sm outline-none text-forest-900 dark:text-forest-50"
                        />
                        <span className="text-gray-400">:</span>
                        <input
                            type="number"
                            min="0" max="59"
                            value={tempDate ? tempDate.getMinutes().toString().padStart(2, '0') : '00'}
                            onChange={(e) => handleTimeChange('minutes', e.target.value)}
                            className="w-10 bg-transparent text-center text-sm outline-none text-forest-900 dark:text-forest-50"
                        />
                    </div>
                </div>
            )}

            {/* Presets & Actions */}
            {(showPresets || onApply || onCancel) && (
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-forest-800">
                    {showPresets && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {presets.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => {
                                        const d = preset.getValue();
                                        setTempDate(d);
                                        setViewDate(d);
                                    }}
                                    className="px-2 py-1 text-xs bg-forest-50 dark:bg-forest-900 text-forest-700 dark:text-forest-200 rounded hover:bg-forest-100 dark:hover:bg-forest-800 transition-colors"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                onCancel?.();
                            }}
                            className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-forest-900 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleApply(tempDate, true)}
                            disabled={!tempDate}
                            className="px-3 py-1.5 text-xs bg-forest-600 text-white rounded hover:bg-forest-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-forest-900 dark:text-forest-50 ml-1">
                    {label}
                </label>
            )}

            <div
                onClick={toggleOpen}
                className={cn(
                    "relative flex items-center w-full border rounded-lg transition-all duration-200 bg-white dark:bg-forest-950",
                    sizeConfig.height,
                    sizeConfig.px,
                    disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-forest-900" : "cursor-pointer hover:border-forest-300 dark:hover:border-forest-700",
                    hasError ? "border-red-500" : isOpen ? "border-forest-300 ring-2 ring-forest-300/20" : "border-gray-200 dark:border-forest-800"
                )}
            >
                <div className="text-gray-400 mr-2">
                    {preIcon || <CalendarIcon size={sizeConfig.icon} />}
                </div>

                <span className={cn("flex-1 bg-transparent border-none outline-none truncate", value ? "text-forest-900 dark:text-forest-50" : "text-gray-400", sizeConfig.text)}>
                    {value ? formatDate(value, showTime ? dateFormat + ' HH:mm' : dateFormat) : placeholder}
                </span>

                <div className="text-gray-400 ml-2">
                    {postIcon || (value && !disabled ? (
                        <div
                            role="button"
                            onClick={(e) => { e.stopPropagation(); onChange?.(null); }}
                            className="hover:text-red-500 rounded-full p-0.5"
                        >
                            <X size={sizeConfig.icon} />
                        </div>
                    ) : null)}
                </div>
            </div>

            {helperText && (
                <div className={cn("text-xs ml-1 flex items-center gap-1.5", hasError ? "text-red-500" : "text-gray-500 dark:text-gray-400")}>
                    {hasError && <AlertCircle size={12} />}
                    <span>{helperText}</span>
                </div>
            )}

            <AnimatePresence>
                {isOpen && (
                    usePortal ? createPortal(PopupContent, document.body) : PopupContent
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;

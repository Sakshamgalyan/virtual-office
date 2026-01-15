'use client';

import React, { useState, useRef, useEffect, ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    X,
    Check,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Types ---

export interface DropDownOption {
    label: string;
    value: string | number;
    disabled?: boolean;
    [key: string]: any;
}

export type DropDownSize = 'sm' | 'md' | 'lg';
export type DropDownPlacement = 'top' | 'bottom';
export type DropDownAlignment = 'left' | 'right';

export interface DropDownProps<T extends DropDownOption = DropDownOption> {
    // Data
    options: T[];
    value?: T | T[] | null;
    placeholder?: string;
    label?: ReactNode;

    // Behavior
    onChange?: (value: T | T[] | null) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onSearch?: (query: string) => void;

    // Appearance
    size?: DropDownSize;
    preIcon?: ReactNode;
    postIcon?: ReactNode;

    // States
    disabled?: boolean;
    loading?: boolean;

    // Validation
    error?: boolean; // alias for hasError
    hasError?: boolean;
    errorMessage?: string;
    hasSuccess?: boolean;
    helperText?: ReactNode;

    // Features
    multiple?: boolean;
    searchable?: boolean;
    searchablePlaceholder?: string;
    clearable?: boolean;
    showSelectAll?: boolean;
    maxTagCount?: number;
    expandedMenu?: boolean; // Controlled open state

    // Customization
    filterOption?: (option: T, query: string) => boolean;
    renderOption?: (option: T, isSelected: boolean) => ReactNode;
    groupBy?: string | ((option: T) => string);

    // Layout
    placement?: DropDownPlacement;
    alignment?: DropDownAlignment;
    dropdownWidth?: string | number; // 'auto', '100%', or pixels
    zIndex?: number;
    usePortal?: boolean;
    className?: string;
}

// --- Implementation ---

const DropDown = <T extends DropDownOption>({
    options = [],
    value,
    placeholder = 'Select...',
    label,
    onChange,
    onOpen,
    onClose,
    onSearch,
    size = 'md',
    preIcon,
    postIcon,
    disabled = false,
    loading = false,
    error = false,
    hasError = false,
    errorMessage,
    hasSuccess = false,
    helperText,
    multiple = false,
    searchable = false,
    searchablePlaceholder = 'Search...',
    clearable = false,
    showSelectAll = false,
    maxTagCount = 2,
    expandedMenu, // If provided, component becomes controlled for open state
    filterOption,
    renderOption,
    groupBy,
    placement = 'bottom',
    alignment = 'left',
    dropdownWidth = '100%',
    zIndex = 50,
    usePortal = false,
    className,
}: DropDownProps<T>) => {
    // Combine error states
    const isError = error || hasError;

    // Internal State
    const [internalOpen, setInternalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Derived State
    const isOpen = expandedMenu !== undefined ? expandedMenu : internalOpen;
    const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

    // -- Logic --

    const toggleOpen = () => {
        if (disabled || loading) return;
        const newState = !isOpen;
        if (expandedMenu === undefined) setInternalOpen(newState);

        if (newState) {
            onOpen?.();
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            onClose?.();
            setSearchQuery('');
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                (!menuRef.current || !menuRef.current.contains(event.target as Node))
            ) {
                if (internalOpen) {
                    setInternalOpen(false);
                    onClose?.();
                    setSearchQuery('');
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onClose, internalOpen]);

    // Calculate Position for Portal
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            setMenuPosition({
                top: placement === 'bottom' ? rect.bottom + scrollY + 4 : rect.top + scrollY - 4,
                left: alignment === 'left' ? rect.left + scrollX : rect.right + scrollX,
                width: rect.width,
            });
        }
    }, [isOpen, placement, alignment]);

    // Filtering
    const processedOptions = useMemo(() => {
        let filtered = options;
        if (searchable && searchQuery) {
            if (onSearch) {
                // External search handler should update 'options' prop, but we check internal filter too if provided
                if (filterOption) {
                    filtered = options.filter(opt => filterOption(opt, searchQuery));
                }
            } else {
                // Internal filtering
                const defaultFilter = (opt: T, query: string) =>
                    opt.label.toLowerCase().includes(query.toLowerCase());
                const filterFn = filterOption || defaultFilter;
                filtered = options.filter(opt => filterFn(opt, searchQuery));
            }
        }
        return filtered;
    }, [options, searchable, searchQuery, onSearch, filterOption]);

    // Grouping
    const groupedOptions = useMemo(() => {
        if (!groupBy) return { default: processedOptions };

        const groups: Record<string, T[]> = {};
        processedOptions.forEach(opt => {
            const groupKey = typeof groupBy === 'function' ? groupBy(opt) : (opt[groupBy] as string) || 'Other';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(opt);
        });
        return groups;
    }, [processedOptions, groupBy]);


    // Handlers
    const handleSelect = (option: T) => {
        if (option.disabled) return;

        if (multiple) {
            // Toggle selection
            const isSelected = selectedValues.some(v => v.value === option.value);
            let newValue: T[];
            if (isSelected) {
                newValue = selectedValues.filter(v => v.value !== option.value);
            } else {
                newValue = [...selectedValues, option];
            }
            onChange?.(newValue);
            // Don't close on multiple selection
        } else {
            // Single selection
            onChange?.(option);
            if (expandedMenu === undefined) setInternalOpen(false);
            onClose?.();
            setSearchQuery('');
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(multiple ? [] : null);
    };

    const handleSelectAll = () => {
        if (!multiple) return;
        const allEnabled = options.filter(o => !o.disabled);
        const allSelected = allEnabled.every(opt => selectedValues.some(v => v.value === opt.value));

        if (allSelected) {
            onChange?.([]);
        } else {
            onChange?.(allEnabled);
        }
    };

    const handleRemoveTag = (e: React.MouseEvent, valToRemove: T) => {
        e.stopPropagation();
        if (multiple) {
            const newValue = selectedValues.filter(v => v.value !== valToRemove.value);
            onChange?.(newValue);
        }
    };

    // Styling

    // Size Configurations
    const sizeConfig = {
        sm: { height: 'h-8', text: 'text-xs', px: 'px-2', py: 'py-1', icon: 14 },
        md: { height: 'h-10', text: 'text-sm', px: 'px-3', py: 'py-2', icon: 16 },
        lg: { height: 'h-12', text: 'text-base', px: 'px-4', py: 'py-3', icon: 20 },
    };
    const currentSize = sizeConfig[size];

    const baseInputImgClass = cn(
        "relative w-full flex items-center justify-between border rounded-lg transition-all duration-200 bg-white dark:bg-forest-950",
        currentSize.height,
        currentSize.px,
        disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-forest-900" : "cursor-pointer hover:border-forest-300 dark:hover:border-forest-700",
        isError
            ? "border-red-500 focus:ring-red-200"
            : hasSuccess
                ? "border-green-500 focus:ring-green-200"
                : isOpen
                    ? "border-forest-300 ring-2 ring-forest-300/20 shadow-md dark:border-forest-300"
                    : "border-gray-200 dark:border-forest-800",
        className
    );

    // --- Renders ---

    const renderTriggerContent = () => {
        if (selectedValues.length === 0) {
            return (
                <span className={cn("text-gray-400 dark:text-gray-500 ml-2", currentSize.text)}>
                    {placeholder}
                </span>
            );
        }

        if (multiple) {
            const visibleTags = selectedValues.slice(0, maxTagCount);
            const hiddenCount = selectedValues.length - maxTagCount;

            return (
                <div className="flex flex-wrap gap-1.5 overflow-hidden py-0.5">
                    {visibleTags.map(val => (
                        <div key={val.value} className="flex items-center gap-1 bg-forest-50 dark:bg-forest-800 text-forest-700 dark:text-forest-50 px-1.5 py-0.5 rounded text-xs">
                            <span className="truncate max-w-[100px]">{val.label}</span>
                            <span
                                role="button"
                                onClick={(e) => handleRemoveTag(e, val)}
                                className="hover:text-red-500 cursor-pointer"
                            >
                                <X size={12} />
                            </span>
                        </div>
                    ))}
                    {hiddenCount > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 self-center">+{hiddenCount}</span>
                    )}
                </div>
            );
        }

        return (
            <span className={cn("text-forest-900 dark:text-forest-50 ml-2 truncate", currentSize.text)}>
                {selectedValues[0].label}
            </span>
        );
    };

    const isAllSelected = options.length > 0 && options.filter(o => !o.disabled).every(opt => selectedValues.some(v => v.value === opt.value));

    const MenuContent = (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: placement === 'bottom' ? -5 : 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: placement === 'bottom' ? -5 : 5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
                width: dropdownWidth === 'auto' ? 'auto' : (typeof dropdownWidth === 'number' ? dropdownWidth : (usePortal ? menuPosition.width : dropdownWidth)),
                position: usePortal ? 'absolute' : 'absolute',
                top: usePortal ? menuPosition.top : (placement === 'bottom' ? '100%' : 'auto'),
                bottom: !usePortal && placement === 'top' ? '100%' : 'auto',
                left: usePortal ? menuPosition.left : (alignment === 'right' ? 'auto' : 0),
                right: !usePortal && alignment === 'right' ? 0 : 'auto',
                zIndex: zIndex,
                marginTop: usePortal ? 0 : (placement === 'bottom' ? 4 : 0),
                marginBottom: usePortal ? 0 : (placement === 'top' ? 4 : 0),
                transform: usePortal && alignment === 'right' ? 'translateX(-100%)' : 'none'
            }}
            className="flex flex-col bg-white dark:bg-forest-950 border border-gray-100 dark:border-forest-800 rounded-lg shadow-xl overflow-hidden max-h-[300px]"
            ref={menuRef}
        >
            {/* Search Bar */}
            {searchable && (
                <div className="p-2 border-b border-gray-100 dark:border-forest-800 sticky top-0 bg-white dark:bg-forest-950 z-10">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 text-gray-400" size={14} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                onSearch?.(e.target.value);
                            }}
                            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-forest-900 border border-transparent focus:border-forest-300 rounded-md outline-none text-forest-900 dark:text-forest-50"
                            placeholder={searchablePlaceholder}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Select All */}
            {multiple && showSelectAll && !searchQuery && (
                <div
                    className="px-3 py-2 border-b border-gray-100 dark:border-forest-800 cursor-pointer hover:bg-forest-50 dark:hover:bg-forest-900 text-sm text-forest-700 dark:text-forest-200 font-medium"
                    onClick={() => { handleSelectAll(); }}
                >
                    <div className="flex items-center justify-between">
                        <span>Select All</span>
                        {isAllSelected && <Check size={16} className="text-forest-300" />}
                    </div>
                </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
                {Object.keys(groupedOptions).length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No options found
                    </div>
                ) : (
                    Object.entries(groupedOptions).map(([group, opts]) => (
                        <div key={group}>
                            {groupBy && (
                                <div className="px-3 py-1.5 bg-gray-50 dark:bg-forest-900/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky top-0">
                                    {group}
                                </div>
                            )}
                            {opts.map(option => {
                                const isSelected = selectedValues.some(v => v.value === option.value);
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelect(option)}
                                        className={cn(
                                            "flex items-center justify-between px-3 py-2 cursor-pointer transition-colors text-sm",
                                            option.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-forest-50 dark:hover:bg-forest-800",
                                            isSelected
                                                ? "bg-forest-50 dark:bg-forest-800/80 text-forest-900 dark:text-forest-50 font-medium"
                                                : "text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        {renderOption ? (
                                            renderOption(option, isSelected)
                                        ) : (
                                            <>
                                                <span>{option.label}</span>
                                                {isSelected && (
                                                    <Check size={16} className="text-forest-500 dark:text-forest-300" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>

            {/* Loading Overlay within menu if needed */}
            {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-20">
                    <Loader2 className="animate-spin text-forest-500" size={24} />
                </div>
            )}
        </motion.div>
    );

    return (
        <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={containerRef}>
            {/* Label */}
            {label && (
                <label className="text-sm font-medium text-forest-900 dark:text-forest-50 ml-1">
                    {label}
                </label>
            )}

            {/* Trigger Base */}
            <div
                className={baseInputImgClass}
                onClick={toggleOpen}
            >
                {/* Pre Icon */}
                {preIcon && (
                    <div className="pl-3 text-gray-400">
                        {preIcon}
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 pr-2">
                    {renderTriggerContent()}
                </div>

                {/* Right Side Icons */}
                <div className="flex items-center gap-1 pr-2 text-gray-400">
                    {/* Clear Button */}
                    {clearable && selectedValues.length > 0 && !disabled && (
                        <div
                            role="button"
                            onClick={handleClear}
                            className="p-1 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-forest-800 rounded-full transition-colors"
                        >
                            <X size={14} />
                        </div>
                    )}

                    {/* Status Icons */}
                    {loading ? (
                        <Loader2 className="animate-spin text-forest-500" size={16} />
                    ) : isError ? (
                        <AlertCircle className="text-red-500" size={16} />
                    ) : (
                        postIcon || <ChevronDown size={16} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
                    )}
                </div>
            </div>

            {/* Helper Text / Error Message */}
            {(helperText || errorMessage) && (
                <div className={cn("text-xs ml-1 flex items-center gap-1.5", isError ? "text-red-500" : hasSuccess ? "text-green-500" : "text-gray-500 dark:text-gray-400")}>
                    {isError && <AlertCircle size={12} />}
                    {hasSuccess && <CheckCircle2 size={12} />}
                    <span>{errorMessage || helperText}</span>
                </div>
            )}

            {/* Dropdown Menu Portal or Inline */}
            <AnimatePresence>
                {isOpen && !disabled && (
                    usePortal
                        ? createPortal(MenuContent, document.body)
                        : (
                            <div className="relative w-full z-10">
                                {MenuContent}
                            </div>
                        )
                )}
            </AnimatePresence>
        </div>
    );
};

export default DropDown;

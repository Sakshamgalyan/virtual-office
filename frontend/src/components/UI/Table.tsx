'use client';

import React, { useState, ReactNode, useMemo } from 'react';
import {
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Checkbox from './Checkbox';
import DropDown from './DropDown'; // Optional usage if we had bulk actions, but not strictly asked. Keeping imports clean.

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export type TableVariant = 'default' | 'striped' | 'bordered';
export type TableSize = 'sm' | 'md' | 'lg';

export interface Column<T> {
    key: string;
    header: ReactNode;
    accessor?: keyof T | ((row: T) => ReactNode);
    render?: (row: T, index: number) => ReactNode;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    fixed?: 'left' | 'right'; // Sticky columns
}

export interface TableProps<T> {
    // Data
    data: T[];
    columns: Column<T>[];
    rowKey: keyof T | ((row: T) => string | number); // Unique ID for selection/nesting

    // Appearance
    variant?: TableVariant;
    size?: TableSize;
    hoverable?: boolean;
    showHeader?: boolean;

    // Sorting
    sortable?: boolean;
    sortConfig?: SortConfig | null;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;

    // Selection
    isRowSelection?: boolean;
    selectedRows?: (string | number)[];
    onRowSelect?: (selectedIds: (string | number)[], selectedRows: T[]) => void;
    onRowClick?: (row: T) => void;

    // Pagination
    pagination?: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
    };
    onPageChange?: (page: number) => void;
    paginationDisabled?: boolean;
    showPaginationSkeleton?: boolean;

    // Nesting
    nestedChildrenAccessor?: keyof T; // e.g., 'subRows'
    nestedDefaultExpanded?: boolean;

    // Loading
    isLoading?: boolean;
    skeletonRows?: number;
    skeletonContent?: ReactNode; // Optional custom skeleton cell content

    // Fixed Column Config (can be inferred from columns, but explicit props asked)
    // Actually, prompt asked for 'fixedleftmost', 'fixedrightmost'. 
    // We'll implement robust column-based 'fixed' prop, but also support these global toggles if easier
    fixedLeftMost?: boolean;
    fixedRightMost?: boolean;

    className?: string;
}

// Helper to get nested value
const getNestedValue = (obj: any, path: string | ((row: any) => any)) => {
    if (typeof path === 'function') return path(obj);
    return obj[path];
};

const Table = <T extends Record<string, any>>({
    data,
    columns,
    rowKey,
    variant = 'default',
    size = 'md',
    hoverable = true,
    showHeader = true,
    sortable = false,
    sortConfig,
    onSort,
    isRowSelection = false,
    selectedRows = [],
    onRowSelect,
    onRowClick,
    pagination,
    onPageChange,
    paginationDisabled = false,
    nestedChildrenAccessor,
    nestedDefaultExpanded = false,
    isLoading = false,
    skeletonRows = 5,
    showPaginationSkeleton = false,
    fixedLeftMost = false,
    fixedRightMost = false,
    className
}: TableProps<T>) => {

    const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});

    // Toggle row expansion
    const toggleRow = (id: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Calculate fixed columns offsets
    // Simple implementation: fixedLeftMost maps to first col fixed, fixedRightMost to last col fixed
    // Or respect column.fixed property. We'll merge them.

    const processedColumns = useMemo(() => {
        return columns.map((col, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === columns.length - 1;

            let fixed = col.fixed;
            if (fixedLeftMost && isFirst) fixed = 'left';
            if (fixedRightMost && isLast) fixed = 'right';

            return { ...col, fixed };
        });
    }, [columns, fixedLeftMost, fixedRightMost]);

    const getRowId = (row: T) => {
        if (typeof rowKey === 'function') return rowKey(row);
        return row[rowKey as string] as string | number;
    };

    // Selection Logic
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = data.map(getRowId);
            onRowSelect?.(allIds, data);
        } else {
            onRowSelect?.([], []);
        }
    };

    const handleSelectRow = (row: T, checked: boolean) => {
        const id = getRowId(row);
        let newIds: (string | number)[];
        if (checked) {
            newIds = [...selectedRows, id];
        } else {
            newIds = selectedRows.filter(rId => rId !== id);
        }

        // Find full row objects for convenience
        const newSelectedRows = data.filter(d => newIds.includes(getRowId(d)));
        onRowSelect?.(newIds, newSelectedRows);
    };

    const isAllSelected = data.length > 0 && data.every(d => selectedRows.includes(getRowId(d)));
    const isIndeterminate = selectedRows.length > 0 && !isAllSelected;

    // Sorting Logic
    const handleHeaderClick = (column: Column<T>) => {
        if (!sortable || column.sortable === false) return;

        const key = column.key;
        let direction: 'asc' | 'desc' = 'asc';

        if (sortConfig?.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        onSort?.(key, direction);
    };

    // Style Helpers
    const sizeClasses = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
    }[size];

    // Sticky Styles
    const getStickyStyle = (col: (typeof processedColumns)[0], index: number) => {
        if (!col.fixed) return {};

        const style: React.CSSProperties = {
            position: 'sticky',
            zIndex: 20,
        };

        if (col.fixed === 'left') {
            // Needs accurate left offset calculation if multiple allowed. 
            // Simple version: only supports single leftmost logic or manual width
            // For robust multi-sticky, we'd need to measure widths. 
            // Assuming simplified: First column is usually the one sticky left
            style.left = 0;
            // If selecting is enabled, we need to account for checkbox width (~40px)
            if (isRowSelection && index === 0) {
                style.left = '48px'; // approx width of checkbox column
            }
        }
        if (col.fixed === 'right') {
            style.right = 0;
        }
        return style;
    };

    // Render Logic
    const renderCell = (row: T, col: Column<T>, index: number) => {
        if (col.render) return col.render(row, index);

        const val = col.accessor && getNestedValue(row, col.accessor as string);
        return val as ReactNode;
    };

    return (
        <div className={cn("w-full flex flex-col gap-4", className)}>
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-forest-800 bg-white dark:bg-forest-950 shadow-sm custom-scrollbar relative">
                <table className="w-full text-left border-collapse">
                    {/* Header */}
                    {showHeader && (
                        <thead className="bg-gray-50 dark:bg-forest-900/50 border-b border-gray-200 dark:border-forest-800">
                            <tr>
                                {/* Selection Checkbox Header */}
                                {isRowSelection && (
                                    <th
                                        className={cn(
                                            "w-12 text-center sticky left-0 z-30 bg-gray-50 dark:bg-forest-900/50",
                                            sizeClasses
                                        )}
                                    >
                                        <Checkbox
                                            size="sm"
                                            checked={isAllSelected}
                                            indeterminate={isIndeterminate}
                                            onChange={(chk) => handleSelectAll(chk)}
                                        />
                                    </th>
                                )}

                                {/* Columns Headers */}
                                {processedColumns.map((col, idx) => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleHeaderClick(col)}
                                        className={cn(
                                            "font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap transition-colors",
                                            sizeClasses,
                                            (sortable && col.sortable !== false) ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-forest-800" : "",
                                            col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                                            col.fixed && "bg-gray-50 dark:bg-forest-900/50" // sticky background matches header
                                        )}
                                        style={{ width: col.width, ...getStickyStyle(col, idx) }}
                                    >
                                        <div className={cn(
                                            "flex items-center gap-2",
                                            col.align === 'center' && "justify-center",
                                            col.align === 'right' && "justify-end"
                                        )}>
                                            {col.header}
                                            {sortable && col.sortable !== false && (
                                                <span className="text-gray-400">
                                                    {sortConfig?.key === col.key ? (
                                                        sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="opacity-0 group-hover:opacity-50" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}

                    {/* Body */}
                    <tbody className="divide-y divide-gray-100 dark:divide-forest-800">
                        {isLoading ? (
                            // Loading Skeletons
                            Array.from({ length: skeletonRows }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {isRowSelection && (
                                        <td className="p-3"><div className="h-4 w-4 bg-gray-200 dark:bg-forest-800 rounded" /></td>
                                    )}
                                    {processedColumns.map((c, j) => (
                                        <td key={j} className={sizeClasses}>
                                            <div className="h-4 bg-gray-200 dark:bg-forest-800 rounded w-3/4" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={processedColumns.length + (isRowSelection ? 1 : 0)}
                                    className="p-8 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => {
                                const id = getRowId(row);
                                const isSelected = selectedRows.includes(id);
                                const isExpanded = expandedRows[id] || (nestedDefaultExpanded && expandedRows[id] !== false);
                                const hasChildren = nestedChildrenAccessor && Array.isArray(row[nestedChildrenAccessor as string]) && (row[nestedChildrenAccessor as string] as any[]).length > 0;

                                return (
                                    <React.Fragment key={id}>
                                        <tr
                                            onClick={() => onRowClick?.(row)}
                                            className={cn(
                                                "transition-colors group",
                                                variant === 'striped' && rowIndex % 2 === 1 ? "bg-gray-50/50 dark:bg-forest-900/20" : "bg-white dark:bg-forest-950",
                                                hoverable && "hover:bg-forest-50 dark:hover:bg-forest-900/60",
                                                isSelected && "bg-forest-50 dark:bg-forest-900/80",
                                                onRowClick && "cursor-pointer"
                                            )}
                                        >
                                            {/* Checkbox / Expand Cell */}
                                            {isRowSelection && (
                                                <td className={cn("text-center sticky left-0 z-10 bg-inherit", sizeClasses)}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Checkbox
                                                            size="sm"
                                                            checked={isSelected}
                                                            onChange={(chk) => handleSelectRow(row, chk)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </td>
                                            )}

                                            {/* Data Cells */}
                                            {processedColumns.map((col, colIdx) => {
                                                const isFirstDataCol = colIdx === 0;
                                                return (
                                                    <td
                                                        key={col.key}
                                                        className={cn(
                                                            "text-gray-700 dark:text-gray-300",
                                                            sizeClasses,
                                                            col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                                                            col.fixed && "bg-inherit group-hover:bg-forest-50 dark:group-hover:bg-forest-900/60" // inherit bg for sticky
                                                        )}
                                                        style={{ width: col.width, ...getStickyStyle(col, colIdx) }}
                                                    >
                                                        <div className={cn("flex items-center gap-2", col.align === 'center' && "justify-center", col.align === 'right' && "justify-end")}>
                                                            {/* Render Expand toggle in first data column if nesting enabled */}
                                                            {hasChildren && isFirstDataCol && (
                                                                <button
                                                                    onClick={(e) => toggleRow(id, e)}
                                                                    className="p-0.5 rounded hover:bg-forest-200 dark:hover:bg-forest-700 text-gray-500 transition-colors mr-1"
                                                                >
                                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                                </button>
                                                            )}
                                                            {renderCell(row, col, rowIndex)}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {/* Nested Row */}
                                        {hasChildren && isExpanded && (
                                            <tr className="bg-gray-50/50 dark:bg-forest-900/10">
                                                <td colSpan={processedColumns.length + (isRowSelection ? 1 : 0)} className="p-0">
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden pl-8 pr-4 py-3"
                                                    >
                                                        {/* Recursive Table or Custom Render? Usually recursive, but let's keep it simple: 
                                                            Just render the nested table with subset of columns or full? 
                                                            User didn't specify recursive structure deeply, so we'll 
                                                            assume generic rendering or pass-through.
                                                            For now, let's just render "Nested Content" or re-use table if structure matches.
                                                            Or simpler: A slot? No, accessor was string. 
                                                            Let's recursively render a minimal Table. 
                                                         */}
                                                        <Table
                                                            data={row[nestedChildrenAccessor as string]}
                                                            columns={columns}
                                                            rowKey={rowKey}
                                                            showHeader={false}
                                                            variant="default" // Nested simpler
                                                            size="sm"
                                                            className="border-l-2 border-forest-200 pl-2"
                                                        />
                                                    </motion.div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between px-2">
                    {/* Info */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {isLoading || showPaginationSkeleton ? (
                            <div className="h-4 w-32 bg-gray-200 dark:bg-forest-800 rounded animate-pulse" />
                        ) : (
                            <>
                                Showing <span className="font-medium">{Math.min(pagination.totalCount, (pagination.currentPage - 1) * pagination.pageSize + 1)}</span> to <span className="font-medium">{Math.min(pagination.totalCount, pagination.currentPage * pagination.pageSize)}</span> of <span className="font-medium">{pagination.totalCount}</span> results
                            </>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange?.(1)}
                            disabled={paginationDisabled || pagination.currentPage === 1 || isLoading}
                            className="p-1 text-gray-500 hover:text-forest-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage - 1)}
                            disabled={paginationDisabled || pagination.currentPage === 1 || isLoading}
                            className="p-1 text-gray-500 hover:text-forest-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[20px] text-center">
                            {isLoading ? "..." : pagination.currentPage}
                        </span>

                        <button
                            onClick={() => onPageChange?.(pagination.currentPage + 1)}
                            disabled={paginationDisabled || pagination.currentPage * pagination.pageSize >= pagination.totalCount || isLoading}
                            className="p-1 text-gray-500 hover:text-forest-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button
                            onClick={() => onPageChange?.(Math.ceil(pagination.totalCount / pagination.pageSize))}
                            disabled={paginationDisabled || pagination.currentPage * pagination.pageSize >= pagination.totalCount || isLoading}
                            className="p-1 text-gray-500 hover:text-forest-700 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                        >
                            <ChevronsRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;

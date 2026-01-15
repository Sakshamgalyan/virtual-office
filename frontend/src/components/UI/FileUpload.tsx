'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    X,
    FileText,
    Image as ImageIcon,
    File as FileIcon,
    Music,
    Video,
    Trash2,
    Pause,
    Play,
    RotateCw,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';
import ProgressBar from './ProgressBar';
import Modal from './Modal';

// Theme Colors Reference (Forest)
// #051f20 (950) -> Darkest
// #0b2b26 (900)
// #163832 (800)
// #235347 (700)
// #8eb69b (300) -> Accent/Primary
// #daf1de (50)  -> Lightest

export type FileStatus = 'queued' | 'uploading' | 'paused' | 'completed' | 'error';

export interface FileUploadItem {
    id: string;
    file: File;
    status: FileStatus;
    progress: number;
    error?: string;
}

export interface FileUploadProps {
    /** Accepted file types (e.g., "image/*, .pdf") */
    accept?: string;
    /** Maximum file size in MB */
    maxSizeMB?: number;
    /** Allow multiple file selection */
    multiple?: boolean;
    /** Component size */
    size?: 'sm' | 'md' | 'lg';
    /** Title displayed in the header */
    title?: React.ReactNode;
    /** List of files to display */
    files?: FileUploadItem[];
    /** Controls visibility if used as a modal */
    open?: boolean;
    /** Disable drag and drop functionality */
    disableDragAndDrop?: boolean;
    /** Text for the cancel button */
    cancelButtonText?: string;
    /** Text for the confirm/upload button */
    confirmButtonText?: string;

    // Callbacks
    /** Triggered when files are added */
    onFilesAdded?: (files: File[]) => void;
    /** Triggered when a specific file is cancelled/removed */
    onFileCancel?: (fileId: string) => void;
    /** Triggered when a file upload is paused */
    onFilePause?: (fileId: string) => void;
    /** Triggered when a file upload is resumed */
    onFileResume?: (fileId: string) => void;
    /** Triggered when a file upload is retried */
    onFileRetry?: (fileId: string) => void;
    /** Triggered when all files are removed */
    onRemoveAll?: () => void;
    /** Triggered when the component/modal is closed */
    onClose?: () => void;
    /** Triggered when the confirm/upload button is clicked */
    onConfirm?: () => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={20} className="text-forest-700" />;
    if (type.startsWith('video/')) return <Video size={20} className="text-forest-700" />;
    if (type.startsWith('audio/')) return <Music size={20} className="text-forest-700" />;
    if (type.includes('pdf')) return <FileText size={20} className="text-forest-700" />;
    return <FileIcon size={20} className="text-forest-700" />;
};

const FileUpload: React.FC<FileUploadProps> = ({
    accept,
    maxSizeMB = 10,
    multiple = true,
    size = 'md',
    title = 'Upload Files',
    files = [],
    open,
    disableDragAndDrop = false,
    cancelButtonText = 'Cancel',
    confirmButtonText = 'Upload',
    onFilesAdded,
    onFileCancel,
    onFilePause,
    onFileResume,
    onFileRetry,
    onRemoveAll,
    onClose,
    onConfirm,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    // Reset error when open changes
    useEffect(() => {
        if (open) setInternalError(null);
    }, [open]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disableDragAndDrop) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disableDragAndDrop) setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disableDragAndDrop) setIsDragging(true);
    };

    const validateFile = (file: File): boolean => {
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
            setInternalError(`File "${file.name}" exceeds maximum size of ${maxSizeMB}MB.`);
            return false;
        }
        // Basic accept validation (simple check)
        if (accept) {
            const acceptedTypes = accept.split(',').map(t => t.trim());
            const fileType = file.type;
            const fileName = file.name;
            const matches = acceptedTypes.some(type => {
                if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', ''));
                if (type.startsWith('.')) return fileName.toLowerCase().endsWith(type.toLowerCase());
                return fileType === type;
            });
            if (!matches) {
                setInternalError(`File "${file.name}" format is not accepted.`);
                return false;
            }
        }
        return true;
    };

    const processFiles = (fileList: FileList | null) => {
        if (!fileList) return;
        setInternalError(null);

        const validFiles: File[] = [];
        Array.from(fileList).forEach(file => {
            if (validateFile(file)) {
                validFiles.push(file);
            }
        });

        if (validFiles.length > 0 && onFilesAdded) {
            onFilesAdded(validFiles);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disableDragAndDrop) return;

        const droppedFiles = e.dataTransfer.files;
        processFiles(droppedFiles);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        if (inputRef.current) inputRef.current.value = ''; // Reset input
    };

    const renderFileItem = (item: FileUploadItem) => (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group flex flex-col p-3 mb-2 bg-white dark:bg-forest-900 border border-gray-100 dark:border-forest-800 rounded-lg shadow-sm hover:border-forest-200 dark:hover:border-forest-700 transition-all"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className="p-2 bg-forest-50 dark:bg-forest-800 rounded-md">
                        {getFileIcon(item.file.type)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={item.file.name}>
                            {item.file.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(item.file.size)} • {item.status}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                    {/* Retry Action */}
                    {item.status === 'error' && onFileRetry && (
                        <button
                            onClick={() => onFileRetry(item.id)}
                            className="p-1.5 text-gray-500 hover:text-forest-600 hover:bg-forest-50 rounded-full transition-colors"
                            title="Retry"
                        >
                            <RotateCw size={16} />
                        </button>
                    )}

                    {/* Pause/Resume Actions */}
                    {item.status === 'uploading' && onFilePause && (
                        <button
                            onClick={() => onFilePause(item.id)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                            title="Pause"
                        >
                            <Pause size={16} />
                        </button>
                    )}
                    {item.status === 'paused' && onFileResume && (
                        <button
                            onClick={() => onFileResume(item.id)}
                            className="p-1.5 text-gray-500 hover:text-forest-600 hover:bg-forest-50 rounded-full transition-colors"
                            title="Resume"
                        >
                            <Play size={16} />
                        </button>
                    )}

                    {/* Cancel/Remove Action */}
                    {onFileCancel && (
                        <button
                            onClick={() => onFileCancel(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Remove"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {item.error && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                    <AlertCircle size={12} />
                    <span>{item.error}</span>
                </div>
            )}

            {/* Progress Bar */}
            {(item.status === 'uploading' || item.status === 'paused' || item.status === 'error' || (item.status === 'completed' && item.progress < 100)) && (
                <div className="mt-2">
                    <ProgressBar
                        value={item.progress}
                        size="sm"
                        variant={item.status === 'error' ? 'error' : item.status === 'completed' ? 'success' : 'default'}
                        color={item.status === 'paused' ? 'bg-amber-400' : undefined}
                    />
                </div>
            )}
        </motion.div>
    );

    const DropZone = () => (
        <div
            onClick={() => inputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
                "relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
                "bg-forest-50/30 dark:bg-forest-900/20",
                isDragging
                    ? "border-forest-500 bg-forest-50 dark:bg-forest-900/40 scale-[1.01]"
                    : "border-gray-200 dark:border-forest-800 hover:border-forest-300 dark:hover:border-forest-700",
                disableDragAndDrop && "cursor-default opacity-60"
            )}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                multiple={multiple}
                accept={accept}
                onChange={handleFileInput}
                disabled={disableDragAndDrop}
            />

            <div className="p-4 rounded-full bg-forest-50 dark:bg-forest-800 text-forest-600 dark:text-forest-400 mb-3">
                <Upload size={24} />
            </div>

            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-center">
                {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                {(accept ? accept.replace(/,/g, ', ') : 'All files') + (maxSizeMB ? ` (Max ${maxSizeMB}MB)` : '')}
            </p>
        </div>
    );

    const Content = (
        <div className="flex flex-col gap-4">
            {/* Header (if not in modal or custom rendering) */}
            {!open && title && (
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-forest-900 dark:text-forest-50">{title}</h3>
                </div>
            )}

            {/* Drop Zone */}
            <DropZone />

            {/* Error Feedback */}
            {internalError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={16} />
                    {internalError}
                </div>
            )}

            {/* File List */}
            {files.length > 0 && (
                <div className="flex flex-col mt-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Files ({files.length})
                        </span>
                        {onRemoveAll && (
                            <button
                                onClick={onRemoveAll}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                            >
                                <Trash2 size={12} />
                                Remove All
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {files.map(renderFileItem)}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Inline Footer (if not in modal) */}
            {!open && (onConfirm || onClose) && (
                <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-gray-100 dark:border-forest-800">
                    {onClose && (
                        <Button variant="secondary" onClick={onClose}>
                            {cancelButtonText}
                        </Button>
                    )}
                    {onConfirm && (
                        <Button
                            variant="primary"
                            onClick={onConfirm}
                            disabled={files.length === 0 || files.some(f => f.status === 'uploading')}
                        >
                            {confirmButtonText}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );

    // If 'open' is strictly boolean, wrap in Modal
    if (typeof open === 'boolean') {
        return (
            <Modal
                isOpen={open}
                onClose={onClose || (() => { })}
                title={title}
                size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
                footer={
                    (onConfirm || onClose) && (
                        <div className="flex justify-end gap-3">
                            {onClose && (
                                <Button variant="secondary" onClick={onClose}>
                                    {cancelButtonText}
                                </Button>
                            )}
                            {onConfirm && (
                                <Button
                                    variant="primary"
                                    onClick={onConfirm}
                                    disabled={files.length === 0 || files.some(f => f.status === 'uploading')}
                                >
                                    {confirmButtonText}
                                </Button>
                            )}
                        </div>
                    )
                }
            >
                {Content}
            </Modal>
        );
    }

    return (
        <div className={cn("w-full", size === 'sm' ? 'max-w-sm' : 'max-w-none')}>
            {Content}
        </div>
    );
};

export default FileUpload;

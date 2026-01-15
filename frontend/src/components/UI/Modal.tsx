'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button'; // Assuming we might use generic button or just icon

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
export type ModalPosition = 'center' | 'top' | 'bottom';
export type ModalVariant = 'default' | 'fullscreen' | 'panel';

export interface ModalProps {
    /** Controls visibility */
    isOpen: boolean;
    /** Callback to close the modal */
    onClose: () => void;
    /** Modal size preset */
    size?: ModalSize;
    /** Screen position */
    position?: ModalPosition;
    /** Layout variant */
    variant?: ModalVariant;
    /** Header Title */
    title?: React.ReactNode;
    /** Header Subtitle */
    subtitle?: React.ReactNode;
    /** Footer content */
    footer?: React.ReactNode;
    /** Show the X close button in header */
    showCloseButton?: boolean;
    /** Whether the modal can be closed (by backdrop/esc) */
    closable?: boolean;
    /** Prevent closing when clicking outside */
    preventBackdropClose?: boolean;
    /** Custom width override */
    customWidth?: string | number;
    /** Custom height override */
    customHeight?: string | number;
    /** Custom background color class or value */
    customBackground?: string;
    /** Animation duration in seconds */
    animationDuration?: number;
    /** Disable entrance/exit animations */
    disableAnimation?: boolean;
    /** Content children */
    children?: React.ReactNode;
    /** Modal root class */
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    size = 'md',
    position = 'center',
    variant = 'default',
    title,
    subtitle,
    footer,
    showCloseButton = true,
    closable = true,
    preventBackdropClose = false,
    customWidth,
    customHeight,
    customBackground,
    animationDuration = 0.3,
    disableAnimation = false,
    children,
    className,
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Locking Scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (closable && e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, closable, onClose]);

    if (!mounted) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closable && !preventBackdropClose) {
            onClose();
        }
    };

    // Size Classes
    const sizeClasses: Record<ModalSize, string> = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full m-4', // full width but with margin unless fullscreen variant
        auto: 'max-w-none',
    };

    // Variant adjustments
    const isFullscreen = variant === 'fullscreen';

    // Position Classes
    const positionClasses: Record<ModalPosition, string> = {
        center: 'items-center justify-center',
        top: 'items-start justify-center pt-10',
        bottom: 'items-end justify-center pb-10', // iOS sheet style if needed
    };

    // Animation Variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: disableAnimation ? 1 : 0.95,
            y: disableAnimation ? 0 : 10
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0
        },
        exit: {
            opacity: 0,
            scale: disableAnimation ? 1 : 0.95,
            y: disableAnimation ? 0 : 10
        }
    };

    const transitionConfig = {
        duration: disableAnimation ? 0 : animationDuration,
        ease: "circOut" as const
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className={cn("fixed inset-0 z-50 flex", positionClasses[position])}>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={backdropVariants}
                        transition={{ duration: disableAnimation ? 0 : 0.2 }}
                        onClick={handleBackdropClick}
                        aria-hidden="true"
                    />

                    {/* Modal Content */}
                    <motion.div
                        className={cn(
                            "relative w-full z-50 flex flex-col shadow-xl origin-center",
                            // Default Background & Border (Forest Theme)
                            !customBackground && "bg-white dark:bg-forest-950 border border-gray-100 dark:border-forest-800",
                            customBackground, // Override if provided

                            // Helper to handle fullscreen vs standard rounded
                            isFullscreen ? "h-screen w-screen rounded-none m-0 max-w-none" : "rounded-xl",
                            !isFullscreen && sizeClasses[size],

                            className
                        )}
                        style={{
                            width: customWidth,
                            height: customHeight
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={modalVariants}
                        transition={transitionConfig}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex items-start justify-between p-6 pb-2">
                                <div className="flex-1">
                                    {title && <h2 className="text-xl font-semibold text-forest-900 dark:text-forest-50">{title}</h2>}
                                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                                </div>
                                {showCloseButton && closable && (
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-forest-900"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className={cn("p-6", "flex-1 overflow-y-auto")}>
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="p-6 pt-2 border-t border-gray-100 dark:border-forest-800/50 mt-auto">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;

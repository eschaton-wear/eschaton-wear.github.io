'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="confirm-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                />
            )}
            {isOpen && (
                <motion.div
                    key="confirm-content"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed left-1/2 top-1/2 z-[110] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
                >
                    <div className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl backdrop-blur-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-[var(--foreground)]/5 text-[var(--foreground)]'}`}>
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-[var(--foreground)]">{title}</h3>
                            </div>
                        </div>

                        <p className="text-[var(--text-secondary)] mb-8 px-1">
                            {message}
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-[var(--card-border)] hover:bg-[var(--foreground)]/5 text-[var(--foreground)] font-medium transition-colors"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg ${isDestructive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90'}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    }, [removeToast]);

    const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
    const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);
    const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence mode='popLayout'>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
    const icons = {
        success: <Check size={18} className="text-green-500" />,
        error: <AlertCircle size={18} className="text-red-500" />,
        warning: <AlertTriangle size={18} className="text-amber-500" />,
        info: <Info size={18} className="text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-[var(--card-bg)] border-green-500/20',
        error: 'bg-[var(--card-bg)] border-red-500/20',
        warning: 'bg-[var(--card-bg)] border-amber-500/20',
        info: 'bg-[var(--card-bg)] border-blue-500/20',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className={`pointer-events-auto flex items-center gap-3 min-w-[300px] max-w-sm px-4 py-3 rounded-xl border shadow-lg backdrop-blur-xl ${bgColors[toast.type]}`}
        >
            <div className="shrink-0">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-medium text-[var(--foreground)]">{toast.message}</p>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--foreground)]/10 text-[var(--text-secondary)] transition-colors">
                <X size={14} />
            </button>
        </motion.div>
    );
};

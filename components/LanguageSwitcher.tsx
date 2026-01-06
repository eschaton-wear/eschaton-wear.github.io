'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useI18n } from '@/utils/i18n';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'zh', label: '中文' },
        { code: 'ru', label: 'Русский' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--foreground)]/30 bg-[var(--foreground)]/5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300 shadow-sm"
            >
                <Globe size={14} />
                <span className="uppercase">{language}</span>
            </button>

            {/* Backdrop to close */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden min-w-[120px] backdrop-blur-md z-50"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code as any);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${language === lang.code
                                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                                    : 'text-[var(--foreground)] hover:bg-[var(--foreground)]/10'
                                    }`}
                            >
                                <span>{lang.label}</span>
                                {language === lang.code && (
                                    <span className="text-[10px] ml-2 opacity-60">✓</span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '@/utils/sounds';

interface ThemeSwitcherProps {
    currentTheme: 'white' | 'dark';
    setTheme: (theme: 'white' | 'dark') => void;
}

export default function ThemeSwitcher({ currentTheme, setTheme }: ThemeSwitcherProps) {
    const toggleTheme = () => {
        const newTheme = currentTheme === 'white' ? 'dark' : 'white';
        soundManager.play('transition');
        setTheme(newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--foreground)]/50 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
            title={`Switch to ${currentTheme === 'white' ? 'dark' : 'light'} mode`}
        >
            <AnimatePresence mode="wait">
                {currentTheme === 'white' ? (
                    <motion.div
                        key="sun"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <Sun className="w-4 h-4 text-[var(--foreground)]" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        <Moon className="w-4 h-4 text-[var(--foreground)]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-[var(--foreground)]/0 group-hover:bg-[var(--foreground)]/5 transition-colors duration-300" />
        </button>
    );
}

'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { soundManager } from '@/utils/sounds';
import { User } from '@supabase/supabase-js';
import { useI18n } from '@/utils/i18n';

interface HeroProps {
    onSearch: (query: string) => void;
    user: User | null;
    hasSubscription: boolean;
    onShowAuthModal: () => void;
    onShowUpgradeModal: () => void;
    currentModel: 'normal' | 'portal';
    onModelChange: (model: 'normal' | 'portal') => void;
    isUltra: boolean;
}

const InteractiveChar = ({ char }: { char: string }) => {
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        setIsActive(true);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleMouseLeave = () => {
        timerRef.current = setTimeout(() => {
            setIsActive(false);
        }, 500);
    };

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const safeChar = char === " " ? "\u00A0" : char;

    return (
        <span
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="inline-grid relative cursor-default select-none place-items-center"
        >
            {/* Width Stabilizers: Both fonts rendered invisibly to lock the container width */}
            <span className="invisible pointer-events-none col-start-1 row-start-1 font-sans opacity-0" aria-hidden="true">
                {safeChar}
            </span>
            <span className="invisible pointer-events-none col-start-1 row-start-1 font-serif italic opacity-0" aria-hidden="true">
                {safeChar}
            </span>

            {/* The Actual Animated Character */}
            <motion.span
                layout
                animate={{
                    fontFamily: isActive ? 'var(--font-instrument-serif)' : 'var(--font-geist-sans)',
                    fontStyle: isActive ? 'italic' : 'normal',
                    y: isActive ? -4 : 0,
                    opacity: isActive ? 1 : 0.8,
                    scale: isActive ? 1.15 : 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: isActive ? 400 : 150,
                    damping: isActive ? 25 : 30,
                    mass: 1,
                    layout: { duration: 0.2, ease: "easeOut" }
                }}
                className="col-start-1 row-start-1"
                style={{
                    willChange: 'transform, opacity',
                    fontFamily: 'inherit'
                }}
            >
                {safeChar}
            </motion.span>
        </span>
    );
};

export default function Hero({
    onSearch,
    user,
    hasSubscription,
    onShowAuthModal,
    onShowUpgradeModal,
    currentModel,
    onModelChange,
    isUltra
}: HeroProps) {
    const { t } = useI18n();
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        // Delegate all logic to parent (page.tsx)
        onSearch(query);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 text-center">

            {/* Headline */}
            <motion.h1
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center justify-center text-center text-5xl md:text-7xl font-medium tracking-tighter mb-12 max-w-5xl text-[var(--foreground)] transition-colors"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap justify-center"
                >
                    {t('hero.headline.part1').split(" ").map((word, wordIdx) => (
                        <motion.span
                            key={wordIdx}
                            layout
                            className="inline-flex mr-[0.3em] whitespace-nowrap"
                            style={{ willChange: 'transform' }}
                        >
                            {word.split("").map((char, charIdx) => (
                                <InteractiveChar key={charIdx} char={char} />
                            ))}
                        </motion.span>
                    ))}
                </motion.div>
                <motion.span
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="font-serif italic font-normal text-6xl md:text-8xl mt-2 opacity-90"
                >
                    {t('hero.headline.part2')}
                </motion.span>
            </motion.h1>

            {/* Chat Input Area */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="w-full max-w-2xl relative group"
            >
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[var(--foreground)]/10 via-[var(--foreground)]/5 to-[var(--foreground)]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className={`relative flex items-center bg-[var(--card-bg)] backdrop-blur-md rounded-[2rem] md:rounded-full shadow-lg border transition-colors p-1.5 md:p-2 ${currentModel === 'portal' ? 'border-[var(--foreground)]/30 ring-1 ring-[var(--foreground)]/10' : 'border-[var(--card-border)]'}`}>

                    {/* Model Switcher - Left Side */}
                    <div className="flex items-center gap-1 pl-1 md:pl-2 pr-1 md:pr-2 border-r border-[var(--text-secondary)]/10 mr-1 md:mr-2">
                        <button
                            type="button"
                            onClick={() => onModelChange('normal')}
                            className={`p-2 rounded-xl transition-all ${currentModel === 'normal' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-secondary)] hover:bg-[var(--foreground)]/5'}`}
                            title={t('hero.mode.normal')}
                        >
                            <Brain className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (currentModel !== 'portal') {
                                    if (!user) { onShowAuthModal(); return; }
                                    if (!hasSubscription) { onShowUpgradeModal(); return; }
                                    if (!isUltra) { onShowUpgradeModal(); return; }
                                    onModelChange('portal');
                                }
                            }}
                            className={`p-2 rounded-xl transition-all ${currentModel === 'portal' ? 'bg-[var(--foreground)] text-[var(--background)] shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--foreground)]/5'}`}
                            title={t('hero.mode.portal')}
                        >
                            <Zap className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('hero.input.placeholder')}
                        className="flex-1 bg-transparent border-none px-2 md:px-6 py-3 md:py-4 text-base md:text-xl focus:ring-0 focus:outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 outline-none text-current min-w-0"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-[var(--foreground)] text-[var(--background)] rounded-full p-3 md:px-8 md:py-4 font-medium text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 duration-300 shrink-0"
                    >
                        <span className="hidden md:inline">{t('hero.button.generate')}</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>

        </div>
    );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ArrowRight, Sparkles, Copy, Check, Brain, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { soundManager } from '@/utils/sounds';
import { User } from '@supabase/supabase-js';
import { useI18n } from '@/utils/i18n';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface ChatProps {
    messages: Message[];
    onSearch: (query: string) => void;
    isLoading: boolean;
    isPortal?: boolean;
    currentModel: 'normal' | 'portal';
    onModelChange: (model: 'normal' | 'portal') => void;
    isUltra: boolean;
    user: User | null;
    hasSubscription: boolean;
    subscriptionTier: 'base' | 'ultra' | null;
    onShowAuthModal: () => void;
    onShowUpgradeModal: () => void;
}

export default function Chat({
    messages,
    onSearch,
    isLoading,
    isPortal = false,
    currentModel,
    onModelChange,
    isUltra,
    user,
    hasSubscription,
    subscriptionTier,
    onShowAuthModal,
    onShowUpgradeModal
}: ChatProps) {
    const { t } = useI18n();
    const [input, setInput] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(messages.length);
    const prevIsLoading = useRef(isLoading);

    useEffect(() => {
        // Play receive sound ONLY when AI finishes response
        // Trigger when isLoading goes from true -> false
        if (prevIsLoading.current && !isLoading) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                soundManager.play('receive', currentModel);
            }
        }
        prevIsLoading.current = isLoading;
    }, [isLoading, messages, currentModel]);

    // Generate random values for portal particles once on mount
    const [portalParticles] = useState(() =>
        [...Array(20)].map(() => ({
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            dur: Math.random() * 3 + 2,
            delay: Math.random() * 5
        }))
    );


    // Typing sound removed as per user request (was annoying)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Check 1: User must be authenticated
        if (!user) {
            onShowAuthModal();
            return;
        }

        // Check 2: User must have an active subscription
        if (!hasSubscription) {
            onShowUpgradeModal();
            return;
        }

        // Check 3: Portal mode requires Ultra subscription
        if (currentModel === 'portal' && subscriptionTier !== 'ultra') {
            onShowUpgradeModal();
            return;
        }

        // All checks passed - send message
        onSearch(input);
        setInput('');
    };

    const handleCopy = (content: string, index: number) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-60">
            <AnimatePresence>
                {isPortal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none z-0"
                    >
                        {portalParticles.map((p, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-[var(--foreground)]/30 rounded-full"
                                initial={{
                                    x: p.x,
                                    y: p.y,
                                    opacity: 0,
                                    scale: 0
                                }}
                                animate={{
                                    y: [null, "-=100"],
                                    opacity: [0, 0.5, 0],
                                    scale: [0, 1.5, 0]
                                }}
                                transition={{
                                    duration: p.dur,
                                    repeat: Infinity,
                                    delay: p.delay
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-12 py-10 relative z-10">
                {messages.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 rounded-3xl bg-[var(--foreground)]/5 flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-8 h-8 text-[var(--foreground)]" />
                        </div>
                        <h2 className="text-2xl font-medium mb-2">{t('chat.new_conversation')}</h2>
                        <p className="text-[var(--text-secondary)]">{t('chat.welcome_text')}</p>
                    </motion.div>
                )}
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                            duration: 0.6,
                            ease: [0.23, 1, 0.32, 1],
                            layout: { duration: 0.3 }
                        }}
                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-[var(--foreground)]" />
                            </div>
                        )}
                        <div className={`relative group ${msg.role === 'user' ? 'max-w-[85%]' : 'max-w-[85%]'}`}>
                            <div className={`prose prose-lg ${msg.role === 'user' ? 'bg-[var(--foreground)]/5 rounded-2xl px-6 py-3 text-[var(--foreground)]' : 'text-[var(--foreground)]'}`}>
                                {msg.role === 'user' ? (
                                    <p className="m-0 font-medium">{msg.content}</p>
                                ) : (
                                    <ReactMarkdown components={{
                                        p: ({ node, ...props }) => <p className="leading-relaxed mb-4 text-lg" {...props} />
                                    }}>
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                            {msg.role === 'assistant' && (
                                <button
                                    onClick={() => handleCopy(msg.content, i)}
                                    className="absolute -right-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-[var(--foreground)]/10"
                                    title={t('chat.copy')}
                                >
                                    {copiedIndex === i ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center shrink-0 animate-pulse">
                            <span className="w-2 h-2 bg-[var(--foreground)] rounded-full" />
                        </div>
                        <div className="text-[var(--text-secondary)] italic font-serif">{t('chat.thinking')}</div>
                    </div>
                )}
                <div className="h-48 w-full" />
                <div ref={bottomRef} className="scroll-mt-32" />
            </div>

            <div className="fixed bottom-8 left-0 right-0 z-50 flex flex-col items-center gap-4 px-4">
                {isUltra && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--card-bg)] backdrop-blur-md border border-[var(--card-border)] rounded-2xl shadow-xl p-1 flex gap-1 mb-2"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                if (currentModel !== 'normal') {
                                    onModelChange('normal');
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${currentModel === 'normal' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'text-[var(--text-secondary)] hover:bg-[var(--foreground)]/5'}`}
                        >
                            <Brain className="w-4 h-4" />
                            Normal
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (currentModel !== 'portal') {
                                    // Check 1: User must be authenticated
                                    if (!user) {
                                        onShowAuthModal();
                                        return;
                                    }

                                    // Check 2: User must have subscription
                                    if (!hasSubscription) {
                                        onShowUpgradeModal();
                                        return;
                                    }

                                    // Check 3: Must have Ultra subscription for Portal
                                    if (subscriptionTier !== 'ultra') {
                                        onShowUpgradeModal();
                                        return;
                                    }

                                    // All checks passed - switch to Portal
                                    onModelChange('portal');
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${currentModel === 'portal' ? 'bg-[var(--foreground)] text-[var(--background)] shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--foreground)]/5'}`}
                        >
                            <Zap className="w-4 h-4" />
                            Portal
                        </button>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group">
                    <div className={`absolute -inset-2 rounded-full blur-2xl transition-all duration-700 ${isPortal ? 'bg-gradient-to-r from-[var(--foreground)]/10 via-[var(--foreground)]/5 to-[var(--foreground)]/10 opacity-100' : 'bg-gradient-to-r from-gray-200/40 to-gray-50/40 opacity-0 group-hover:opacity-100'}`} />
                    <div className={`relative flex items-center bg-[var(--card-bg)] backdrop-blur-md rounded-full shadow-2xl border transition-all duration-500 ${isPortal ? 'border-[var(--foreground)]/30 ring-2 ring-[var(--foreground)]/10' : 'border-[var(--card-border)]'} p-2`}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chat.placeholder')}
                            className="flex-1 bg-transparent border-none px-6 py-3 text-lg focus:ring-0 text-[var(--foreground)] placeholder:text-[var(--text-secondary)]/50 outline-none min-w-0"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-[var(--foreground)] text-[var(--background)] rounded-full p-3 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <ArrowRight className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

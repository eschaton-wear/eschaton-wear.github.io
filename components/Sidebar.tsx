'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2, X, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useI18n } from '@/utils/i18n';

export interface ChatSession {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    chats: ChatSession[];
    currentChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onNewChat: (title: string) => void;
    onDeleteChat: (chatId: string) => void;
}

export default function Sidebar({
    isOpen,
    setIsOpen,
    chats,
    currentChatId,
    onSelectChat,
    onNewChat,
    onDeleteChat
}: SidebarProps) {
    const { t } = useI18n();
    const [isMobile, setIsMobile] = useState(false);
    const [isNaming, setIsNaming] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState('');

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleCreateChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (newChatTitle.trim()) {
            onNewChat(newChatTitle.trim());
            setNewChatTitle('');
            setIsNaming(false);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <motion.button
                initial={false}
                animate={{
                    x: isOpen ? 260 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                whileHover={{
                    scale: 1.05,
                    backgroundColor: "var(--foreground)",
                    color: "var(--background)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed left-4 top-20 md:top-24 z-40 p-2 md:p-3 rounded-xl bg-[var(--card-bg)] backdrop-blur-md border border-[var(--card-border)] shadow-xl text-[var(--foreground)] outline-none active:scale-95"
                title={isOpen ? "Close Sidebar" : "Open History"}
            >
                {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </motion.button>

            {/* Sidebar Container */}
            <motion.div
                initial={false}
                animate={{
                    x: isOpen ? 0 : -300,
                    opacity: isOpen ? 1 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 bottom-0 w-[280px] z-30 bg-[var(--card-bg)] backdrop-blur-xl border-r border-[var(--card-border)] pt-24 pb-6 px-4 flex flex-col shadow-2xl"
            >
                <div className="mb-6 relative">
                    <AnimatePresence mode="wait">
                        {!isNaming ? (
                            <motion.button
                                key="new-chat-btn"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                onClick={() => setIsNaming(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-medium transition-all shadow-lg shadow-[var(--foreground)]/10 active:scale-95 group"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span>{t('general.new_chat')}</span>
                            </motion.button>
                        ) : (
                            <motion.form
                                key="naming-form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onSubmit={handleCreateChat}
                                className="w-full space-y-2"
                            >
                                <input
                                    autoFocus
                                    type="text"
                                    value={newChatTitle}
                                    onChange={(e) => setNewChatTitle(e.target.value)}
                                    placeholder={t('general.chat_name')}
                                    className="w-full bg-[var(--foreground)]/5 border border-[var(--card-border)] rounded-xl px-4 py-2 text-sm text-[var(--foreground)] focus:ring-1 ring-[var(--foreground)]/20 outline-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 text-xs font-semibold bg-[var(--foreground)] text-[var(--background)] py-2 rounded-lg hover:opacity-90"
                                    >
                                        {t('general.create')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsNaming(false);
                                            setNewChatTitle('');
                                        }}
                                        className="px-3 text-xs font-semibold bg-[var(--foreground)]/10 text-[var(--foreground)] py-2 rounded-lg hover:bg-[var(--foreground)]/20"
                                    >
                                        {t('general.cancel')}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {chats.length === 0 ? (
                        <div className="text-center text-[var(--text-secondary)] py-8 text-sm opacity-60">
                            <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p>{t('general.no_history')}</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <motion.div
                                key={chat.id}
                                whileHover={{ x: 4 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all border border-transparent ${currentChatId === chat.id
                                    ? 'bg-[var(--foreground)]/10 text-[var(--foreground)] font-medium shadow-sm border-[var(--foreground)]/10'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] hover:border-[var(--card-border)]'
                                    }`}
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <MessageSquare size={16} className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${currentChatId === chat.id ? 'text-[var(--foreground)]' : 'opacity-50'}`} />

                                <span className="text-sm truncate flex-1">{chat.title}</span>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChat(chat.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-red-500 transition-all transform hover:scale-110"
                                    title={t('general.delete_chat_title')}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-[var(--card-border)] mt-2">
                    <p className="text-[10px] text-center text-[var(--text-secondary)] opacity-50">
                        {t('general.auto_save')}
                    </p>
                </div>
            </motion.div>
        </>
    );
}

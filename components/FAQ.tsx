'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { soundManager } from '@/utils/sounds';
import { useI18n } from '@/utils/i18n';

export default function FAQ() {
    const { t } = useI18n();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const FAQS = [
        { question: t('faq.q1'), answer: t('faq.a1') },
        { question: t('faq.q2'), answer: t('faq.a2') },
        { question: t('faq.q3'), answer: t('faq.a3') },
        { question: t('faq.q4'), answer: t('faq.a4') },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-20 pb-32">
            <div className="flex items-center gap-2 mb-8">
                <span className="h-1 w-1 rounded-full bg-[var(--foreground)]"></span>
                <h2 className="text-xl font-medium font-serif italic text-[var(--foreground)]">{t('faq.title')}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {FAQS.map((faq, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => {
                            setOpenIndex(openIndex === i ? null : i);
                        }}
                        className="group cursor-pointer bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6">
                            <span className="font-medium text-lg text-[var(--foreground)]">{faq.question}</span>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${openIndex === i ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--card-border)] group-hover:bg-[var(--accent)] group-hover:text-white'}`}>
                                <Plus className={`w-4 h-4 transition-transform duration-300 ${openIndex === i ? 'rotate-45' : ''}`} />
                            </div>
                        </div>

                        <div
                            className={`grid transition-all duration-300 ease-in-out ${openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                }`}
                        >
                            <div className="overflow-hidden">
                                <p className="px-6 pb-10 pt-4 opacity-70 leading-relaxed text-lg font-medium text-[var(--foreground)]">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

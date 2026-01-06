'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/utils/i18n';

export default function Trust() {
    const { t } = useI18n();

    const pillars = [
        t('trust.pillar1'), t('trust.pillar2'), t('trust.pillar3'),
        t('trust.pillar1'), t('trust.pillar2'), t('trust.pillar3')
    ];

    return (
        <section className="w-full py-12 border-y border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden mb-20 transition-colors">
            <div className="flex w-full">
                <motion.div
                    animate={{ x: "-50%" }}
                    transition={{
                        duration: 30, // Slower for premium feel
                        ease: "linear",
                        repeat: Infinity
                    }}
                    className="flex whitespace-nowrap gap-16 md:gap-32 px-8 text-2xl font-serif italic opacity-30 select-none"
                >
                    {/* Duplicate the set to ensure seamless loop: [A, B, C, A, B, C] -> animate -50% */}
                    {[...pillars, ...pillars].map((text, i) => (
                        <span key={i} className="shrink-0 hover:opacity-100 transition-opacity cursor-default text-[var(--foreground)] px-4">
                            {text}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

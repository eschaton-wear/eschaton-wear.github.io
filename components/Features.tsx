'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, Globe } from 'lucide-react';
import { soundManager } from '@/utils/sounds';
import { useI18n } from '@/utils/i18n';

export default function Features() {
    const { t } = useI18n();

    const features = [
        {
            icon: Brain,
            title: t('feature.deep_reasoning.title'),
            description: t('feature.deep_reasoning.desc')
        },
        {
            icon: Globe,
            title: t('feature.global_context.title'),
            description: t('feature.global_context.desc')
        },
        {
            icon: Zap,
            title: t('feature.real_time.title'),
            description: t('feature.real_time.desc')
        }
    ];

    return (
        <section className="py-24 px-4 w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{
                            duration: 0.8,
                            delay: i * 0.15,
                            ease: [0.23, 1, 0.32, 1]
                        }}
                        viewport={{ once: true }}
                        whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.4 } }}
                        className="group relative p-8 rounded-3xl bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)] shadow-lg cursor-default overflow-hidden transition-colors"
                    >
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-[var(--foreground)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center mb-6 shadow-xl">
                                <feature.icon className="w-6 h-6" />
                            </div>

                            <h3 className="text-xl font-medium mb-3 tracking-tight">{feature.title}</h3>
                            <p className="opacity-70 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

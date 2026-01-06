'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Check } from 'lucide-react';
import { soundManager } from '@/utils/sounds';
import { useI18n } from '@/utils/i18n';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: (tier: 'base' | 'ultra') => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgrade }: UpgradeModalProps) {
    const { t } = useI18n();

    const tiers = [
        {
            name: 'Base',
            price: '29€',
            tier: 'base' as const,
            description: t('upgrade.plan.base.desc'),
            features: [
                t('upgrade.features.base.0'),
                t('upgrade.features.base.1'),
                t('upgrade.features.base.2'),
                t('upgrade.features.base.3')
            ],
            highlighted: false
        },
        {
            name: 'Ultra',
            price: '59€',
            tier: 'ultra' as const,
            description: t('upgrade.plan.ultra.desc'),
            features: [
                t('upgrade.features.ultra.0'),
                t('upgrade.features.ultra.1'),
                t('upgrade.features.ultra.2'),
                t('upgrade.features.ultra.3')
            ],
            highlighted: true
        }
    ];

    const handleUpgrade = (tier: 'base' | 'ultra') => {
        onUpgrade(tier);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 px-4 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-2xl backdrop-blur-xl transition-colors duration-500">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--foreground)]/5 text-[var(--foreground)] mb-4">
                                    <Zap size={32} />
                                </div>
                                <h2 className="text-3xl font-bold mb-2 text-[var(--foreground)]">
                                    {t('upgrade.title')}
                                </h2>
                                <p className="text-[var(--foreground)]/60 max-w-sm mx-auto leading-relaxed">
                                    {t('upgrade.subtitle')}
                                </p>
                            </div>

                            {/* Pricing Tiers */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tiers.map((tier) => (
                                    <motion.div
                                        key={tier.name}
                                        whileHover={{ scale: 1.02 }}
                                        className={`relative p-6 rounded-3xl border transition-all duration-300 ${tier.highlighted
                                            ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-2xl'
                                            : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] shadow-sm hover:shadow-lg'
                                            }`}
                                    >
                                        {tier.highlighted && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-[var(--card-border)]">
                                                {t('upgrade.recommended')}
                                            </div>
                                        )}

                                        <div className="mb-6">
                                            <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold">{tier.price}</span>
                                                <span className={`text-sm ${tier.highlighted ? 'opacity-70' : 'text-[var(--foreground)]/50'}`}>
                                                    {t('upgrade.month')}
                                                </span>
                                            </div>
                                            <p className={`mt-3 text-sm ${tier.highlighted ? 'opacity-80' : 'text-[var(--foreground)]/60'}`}>
                                                {tier.description}
                                            </p>
                                        </div>

                                        <ul className="space-y-3 mb-6">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm">
                                                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${tier.highlighted ? 'text-[var(--background)]' : 'text-[var(--foreground)]'
                                                        }`} />
                                                    <span className={tier.highlighted ? 'opacity-90' : 'text-[var(--foreground)]/80'}>
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleUpgrade(tier.tier)}
                                            className={`w-full py-3 rounded-full font-medium transition-all ${tier.highlighted
                                                ? 'bg-[var(--background)] text-[var(--foreground)] hover:opacity-90'
                                                : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 shadow-lg'
                                                }`}
                                        >
                                            {t('upgrade.choose')} {tier.name}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

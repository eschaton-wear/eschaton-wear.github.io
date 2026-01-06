'use client';

import { motion } from 'framer-motion';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getFullSubscriptionInfo, FullSubscriptionInfo } from '@/utils/supabase/subscription';
import AnimatedGradient from '@/components/AnimatedGradient';
import GlassSphereBackground from '@/components/GlassSphereBackground';
import { AnimatePresence } from 'framer-motion';

const tiers = [
    {
        name: 'Base',
        price: '29€',
        tier: 'base' as const,
        description: 'Essential brand analysis for growing businesses.',
        features: ['Advanced AI analysis', 'Brand diagnostics', 'Standard response time', 'Email support'],
        cta: 'Get Started',
        highlighted: false
    },
    {
        name: 'Ultra',
        price: '59€',
        tier: 'ultra' as const,
        description: 'Premium intelligence with Portal Mode capabilities.',
        features: ['Portal Mode: Most powerful AI', 'Deep reasoning engine', 'Priority latency', 'Dedicated success manager'],
        cta: 'Upgrade to Ultra',
        highlighted: true
    }
];

export default function Pricing() {
    const [user, setUser] = useState<User | null>(null);
    const [subscriptionInfo, setSubscriptionInfo] = useState<FullSubscriptionInfo | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const theme = 'dark'; // Always use dark theme
    const [currentModel, setCurrentModel] = useState<'normal' | 'portal'>('normal');

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Always use dark theme
        document.documentElement.setAttribute('data-theme', 'dark');

        const savedModel = localStorage.getItem('model_preference') as 'normal' | 'portal';
        if (savedModel) setCurrentModel(savedModel);

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const info = await getFullSubscriptionInfo(user.id);
                setSubscriptionInfo(info);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const info = await getFullSubscriptionInfo(session.user.id);
                setSubscriptionInfo(info);
            } else {
                setSubscriptionInfo(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubscribe = async (tier: 'base' | 'ultra') => {
        // Prevent double subscription or upgrading to something they already have
        if (subscriptionInfo?.hasSubscription && subscriptionInfo.tier === tier) {
            return;
        }

        if (!user) {
            setShowAuthPrompt(true);
            setTimeout(() => setShowAuthPrompt(false), 3000);
            router.push('/?auth=signup');
            return;
        }

        setLoading(tier);

        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create checkout session');
            }

            const data = await response.json();

            if (data.url) {
                // Using window.location.href instead of assign for better compatibility
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            setLoading(null);
            // Show toast or error UI if needed
        }
    };



    return (
        <div className="min-h-screen w-full flex flex-col items-center py-12 md:py-24 px-4 relative overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <AnimatePresence>
                    {currentModel === 'portal' ? (
                        <motion.div
                            key="portal-bg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="fixed inset-0"
                        >
                            <GlassSphereBackground theme={theme} isPortal={true} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="standard-bg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="fixed inset-0"
                        >
                            <AnimatedGradient theme={theme} isPortal={false} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Back Nav - More Prominent */}
            <div className="absolute top-6 left-6 z-10">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all duration-300 shadow-lg hover:shadow-xl font-medium group backdrop-blur-xl"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline">Back to Intelligence</span>
                    <span className="sm:hidden">Back</span>
                </Link>
            </div>

            {/* Auth Prompt */}
            {showAuthPrompt && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg"
                >
                    Please create an account first
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 md:mb-16 mt-16 md:mt-0 relative z-10"
            >
                <h1 className="text-3xl md:text-5xl font-medium mb-4">
                    Select your <span className="font-serif italic font-normal">Capacity</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Choose the depth of intelligence you require.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl relative z-10">
                {tiers.map((tier, i) => (
                    <motion.div
                        key={tier.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.2 }}
                        className={`relative p-6 md:p-8 rounded-3xl border ${tier.highlighted
                            ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] shadow-2xl'
                            : 'bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] shadow-sm hover:shadow-lg'
                            } flex flex-col transition-all duration-300`}
                    >
                        {tier.highlighted && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                RECOMMENDED
                            </div>
                        )}

                        <div className="mb-8 relative z-10">
                            <h3 className="text-xl font-medium mb-2">{tier.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl md:text-4xl font-semibold">{tier.price}</span>
                                <span className={`text-sm ${tier.highlighted ? 'opacity-70' : 'text-gray-600 dark:text-gray-400'}`}>
                                    /month
                                </span>
                            </div>
                            <p className={`mt-4 text-sm ${tier.highlighted ? 'opacity-80' : 'text-gray-600 dark:text-gray-400'}`}>
                                {tier.description}
                            </p>
                        </div>

                        <ul className="flex-1 space-y-4 mb-8 relative z-10">
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-3 text-sm">
                                    <div className={`mt-0.5 rounded-full p-0.5 ${tier.highlighted
                                        ? 'bg-[var(--background)]/20'
                                        : 'bg-[var(--foreground)]/5'
                                        }`}>
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span className={tier.highlighted ? 'opacity-90' : 'text-gray-600 dark:text-gray-300'}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleSubscribe(tier.tier)}
                            disabled={
                                loading === tier.tier ||
                                (subscriptionInfo?.hasSubscription && (
                                    (subscriptionInfo.tier === 'ultra') ||
                                    (subscriptionInfo.tier === 'base' && tier.tier === 'base')
                                ))
                            }
                            className={`w-full py-4 rounded-full font-medium transition-all relative z-10 ${tier.highlighted
                                ? 'bg-[var(--background)] text-[var(--foreground)] hover:opacity-90'
                                : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 shadow-lg'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading === tier.tier ? 'Loading...' :
                                (subscriptionInfo?.hasSubscription && subscriptionInfo.tier === tier.tier) ? 'Current Plan' :
                                    (subscriptionInfo?.hasSubscription && subscriptionInfo.tier === 'ultra' && tier.tier === 'base') ? 'Included' :
                                        tier.cta
                            }
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

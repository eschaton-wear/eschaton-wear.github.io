'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AnimatedGradient from '@/components/AnimatedGradient';
import { useEffect } from 'react';



export default function PrivacyPage() {
    const theme = 'dark'; // Always use dark theme

    useEffect(() => {
        // Always use dark theme
        document.documentElement.setAttribute('data-theme', 'dark');
    }, []);
    return (
        <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
            <div className="fixed inset-0 z-0">
                <AnimatedGradient theme={theme} isPortal={false} />
            </div>

            <div className="relative z-10 pt-24 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors mb-12 group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-16 text-center"
                    >
                        <div className="inline-flex items-center justify-center p-5 rounded-3xl bg-[var(--foreground)]/5 border border-[var(--card-border)] mb-8 shadow-xl backdrop-blur-xl">
                            <Shield className="w-10 h-10 text-[var(--foreground)]" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-[var(--foreground)]/60 max-w-2xl mx-auto leading-relaxed">
                            Your privacy is our priority. Learn how we handle your data.
                        </p>
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] p-8 md:p-14 shadow-2xl backdrop-blur-2xl"
                    >
                        <div className="prose prose-lg dark:prose-invert max-w-none text-[var(--foreground)]/80 prose-headings:text-[var(--foreground)] prose-headings:font-bold prose-p:leading-relaxed">
                            <h3>1. Introduction</h3>
                            <p>
                                Welcome to Léger AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                            </p>

                            <h3>2. Data We Collect</h3>
                            <p>
                                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                            </p>
                            <ul>
                                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                                <li><strong>Contact Data</strong> includes email address and telephone number.</li>
                                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform and other technology on the devices you use to access this website.</li>
                                <li><strong>Usage Data</strong> includes information about how you use our website, products and services.</li>
                            </ul>

                            <h3>3. How We Use Your Data</h3>
                            <p>
                                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                            </p>
                            <ul>
                                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                <li>Where we need to comply with a legal or regulatory obligation.</li>
                            </ul>

                            <h3>4. Data Security</h3>
                            <p>
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                            </p>

                            <h3>5. Your Rights</h3>
                            <p>
                                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to Request access to your personal data, Request correction of your personal data, Request erasure of your personal data, Object to processing of your personal data, Request restriction of processing your personal data, Request transfer of your personal data, and Right to withdraw consent.
                            </p>

                            <h3>6. Contact Us</h3>
                            <p>
                                If you have any questions about this privacy policy or our privacy practices, please contact us at support@leger-ai.com.
                            </p>
                        </div>

                        <div className="mt-16 pt-10 border-t border-[var(--card-border)] flex justify-center">
                            <Link href="/" className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl">
                                <FileText size={20} /> Return to Home
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AnimatedGradient from '@/components/AnimatedGradient';
import { useEffect } from 'react';



export default function TermsPage() {
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
                            <FileText className="w-10 h-10 text-[var(--foreground)]" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Terms of Service
                        </h1>
                        <p className="text-xl text-[var(--foreground)]/60 max-w-2xl mx-auto leading-relaxed">
                            Please read these terms carefully before using our service.
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
                            <h3>1. Acceptance of Terms</h3>
                            <p>
                                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>

                            <h3>2. Description of Service</h3>
                            <p>
                                Léger AI provides users with access to a collection of resources, including various communications tools, forums, shopping services, and personalized content through its network of properties which may be accessed through any various medium or device.
                            </p>

                            <h3>3. User Registration</h3>
                            <p>
                                You agree to: (a) provide true, accurate, current and complete information about yourself as prompted by the Service&apos;s registration form and (b) maintain and promptly update the Registration Data to keep it true, accurate, current and complete.
                            </p>

                            <h3>4. User Conduct</h3>
                            <p>
                                You understand that all information, data, text, software, music, sound, photographs, graphics, video, messages or other materials (&quot;Content&quot;), whether publicly posted or privately transmitted, are the sole responsibility of the person from which such Content originated.
                            </p>

                            <h3>5. Intellectual Property</h3>
                            <p>
                                The Service and its original content, features and functionality are and will remain the exclusive property of Léger AI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                            </p>

                            <h3>6. Termination</h3>
                            <p>
                                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>

                            <h3>7. Limitation of Liability</h3>
                            <p>
                                In no event shall Léger AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                            </p>

                            <h3>8. Changes</h3>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
                            </p>
                        </div>

                        <div className="mt-16 pt-10 border-t border-[var(--card-border)] flex justify-center">
                            <Link href="/" className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-xl">
                                <CheckCircle size={20} /> I Agree, Return to Home
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

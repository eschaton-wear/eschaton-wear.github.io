'use client';

import Link from 'next/link';
import { AlertCircle, Home } from 'lucide-react';
import AnimatedGradient from '@/components/AnimatedGradient';
import { useEffect } from 'react';



export default function AuthCodeError() {
    const theme = 'dark'; // Always use dark theme

    useEffect(() => {
        // Always use dark theme
        document.documentElement.setAttribute('data-theme', 'dark');
    }, []);



    return (
        <main className="relative min-h-screen flex items-center justify-center overflow-x-hidden bg-[var(--background)]">
            <div className="fixed inset-0 z-0">
                <AnimatedGradient theme={theme} isPortal={false} />
            </div>

            <div className="relative z-10 max-w-md w-full px-4">
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[2.5rem] shadow-2xl p-10 text-center backdrop-blur-2xl">
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 shadow-xl">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>

                    <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3 tracking-tight">
                        Authentication Error
                    </h1>

                    <p className="text-[var(--foreground)]/60 mb-10 leading-relaxed">
                        There was a problem signing you in. Please try again or contact support if the issue persists.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-[var(--foreground)] text-[var(--background)] rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    >
                        <Home size={20} />
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}

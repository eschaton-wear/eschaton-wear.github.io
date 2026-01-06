'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle, signUpWithEmail, signInWithEmail } from '@/utils/supabase/auth';
import { soundManager } from '@/utils/sounds';
import { useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { useI18n } from '@/utils/i18n';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
    const { t } = useI18n();
    const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { success: showSuccess, error: showError } = useToast();

    // Password strength check
    const checkPasswordStrength = (pass: string) => {
        const hasLength = pass.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(pass);
        const hasNumberOrSymbol = /[0-9!@#$%^&*(),.?":{}|<>]/.test(pass);
        return { hasLength, hasLetter, hasNumberOrSymbol, isValid: hasLength && hasLetter && hasNumberOrSymbol };
    };

    const passwordStrength = checkPasswordStrength(password);

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(error.message || 'Failed to sign in with Google');
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // --- 1. Comprehensive Local Validation ---
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail) {
            setError('Please enter your email address.');
            return;
        }

        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!trimmedPassword) {
            setError('Please enter your password.');
            return;
        }

        if (mode === 'signup' && !passwordStrength.isValid) {
            if (password.length < 8) {
                setError('Password must be at least 8 characters long.');
            } else {
                setError('Password must include both letters and numbers/symbols.');
            }
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                const signupData = await signUpWithEmail(trimmedEmail, trimmedPassword);

                // If account exists but email confirmation is off, Supabase might just return the user 
                // but without a session if it's already "confirmed". 
                // However, usually signUpWithEmail throws an error if user exists.

                if (!signupData.session) {
                    await signInWithEmail(trimmedEmail, trimmedPassword);
                }

                setError('');
                showSuccess('Welcome to Léger AI!');
                onClose();
            } else {
                await signInWithEmail(trimmedEmail, trimmedPassword);
                onClose();
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Auth Error:', error);

            // --- 2. Advanced Error Handling ---
            const msg = error.message?.toLowerCase() || '';

            if (msg.includes('already registered') || msg.includes('unique constraint') || msg.includes('user_already_exists')) {
                setError('This email is already registered. Please sign in instead.');
                setTimeout(() => setMode('signin'), 1500);
            } else if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (msg.includes('rate limit')) {
                setError('Too many attempts. Please try again in a few minutes.');
            } else if (msg.includes('network') || msg.includes('failed to fetch')) {
                setError('Network error. Please check your connection.');
            } else {
                setError(error.message || `Failed to ${mode === 'signup' ? 'create account' : 'sign in'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'signin' ? 'signup' : 'signin');
        setError('');
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
                        className="fixed left-1/2 top-1/2 z-[70] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
                    >
                        <div className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-2xl backdrop-blur-xl transition-colors duration-500">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                {/* Logo */}
                                <div className="mb-6 rounded-2xl bg-[var(--foreground)]/5 p-4 text-[var(--foreground)]">
                                    <LayoutGrid size={32} />
                                </div>

                                <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                                    {mode === 'signin' ? t('auth.welcome_back') : t('auth.create_account')}
                                </h2>
                                <p className="mb-8 text-sm text-[var(--text-secondary)]">
                                    {mode === 'signin'
                                        ? t('auth.signin_desc')
                                        : t('auth.join_desc')}
                                </p>

                                {/* Email/Password Form */}
                                <form onSubmit={handleEmailAuth} className="w-full mb-4">
                                    <div className="space-y-4 mb-6">
                                        {/* Email Input */}
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder={t('auth.email_placeholder')}
                                                required
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-[var(--foreground)] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
                                            />
                                        </div>

                                        {/* Password Input */}
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={t('auth.password_placeholder')}
                                                required
                                                minLength={6}
                                                className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-[var(--foreground)] placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        {/* Password Strength Indicator (Signup Only) */}
                                        {mode === 'signup' && password && (
                                            <div className="flex gap-1 h-1.5 w-full mt-2">
                                                <div className={`h-full rounded-full flex-1 transition-all ${passwordStrength.hasLength ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                                <div className={`h-full rounded-full flex-1 transition-all ${passwordStrength.hasLetter ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                                <div className={`h-full rounded-full flex-1 transition-all ${passwordStrength.hasNumberOrSymbol ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading || (mode === 'signup' && !passwordStrength.isValid)}
                                        className="w-full py-3 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                    >
                                        {loading ? t('auth.loading') : mode === 'signin' ? t('auth.signin_link') : t('auth.create_account')}
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="flex items-center gap-4 w-full mb-4">
                                    <div className="flex-1 h-px bg-gray-300 dark:bg-white/10" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{t('auth.or')}</span>
                                    <div className="flex-1 h-px bg-gray-300 dark:bg-white/10" />
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] px-6 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--card-bg)] hover:shadow-md active:scale-[0.98] mb-6"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    {t('auth.continue_google')}
                                </button>

                                {/* Switch Mode */}
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {mode === 'signin' ? t('auth.no_account') : t('auth.has_account')}
                                    <button
                                        onClick={switchMode}
                                        className="text-[var(--foreground)] hover:underline font-medium"
                                    >
                                        {mode === 'signin' ? t('auth.signup_link') : t('auth.signin_link')}
                                    </button>
                                </p>

                                <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
                                    {t('auth.agree')} <a href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">{t('auth.terms')}</a> & <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">{t('auth.privacy')}</a>.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

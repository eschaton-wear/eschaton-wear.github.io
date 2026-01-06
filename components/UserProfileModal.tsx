'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Camera, Check, Calendar, LogOut, Shield, Smartphone } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { signOut } from '@/utils/supabase/auth';
import { useToast } from '@/components/ui/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AvatarEditor from '@/components/AvatarEditor';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: SupabaseUser;
    subscriptionStatus?: {
        tier: 'base' | 'ultra';
        status: 'active' | 'inactive' | 'cancelled';
        endDate: string | null;
    } | null;
    onProfileUpdate?: () => void;
}

export default function UserProfileModal({ isOpen, onClose, user, subscriptionStatus, onProfileUpdate }: UserProfileModalProps) {
    const [displayName, setDisplayName] = useState(user.user_metadata?.full_name || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
    const [uploading, setUploading] = useState(false);
    const [editorImage, setEditorImage] = useState<string | null>(null);
    const [isGlobalSignOutConfirmOpen, setIsGlobalSignOutConfirmOpen] = useState(false);
    const [isLocalSignOutConfirmOpen, setIsLocalSignOutConfirmOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const { success: showSuccess, error: showError } = useToast();

    // Sync state with user prop details when modal opens or user updates
    useEffect(() => {
        if (isOpen) {
            setDisplayName(user.user_metadata?.full_name || '');
            setAvatarUrl(user.user_metadata?.avatar_url || '');
        }
    }, [isOpen, user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Update Supabase Auth Metadata (Standard)
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: displayName,
                    avatar_url: avatarUrl,
                }
            });

            if (authError) throw authError;

            // 2. Update Profiles Table (Persistence against OAuth resets)
            // We use upsert to ensure we don't break if the record exists
            try {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: displayName,
                        avatar_url: avatarUrl,
                        updated_at: new Date().toISOString(),
                    });

                if (profileError) console.warn('Profile table update failed:', profileError);
            } catch (err) {
                console.warn('Profile table update error:', err);
            }

            setSuccess(true);
            showSuccess('Profile updated successfully');
            setTimeout(() => setSuccess(false), 2000);

            // Notify parent to refresh user state
            if (onProfileUpdate) {
                onProfileUpdate();
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error updating profile:', error);
            showError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // Increased to 5MB since we compress/crop
            showError('File size must be less than 5MB');
            return;
        }

        // Read file to open Editor
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setEditorImage(reader.result);
            }
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again if cancelled
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEditorSave = async (blob: Blob) => {
        setEditorImage(null);
        setUploading(true);

        try {
            // Convert blob to file
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

            // Use a unique name within a user-specific folder
            const fileName = `${Date.now()}.jpg`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);

            // Auto-save
            await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } });

            // Update profiles
            await supabase.from('profiles').upsert({
                id: user.id,
                avatar_url: data.publicUrl,
                updated_at: new Date().toISOString(),
            });

            if (onProfileUpdate) onProfileUpdate();
            showSuccess('Avatar updated successfully');

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error uploading avatar:', error);
            // Show more specific error if possible
            if (error.message && error.message.includes('security policy')) {
                showError('Upload failed: Permission denied by server.');
            } else if (error.message && error.message.includes('storage bucket')) {
                showError('Upload failed: Storage bucket missing.');
            } else {
                showError(error.message || 'Failed to upload avatar');
            }
        } finally {
            setUploading(false);
        }
    };


    const handleSignOutGlobal = async () => {
        setIsGlobalSignOutConfirmOpen(true);
    };

    const handleSignOutLocal = () => {
        setIsLocalSignOutConfirmOpen(true);
    };

    const confirmGlobalSignOut = async () => {
        try {
            // Attempt global sign out
            await supabase.auth.signOut({ scope: 'global' });
        } catch (e) {
            console.error("Global signout not fully supported or failed", e);
            // Fallback to local
            await signOut();
        }
        onClose();
        window.location.reload();
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                />
            )}

            {isOpen && (
                <motion.div
                    key="modal-content"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="fixed left-1/2 top-1/2 z-[70] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
                >
                    <div className="relative overflow-hidden rounded-3xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl backdrop-blur-xl transition-colors duration-500 max-h-[90vh] overflow-y-auto">

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)] bg-[var(--background)]/50">
                            <h2 className="text-xl font-semibold text-[var(--foreground)]">Profile Settings</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--foreground)]/10 text-[var(--text-secondary)] transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">

                            {/* Avatar & Identity */}
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4 group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--foreground)]/5 border-2 border-[var(--card-border)] ring-4 ring-[var(--background)] shadow-lg">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 transition-all shadow-md group-hover:scale-110"
                                    >
                                        {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={16} />}
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">Logged in as <span className="font-semibold text-[var(--foreground)]">{user.user_metadata?.full_name || 'User'}</span></p>
                            </div>

                            {/* Section 1: Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] ml-1">Personal Info</h3>

                                <div className="px-4 py-3 rounded-2xl bg-[var(--background)] border border-[var(--card-border)] flex items-center gap-3 opacity-75 cursor-not-allowed">
                                    <div className="p-2 rounded-lg bg-[var(--foreground)]/5 text-[var(--text-secondary)]">
                                        <Shield size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[var(--text-secondary)]">Email Address</p>
                                        <p className="text-sm font-medium text-[var(--foreground)] truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-secondary)]">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="Username"
                                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--foreground)]/30 focus:ring-1 focus:ring-[var(--foreground)]/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-6 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : success ? <Check size={18} /> : 'Save'}
                                    </button>
                                </div>
                            </div>

                            {/* Section 2: Subscription */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] ml-1">Subscription</h3>

                                <div className="p-5 rounded-3xl bg-[var(--foreground)]/5 border border-[var(--card-border)]">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-[var(--text-secondary)] mb-1">Current Plan</p>
                                            <h4 className="text-2xl font-bold text-[var(--foreground)] capitalize flex items-center gap-2">
                                                {subscriptionStatus?.tier || 'Free'}
                                                {subscriptionStatus?.status === 'active' && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 font-bold uppercase tracking-wide">Active</span>
                                                )}
                                            </h4>
                                        </div>
                                        {(!subscriptionStatus || subscriptionStatus.tier === 'base') && (
                                            <button
                                                onClick={() => window.location.href = '/pricing'}
                                                className="px-4 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                            >
                                                Upgrade to Ultra
                                            </button>
                                        )}
                                    </div>

                                    {subscriptionStatus?.endDate && (
                                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] pt-4 border-t border-[var(--card-border)]">
                                            <Calendar size={14} />
                                            <span>Renews on {formatDate(subscriptionStatus.endDate)}</span>
                                        </div>
                                    )}

                                    {!subscriptionStatus && (
                                        <div className="text-sm text-[var(--text-secondary)]">
                                            You are currently on the free Base plan.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 3: Sessions */}
                            <div className="space-y-4 pt-4 border-t border-[var(--card-border)]">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] ml-1">Session Management</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        onClick={handleSignOutLocal}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[var(--card-border)] hover:bg-[var(--foreground)]/5 text-[var(--foreground)] transition-all font-medium text-sm"
                                    >
                                        <LogOut size={16} />
                                        Log Out
                                    </button>

                                    <button
                                        onClick={handleSignOutGlobal}
                                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all font-medium text-sm"
                                    >
                                        <Smartphone size={16} />
                                        Log Out Everywhere
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}
            <ConfirmDialog
                key="global-signout-confirm"
                isOpen={isGlobalSignOutConfirmOpen}
                onClose={() => setIsGlobalSignOutConfirmOpen(false)}
                onConfirm={confirmGlobalSignOut}
                title="Log Out Everywhere"
                message="Are you sure you want to sign out from all devices? You will need to log in again."
                confirmText="Log Out Everywhere"
                isDestructive={true}
            />
            <ConfirmDialog
                key="local-signout-confirm"
                isOpen={isLocalSignOutConfirmOpen}
                onClose={() => setIsLocalSignOutConfirmOpen(false)}
                onConfirm={async () => {
                    await signOut();
                    onClose();
                    window.location.reload();
                }}
                title="Log Out"
                message="Are you sure you want to log out?"
                confirmText="Log Out"
                isDestructive={false}
            />
            {
                editorImage && (
                    <AvatarEditor
                        key="avatar-editor"
                        imageSrc={editorImage}
                        onSave={handleEditorSave}
                        onCancel={() => setEditorImage(null)}
                    />
                )
            }
        </AnimatePresence >
    );
}

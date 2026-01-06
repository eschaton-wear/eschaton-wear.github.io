import { createClient } from './client';

// List of developer emails that get free Ultra access
const DEV_EMAILS = [
    'kanal101yout@yandex.ru', // Replace with your email
    'mmvolkov-kirov@yandex.ru',
    'raminagakishiev@gmail.com'
];

export interface SubscriptionStatus {
    tier: 'base' | 'ultra';
    status: 'active' | 'inactive' | 'cancelled';
    endDate: string | null;
    fullName: string | null;
    avatarUrl: string | null;
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('tier, subscription_status, subscription_end_date, full_name, avatar_url')
        .eq('id', userId)
        .single();

    if (error) {
        // Check for dev override even if profile fetch fails
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email && DEV_EMAILS.includes(user.email)) {
            return {
                tier: 'ultra',
                status: 'active',
                endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString(), // 10 years
                fullName: user.user_metadata?.full_name || null,
                avatarUrl: user.user_metadata?.avatar_url || null,
            };
        }

        // If profile doesn't exist yet, return null without loud error
        if (error.code === 'PGRST116') {
            if (user?.email && DEV_EMAILS.includes(user.email)) {
                return {
                    tier: 'ultra',
                    status: 'active',
                    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString(),
                    fullName: user.user_metadata?.full_name || null,
                    avatarUrl: user.user_metadata?.avatar_url || null,
                };
            }
            return null;
        }
        console.warn('Subscription fetch warning:', error.message);
        return null;
    }

    if (!data) return null;

    // Check for Dev Override
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email && DEV_EMAILS.includes(user.email)) {
        return {
            tier: 'ultra',
            status: 'active',
            endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString(),
            fullName: data.full_name || user.user_metadata?.full_name || null,
            avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || null,
        };
    }

    return {
        tier: data.tier as 'base' | 'ultra',
        status: data.subscription_status as 'active' | 'inactive' | 'cancelled',
        endDate: data.subscription_end_date,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
    };
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const status = await getSubscriptionStatus(userId);

    if (!status) return false;

    // Check if subscription is active and not expired
    if (status.status !== 'active') return false;

    if (status.endDate) {
        const endDate = new Date(status.endDate);
        const now = new Date();
        if (endDate < now) return false;
    }

    // Devs always have access
    if (userId) { // We have ID but need email, let's trust getSubscriptionStatus handles the check or do a quick check if we had user object
        // optimized: getSubscriptionStatus already checks dev emails via getUser()
    }

    return true;
}

export async function getSubscriptionTier(userId: string): Promise<'base' | 'ultra' | null> {
    const status = await getSubscriptionStatus(userId);
    return status?.tier || null;
}

export async function canAccessPortalMode(userId: string): Promise<boolean> {
    const status = await getSubscriptionStatus(userId);
    if (!status) return false;

    // Only Ultra subscribers can access Portal mode
    if (status.tier !== 'ultra') return false;

    // Check if subscription is active and not expired
    if (status.status !== 'active') return false;

    if (status.endDate) {
        const endDate = new Date(status.endDate);
        const now = new Date();
        if (endDate < now) return false;
    }

    return true;
}

export interface FullSubscriptionInfo {
    hasSubscription: boolean;
    tier: 'base' | 'ultra' | null;
    status: 'active' | 'inactive' | 'cancelled';
    endDate: string | null;
    canUsePortal: boolean;
    isExpired: boolean;
    fullName: string | null;
    avatarUrl: string | null;
}

export async function getFullSubscriptionInfo(userId: string): Promise<FullSubscriptionInfo> {
    const status = await getSubscriptionStatus(userId);

    if (!status) {
        return {
            hasSubscription: false,
            tier: null,
            status: 'inactive',
            endDate: null,
            canUsePortal: false,
            isExpired: false,
            fullName: null,
            avatarUrl: null,
        };
    }

    const isActive = status.status === 'active';
    let isExpired = false;

    if (status.endDate) {
        const endDate = new Date(status.endDate);
        const now = new Date();
        isExpired = endDate < now;
    }

    const hasSubscription = isActive && !isExpired;
    const canUsePortal = hasSubscription && status.tier === 'ultra';

    return {
        hasSubscription,
        tier: status.tier,
        status: status.status,
        endDate: status.endDate,
        canUsePortal,
        isExpired,
        fullName: status.fullName,
        avatarUrl: status.avatarUrl,
    };
}

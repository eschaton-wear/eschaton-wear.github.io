
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        // @ts-expect-error: Wrapper for API version compatibility
        apiVersion: '2024-12-18.acacia',
    });

    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { tier } = await req.json();

        if (!tier || !['base', 'ultra'].includes(tier)) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
        }

        // Get or create Stripe customer
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    supabase_user_id: user.id,
                },
            });
            customerId = customer.id;

            // Update profile with customer ID
            await supabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        // Create checkout session
        const prices = {
            base: process.env.STRIPE_PRICE_BASE!,
            ultra: process.env.STRIPE_PRICE_ULTRA!,
        };

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: prices[tier as 'base' | 'ultra'],
                    quantity: 1,
                },
            ],
            success_url: `${req.nextUrl.origin}/?success=true`,
            cancel_url: `${req.nextUrl.origin}/pricing?canceled=true`,
            metadata: {
                supabase_user_id: user.id,
                tier,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

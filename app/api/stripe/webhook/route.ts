import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

// Initialized inside handler to avoid build-time errors with missing env vars
// const stripe = ... 
// const webhookSecret = ...

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        // @ts-expect-error: Wrapper for API version compatibility
        apiVersion: '2024-12-18.acacia',
    });
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.supabase_user_id;
                const tier = session.metadata?.tier;

                if (userId && session.subscription) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const subscription: any = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    );

                    // Update user profile
                    await supabase
                        .from('profiles')
                        .update({
                            tier: tier || 'base',
                            subscription_status: 'active',
                            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
                            stripe_subscription_id: subscription.id,
                            is_portal_enabled: tier === 'ultra',
                        })
                        .eq('id', userId);

                    console.log(`Subscription activated for user ${userId}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.supabase_user_id;

                if (userId) {
                    await supabase
                        .from('profiles')
                        .update({
                            subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
                        })
                        .eq('id', userId);

                    console.log(`Subscription updated for user ${userId}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.supabase_user_id;

                if (userId) {
                    await supabase
                        .from('profiles')
                        .update({
                            subscription_status: 'cancelled',
                            is_portal_enabled: false,
                        })
                        .eq('id', userId);

                    console.log(`Subscription cancelled for user ${userId}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: error.message || 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

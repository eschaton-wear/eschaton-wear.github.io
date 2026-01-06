# Stripe Configuration Guide

To complete the payment integration, you need to add your Stripe API keys to the `.env.local` file.

## Steps:

### 1. Create or Log in to Stripe Account
Visit: https://stripe.com and create an account or log in

### 2. Get API Keys
1. Go to Developers → API keys
2. Copy your **Publishable key** (starts with `pk_test_...` for test mode)
3. Copy your **Secret key** (starts with `sk_test_...` for test mode)

### 3. Create Products and Prices
1. Go to Products → Create product
2. Create two products:

**Product 1: Léger AI Base**
- Name: Léger AI Base
- Description: Essential brand analysis
- Price: €30.00 EUR / month
- Recurring billing
- Copy the **Price ID** (starts with `price_...`)

**Product 2: Léger AI Ultra**
- Name: Léger AI Ultra  
- Description: Premium intelligence with Portal Mode
- Price: €70.00 EUR / month
- Recurring billing
- Copy the **Price ID** (starts with `price_...`)

### 4. Get Webhook Secret (for production)
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (starts with `whsec_...`)

For local testing, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. Update .env.local

Add these lines to your `.env.local` file:

```env
# Existing Supabase keys
NEXT_PUBLIC_SUPABASE_URL=https://gvbfhawwxmodvbhwkvws.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_qhC78VPdrPBS6QKTglV18A_TD7KKyCX
OPENROUTER_API_KEY=

# Stripe keys (add these)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
STRIPE_PRICE_BASE=price_your_base_price_id_here
STRIPE_PRICE_ULTRA=price_your_ultra_price_id_here
```

### 6. Run Database Migration

You need to run the SQL migration on your Supabase database:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy the contents of `supabase/migrations/add_subscription_fields.sql`
5. Paste and run the SQL

### 7. Restart Dev Server

After adding the environment variables:
```bash
npm run dev
```

## Testing Payments

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any ZIP code

## Production Checklist

- [ ] Switch to live API keys (start with `pk_live_` and `sk_live_`)
- [ ] Update webhook endpoint to production URL
- [ ] Test full payment flow in production
- [ ] Enable production mode in Stripe Dashboard

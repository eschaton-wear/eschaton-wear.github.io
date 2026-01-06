-- Add subscription management fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- Update RLS policies to include new fields
-- (Users can already view/update their own profile, so no changes needed)

-- Function to check if subscription is active
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_active BOOLEAN;
BEGIN
  SELECT 
    subscription_status = 'active' 
    AND (subscription_end_date IS NULL OR subscription_end_date > NOW())
  INTO is_active
  FROM public.profiles
  WHERE id = user_id;
  
  RETURN COALESCE(is_active, FALSE);
END;
$$;

-- Security fixes for RLS policies and data integrity

-- Fix critical RLS vulnerabilities by adding WITH CHECK clauses to UPDATE policies
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own business profile" ON public.business_profiles;
CREATE POLICY "Users can update their own business profile" 
ON public.business_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING ((user_id = auth.uid()) OR (email = auth.email()))
WITH CHECK ((user_id = auth.uid()) OR (email = auth.email()));

-- Add unique constraint on email in subscribers table to prevent duplicate accounts
ALTER TABLE public.subscribers ADD CONSTRAINT unique_subscriber_email UNIQUE (email);

-- Add constraint to prevent multiple business profiles per user
ALTER TABLE public.business_profiles ADD CONSTRAINT unique_business_profile_per_user UNIQUE (user_id);

-- Add CHECK constraints for data validation
ALTER TABLE public.transactions ADD CONSTRAINT check_weight_positive CHECK (weight > 0);
ALTER TABLE public.transactions ADD CONSTRAINT check_purity_valid CHECK (purity >= 0 AND purity <= 100);
ALTER TABLE public.transactions ADD CONSTRAINT check_rate_positive CHECK (rate > 0);
ALTER TABLE public.transactions ADD CONSTRAINT check_amount_not_negative CHECK (amount >= 0);
ALTER TABLE public.transactions ADD CONSTRAINT check_fine_gold_not_negative CHECK (fine_gold >= 0);

-- Add CHECK constraint for business profile name
ALTER TABLE public.business_profiles ADD CONSTRAINT check_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);
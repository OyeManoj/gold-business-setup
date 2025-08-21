-- Security fixes for RLS policies and data integrity (handling existing constraints)

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

-- Add unique constraint on email in subscribers table (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_subscriber_email'
        AND table_name = 'subscribers'
    ) THEN
        ALTER TABLE public.subscribers ADD CONSTRAINT unique_subscriber_email UNIQUE (email);
    END IF;
END $$;

-- Add constraint to prevent multiple business profiles per user (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_business_profile_per_user'
        AND table_name = 'business_profiles'
    ) THEN
        ALTER TABLE public.business_profiles ADD CONSTRAINT unique_business_profile_per_user UNIQUE (user_id);
    END IF;
END $$;

-- Add CHECK constraint for business profile name (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_name_not_empty'
        AND table_name = 'business_profiles'
    ) THEN
        ALTER TABLE public.business_profiles ADD CONSTRAINT check_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);
    END IF;
END $$;
-- Phase 1: Critical Security Fixes

-- 1. Add owner_id columns to tables that need proper user isolation
ALTER TABLE public.transactions ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.business_profiles ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Drop the dangerous "allow all" RLS policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.transactions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.business_profiles;

-- 3. Create secure RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (auth.uid() = owner_id);

-- 4. Create secure RLS policies for business_profiles
CREATE POLICY "Users can view their own business profile" 
ON public.business_profiles 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own business profile" 
ON public.business_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own business profile" 
ON public.business_profiles 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own business profile" 
ON public.business_profiles 
FOR DELETE 
USING (auth.uid() = owner_id);

-- 5. Create indexes for performance
CREATE INDEX idx_transactions_owner_id ON public.transactions(owner_id);
CREATE INDEX idx_business_profiles_owner_id ON public.business_profiles(owner_id);

-- 6. Restrict access to get_active_user_ids function (prevents user enumeration)
CREATE OR REPLACE FUNCTION public.get_active_user_ids()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to access user IDs
  IF NOT EXISTS (
    SELECT 1 FROM custom_users 
    WHERE user_id = (
      SELECT custom_users.user_id 
      FROM custom_users 
      WHERE custom_users.id::text = auth.jwt()->>'sub'
    ) 
    AND role = 'admin'
  ) THEN
    RETURN '[]'::json;
  END IF;
  
  -- Return user IDs for admin users only
  RETURN (
    SELECT to_json(array_agg(user_id ORDER BY created_at DESC))
    FROM custom_users
    WHERE is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN '[]'::json;
END;
$$;
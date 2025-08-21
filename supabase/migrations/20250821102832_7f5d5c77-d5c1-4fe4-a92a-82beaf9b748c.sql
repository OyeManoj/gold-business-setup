-- Remove authentication system and make data public

-- Drop RLS policies that require authentication
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view their own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can create their own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profile" ON public.business_profiles;

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create simple public access policies
CREATE POLICY "Public access to transactions" 
ON public.transactions 
FOR ALL 
USING (true);

CREATE POLICY "Public access to business profiles" 
ON public.business_profiles 
FOR ALL 
USING (true);

-- Drop user_id constraints and make tables work without user authentication
ALTER TABLE public.transactions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.business_profiles ALTER COLUMN user_id DROP NOT NULL;

-- Drop foreign key constraints
ALTER TABLE public.business_profiles DROP CONSTRAINT IF EXISTS business_profiles_user_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Drop authentication functions
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.register_user(TEXT, TEXT);

-- Drop user_auth table as it's no longer needed
DROP TABLE IF EXISTS public.user_auth;
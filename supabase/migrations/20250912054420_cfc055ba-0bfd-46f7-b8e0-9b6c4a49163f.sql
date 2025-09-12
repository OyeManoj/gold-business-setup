-- Update RLS policies for business_profiles to work with custom authentication using user_id

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can create their own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can delete their own business profile" ON public.business_profiles;

-- Create new RLS policies that work with custom authentication
CREATE POLICY "Users can view their own business profile" 
ON public.business_profiles 
FOR SELECT 
USING (user_id = (
  SELECT custom_users.user_id 
  FROM custom_users 
  WHERE custom_users.id::text = auth.jwt()->>'sub'
));

CREATE POLICY "Users can create their own business profile" 
ON public.business_profiles 
FOR INSERT 
WITH CHECK (user_id = (
  SELECT custom_users.user_id 
  FROM custom_users 
  WHERE custom_users.id::text = auth.jwt()->>'sub'
));

CREATE POLICY "Users can update their own business profile" 
ON public.business_profiles 
FOR UPDATE 
USING (user_id = (
  SELECT custom_users.user_id 
  FROM custom_users 
  WHERE custom_users.id::text = auth.jwt()->>'sub'
));

CREATE POLICY "Users can delete their own business profile" 
ON public.business_profiles 
FOR DELETE 
USING (user_id = (
  SELECT custom_users.user_id 
  FROM custom_users 
  WHERE custom_users.id::text = auth.jwt()->>'sub'
));
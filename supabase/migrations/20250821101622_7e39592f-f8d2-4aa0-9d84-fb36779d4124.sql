-- Remove email dependencies and create PIN/User ID authentication system

-- Create a custom authentication table for PIN/User ID system
CREATE TABLE public.user_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_pin TEXT NOT NULL UNIQUE CHECK (LENGTH(user_id_pin) = 4 AND user_id_pin ~ '^[0-9]+$'),
  pin_code TEXT NOT NULL CHECK (LENGTH(pin_code) = 4 AND pin_code ~ '^[0-9]+$'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.user_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for user_auth table
CREATE POLICY "Users can view their own auth data" 
ON public.user_auth 
FOR SELECT 
USING (true); -- Allow reading for authentication purposes

CREATE POLICY "System can create auth records" 
ON public.user_auth 
FOR INSERT 
WITH CHECK (true); -- Allow system to create new auth records

CREATE POLICY "Users can update their own auth data" 
ON public.user_auth 
FOR UPDATE 
USING (true); -- Allow updates for login tracking

-- Update business_profiles table to reference user_auth instead of auth.users
ALTER TABLE public.business_profiles DROP CONSTRAINT IF EXISTS business_profiles_user_id_fkey;
ALTER TABLE public.business_profiles ADD CONSTRAINT business_profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE;

-- Update transactions table to reference user_auth instead of auth.users  
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE;

-- Update subscribers table to reference user_auth and remove email dependency
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_user_id_fkey;
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE;
ALTER TABLE public.subscribers DROP COLUMN IF EXISTS email;

-- Update user_roles table to reference user_auth instead of auth.users
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE;

-- Update RLS policies to use user_auth system
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

-- Update business_profiles RLS policies
DROP POLICY IF EXISTS "Users can view their own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can create their own business profile" ON public.business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profile" ON public.business_profiles;

CREATE POLICY "Users can view their own business profile" 
ON public.business_profiles 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

CREATE POLICY "Users can create their own business profile" 
ON public.business_profiles 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

CREATE POLICY "Users can update their own business profile" 
ON public.business_profiles 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

-- Update subscribers RLS policies
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;

CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

-- Update user_roles RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.user_auth WHERE user_id_pin = current_setting('app.current_user_id_pin', true)));

-- Create function to authenticate user with PIN/User ID
CREATE OR REPLACE FUNCTION public.authenticate_user(user_id_pin TEXT, pin_code TEXT)
RETURNS TABLE(user_id UUID, success BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update last login timestamp and return user data
  UPDATE public.user_auth 
  SET last_login = now(), updated_at = now()
  WHERE user_auth.user_id_pin = authenticate_user.user_id_pin 
    AND user_auth.pin_code = authenticate_user.pin_code;
  
  IF FOUND THEN
    RETURN QUERY 
    SELECT ua.id, true
    FROM public.user_auth ua 
    WHERE ua.user_id_pin = authenticate_user.user_id_pin 
      AND ua.pin_code = authenticate_user.pin_code;
  ELSE
    RETURN QUERY SELECT NULL::UUID, false;
  END IF;
END;
$$;

-- Create function to register new user
CREATE OR REPLACE FUNCTION public.register_user(user_id_pin TEXT, pin_code TEXT)
RETURNS TABLE(user_id UUID, success BOOLEAN, message TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user_id_pin already exists
  IF EXISTS (SELECT 1 FROM public.user_auth WHERE user_auth.user_id_pin = register_user.user_id_pin) THEN
    RETURN QUERY SELECT NULL::UUID, false, 'User ID already exists'::TEXT;
    RETURN;
  END IF;
  
  -- Create new user
  INSERT INTO public.user_auth (user_id_pin, pin_code)
  VALUES (register_user.user_id_pin, register_user.pin_code)
  RETURNING id INTO user_id;
  
  RETURN QUERY SELECT register_user.user_id, true, 'User created successfully'::TEXT;
END;
$$;
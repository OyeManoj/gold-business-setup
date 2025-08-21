-- Create PIN/User ID authentication system and migrate existing data

-- First, create the new authentication table
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
CREATE POLICY "Public access for authentication" 
ON public.user_auth 
FOR ALL 
USING (true); -- Allow all operations for authentication

-- Migrate existing users by creating random PIN/User ID combinations
-- This is a one-time migration for existing data
DO $$
DECLARE
    existing_user RECORD;
    new_user_id_pin TEXT;
    new_pin_code TEXT;
    counter INTEGER := 1000;
BEGIN
    -- For each existing user in auth.users that has data in business_profiles or transactions
    FOR existing_user IN 
        SELECT DISTINCT user_id FROM public.business_profiles
        UNION
        SELECT DISTINCT user_id FROM public.transactions
        UNION  
        SELECT DISTINCT user_id FROM public.subscribers
        UNION
        SELECT DISTINCT user_id FROM public.user_roles
    LOOP
        -- Generate unique 4-digit user ID and PIN
        new_user_id_pin := LPAD(counter::TEXT, 4, '0');
        new_pin_code := LPAD((counter + 1000)::TEXT, 4, '0');
        
        -- Insert new auth record
        INSERT INTO public.user_auth (id, user_id_pin, pin_code)
        VALUES (existing_user.user_id, new_user_id_pin, new_pin_code);
        
        counter := counter + 1;
    END LOOP;
END $$;

-- Remove foreign key constraints temporarily
ALTER TABLE public.business_profiles DROP CONSTRAINT IF EXISTS business_profiles_user_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_user_id_fkey;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Add new foreign key constraints to user_auth
ALTER TABLE public.business_profiles ADD CONSTRAINT business_profiles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE;

ALTER TABLE public.transactions ADD CONSTRAINT transactions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE;

ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE;
  
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.user_auth(id) ON DELETE CASCADE;

-- Remove email column from subscribers
ALTER TABLE public.subscribers DROP COLUMN IF EXISTS email;

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
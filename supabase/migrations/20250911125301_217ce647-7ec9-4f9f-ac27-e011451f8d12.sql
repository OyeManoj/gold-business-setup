-- Create user_profiles table for custom users
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL REFERENCES custom_users(user_id) ON DELETE CASCADE,
  display_name text,
  email text,
  phone text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (user_id = (
  SELECT custom_users.user_id 
  FROM custom_users 
  WHERE custom_users.id::text = auth.jwt()->>'sub'
));

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (user_id = (
  SELECT custom_users.user_id 
  FROM custom_users 
  WHERE custom_users.id::text = auth.jwt()->>'sub'
));

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (user_id = (
  SELECT custom_users.user_id 
  FROM custom_users 
  WHERE custom_users.id::text = auth.jwt()->>'sub'
));

-- Add trigger for timestamps
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get user profile
CREATE OR REPLACE FUNCTION public.get_user_profile(input_user_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  profile_record record;
  user_record record;
BEGIN
  -- Get user info
  SELECT id, user_id, name, role, created_at
  INTO user_record
  FROM custom_users
  WHERE user_id = input_user_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Get profile info
  SELECT display_name, email, phone, avatar_url, bio
  INTO profile_record
  FROM user_profiles
  WHERE user_id = input_user_id;
  
  -- Return combined data
  RETURN json_build_object(
    'success', true,
    'profile', json_build_object(
      'id', user_record.id,
      'user_id', user_record.user_id,
      'name', user_record.name,
      'role', user_record.role,
      'display_name', COALESCE(profile_record.display_name, user_record.name),
      'email', profile_record.email,
      'phone', profile_record.phone,
      'avatar_url', profile_record.avatar_url,
      'bio', profile_record.bio,
      'created_at', user_record.created_at
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to fetch profile'
    );
END;
$function$;

-- Create function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  input_user_id text,
  input_display_name text DEFAULT NULL,
  input_email text DEFAULT NULL,
  input_phone text DEFAULT NULL,
  input_avatar_url text DEFAULT NULL,
  input_bio text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Verify user exists and is active
  IF NOT EXISTS (
    SELECT 1 FROM custom_users 
    WHERE user_id = input_user_id AND is_active = true
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Insert or update profile
  INSERT INTO user_profiles (
    user_id, display_name, email, phone, avatar_url, bio
  ) VALUES (
    input_user_id, input_display_name, input_email, input_phone, input_avatar_url, input_bio
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
    email = COALESCE(EXCLUDED.email, user_profiles.email),
    phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
    avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
    updated_at = now();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Profile updated successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to update profile'
    );
END;
$function$;
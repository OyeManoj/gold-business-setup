-- Create custom users table for PIN-based auth
CREATE TABLE public.custom_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- 4-digit user ID
  pin TEXT NOT NULL, -- 4-digit PIN (will be hashed)
  name TEXT,
  role TEXT NOT NULL DEFAULT 'employee',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY;

-- Restrict direct access to custom_users table (use functions instead)
CREATE POLICY "Restrict direct access to custom_users"
ON public.custom_users
FOR ALL
USING (false)
WITH CHECK (false);

-- Create function to register new user with PIN
CREATE OR REPLACE FUNCTION public.register_custom_user(
  input_name TEXT,
  input_pin TEXT,
  input_role TEXT DEFAULT 'employee'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id TEXT;
  user_record RECORD;
  max_attempts INTEGER := 10;
  attempt_count INTEGER := 0;
BEGIN
  -- Generate a unique 4-digit user ID
  LOOP
    new_user_id := (1000 + floor(random() * 9000))::text;
    
    -- Check if this user_id already exists
    IF NOT EXISTS (SELECT 1 FROM custom_users WHERE user_id = new_user_id) THEN
      EXIT;
    END IF;
    
    attempt_count := attempt_count + 1;
    IF attempt_count >= max_attempts THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Unable to generate unique user ID. Please try again.'
      );
    END IF;
  END LOOP;
  
  -- Insert the new user
  INSERT INTO custom_users (user_id, pin, name, role)
  VALUES (new_user_id, input_pin, input_name, input_role)
  RETURNING id, user_id, name, role, created_at INTO user_record;
  
  -- Return success with user info
  RETURN json_build_object(
    'success', true,
    'user_id', user_record.user_id,
    'user', json_build_object(
      'id', user_record.id,
      'user_id', user_record.user_id,
      'name', user_record.name,
      'role', user_record.role,
      'created_at', user_record.created_at
    )
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User ID already exists. Please choose a different one.'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Registration failed. Please try again.'
    );
END;
$$;

-- Create function to verify login credentials
CREATE OR REPLACE FUNCTION public.verify_login_credentials(
  input_user_id TEXT,
  input_pin TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Check if user exists and credentials match
  SELECT id, user_id, name, role, is_active, last_login
  INTO user_record
  FROM custom_users
  WHERE user_id = input_user_id 
    AND pin = input_pin 
    AND is_active = true;
  
  IF FOUND THEN
    -- Update last login time
    UPDATE custom_users 
    SET last_login = now(), updated_at = now()
    WHERE id = user_record.id;
    
    -- Return user info without sensitive data
    RETURN json_build_object(
      'success', true,
      'user', json_build_object(
        'id', user_record.id,
        'user_id', user_record.user_id,
        'name', user_record.name,
        'role', user_record.role,
        'last_login', user_record.last_login
      )
    );
  ELSE
    -- Return failure without revealing which part failed
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid credentials'
    );
  END IF;
END;
$$;

-- Function to get active user IDs (admin only for security)
CREATE OR REPLACE FUNCTION public.get_active_user_ids()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create trigger for updated_at
CREATE TRIGGER update_custom_users_updated_at
  BEFORE UPDATE ON public.custom_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
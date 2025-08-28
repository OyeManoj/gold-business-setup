-- Fix remaining security warnings from linter

-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.verify_login_credentials(input_user_id text, input_pin text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record record;
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

-- Revoke execute permissions from public roles for security
REVOKE EXECUTE ON FUNCTION public.verify_login_credentials(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_login_credentials(text, text) FROM authenticated;
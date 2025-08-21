-- Fix security warnings by setting search_path in functions

-- Update authenticate_user function with proper search_path
CREATE OR REPLACE FUNCTION public.authenticate_user(user_id_pin TEXT, pin_code TEXT)
RETURNS TABLE(user_id UUID, success BOOLEAN) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update register_user function with proper search_path
CREATE OR REPLACE FUNCTION public.register_user(user_id_pin TEXT, pin_code TEXT)
RETURNS TABLE(user_id UUID, success BOOLEAN, message TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
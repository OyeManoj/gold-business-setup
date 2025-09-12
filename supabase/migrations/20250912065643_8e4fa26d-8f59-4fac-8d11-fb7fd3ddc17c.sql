-- Create a SECURITY DEFINER function to upsert business profile without requiring Supabase Auth session
CREATE OR REPLACE FUNCTION public.upsert_business_profile(
  input_user_id text,
  input_name text,
  input_phone text DEFAULT NULL,
  input_address text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof record;
BEGIN
  IF input_user_id IS NULL OR input_user_id = '' THEN
    RETURN json_build_object('success', false, 'error', 'Missing user_id');
  END IF;

  -- Try update first
  UPDATE business_profiles
  SET name = input_name,
      phone = input_phone,
      address = input_address,
      updated_at = now()
  WHERE user_id = input_user_id
  RETURNING id, name, phone, address INTO prof;

  IF NOT FOUND THEN
    INSERT INTO business_profiles (user_id, name, phone, address)
    VALUES (input_user_id, input_name, input_phone, input_address)
    RETURNING id, name, phone, address INTO prof;
  END IF;

  RETURN json_build_object(
    'success', true,
    'profile', json_build_object(
      'id', prof.id,
      'name', prof.name,
      'phone', prof.phone,
      'address', prof.address
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Failed to save profile');
END;
$$;
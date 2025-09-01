-- Create a function to safely fetch user's business profile
CREATE OR REPLACE FUNCTION public.get_user_business_profile(input_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_record record;
BEGIN
  -- Get business profile for the user
  SELECT id, name, phone, address
  INTO profile_record
  FROM business_profiles
  WHERE user_id = input_user_id;
  
  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'profile', json_build_object(
        'id', profile_record.id,
        'name', profile_record.name,
        'phone', profile_record.phone,
        'address', profile_record.address
      )
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'profile', null
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'profile', null
    );
END;
$$;
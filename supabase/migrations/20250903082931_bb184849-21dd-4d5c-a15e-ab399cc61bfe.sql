-- Update the get_user_business_profile function to work with text user_id
CREATE OR REPLACE FUNCTION public.get_user_business_profile(input_user_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$
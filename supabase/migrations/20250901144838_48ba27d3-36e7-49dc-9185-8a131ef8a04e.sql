-- Create a function to safely fetch active user IDs
CREATE OR REPLACE FUNCTION public.get_active_user_ids()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_ids_array text[];
BEGIN
  -- Get all active user IDs
  SELECT array_agg(user_id ORDER BY created_at DESC)
  INTO user_ids_array
  FROM custom_users
  WHERE is_active = true;
  
  -- Return as JSON array
  RETURN to_json(COALESCE(user_ids_array, ARRAY[]::text[]));
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty array on error
    RETURN '[]'::json;
END;
$$;
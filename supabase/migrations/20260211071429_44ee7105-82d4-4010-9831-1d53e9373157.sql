
-- Function to reset a user's PIN (admin only)
CREATE OR REPLACE FUNCTION public.reset_custom_user_pin(input_admin_user_id text, input_target_user_id text, input_new_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  admin_role text;
  hashed_pin text;
BEGIN
  SELECT role INTO admin_role FROM custom_users WHERE user_id = input_admin_user_id;
  
  IF admin_role IS NULL OR admin_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM custom_users WHERE user_id = input_target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  hashed_pin := crypt(input_new_pin, gen_salt('bf'));

  UPDATE custom_users SET pin_hash = hashed_pin WHERE user_id = input_target_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

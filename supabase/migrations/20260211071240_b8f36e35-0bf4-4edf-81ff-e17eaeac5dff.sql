
-- Function to get all users (for admin use)
CREATE OR REPLACE FUNCTION public.get_all_custom_users(input_admin_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_role text;
  result jsonb;
BEGIN
  -- Verify the requesting user is an admin
  SELECT role INTO admin_role FROM custom_users WHERE user_id = input_admin_user_id;
  
  IF admin_role IS NULL OR admin_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', u.id,
      'user_id', u.user_id,
      'name', u.name,
      'role', u.role,
      'created_at', u.created_at,
      'last_login', u.last_login
    ) ORDER BY u.created_at DESC
  ), '[]'::jsonb)
  INTO result
  FROM custom_users u;

  RETURN jsonb_build_object('success', true, 'users', result);
END;
$$;

-- Function to update a user's role
CREATE OR REPLACE FUNCTION public.update_custom_user_role(input_admin_user_id text, input_target_user_id text, input_new_role text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_role text;
BEGIN
  SELECT role INTO admin_role FROM custom_users WHERE user_id = input_admin_user_id;
  
  IF admin_role IS NULL OR admin_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  IF input_new_role NOT IN ('admin', 'employee') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role');
  END IF;

  UPDATE custom_users SET role = input_new_role WHERE user_id = input_target_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Function to delete a user
CREATE OR REPLACE FUNCTION public.delete_custom_user(input_admin_user_id text, input_target_user_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_role text;
BEGIN
  SELECT role INTO admin_role FROM custom_users WHERE user_id = input_admin_user_id;
  
  IF admin_role IS NULL OR admin_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Admin access required');
  END IF;

  IF input_admin_user_id = input_target_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot delete your own account');
  END IF;

  -- Delete user's transactions first
  DELETE FROM transactions WHERE user_id = input_target_user_id;
  -- Delete user's business profile
  DELETE FROM business_profiles WHERE user_id = input_target_user_id;
  -- Delete the user
  DELETE FROM custom_users WHERE user_id = input_target_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;


-- Recreate register_custom_user with extensions in search_path
CREATE OR REPLACE FUNCTION public.register_custom_user(input_name text, input_pin text, input_role text DEFAULT 'employee', input_user_id text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  new_user_id text;
  hashed_pin text;
BEGIN
  IF input_user_id IS NULL OR input_user_id = '' THEN
    LOOP
      new_user_id := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM custom_users WHERE user_id = new_user_id);
    END LOOP;
  ELSE
    new_user_id := input_user_id;
    IF EXISTS (SELECT 1 FROM custom_users WHERE user_id = new_user_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'User ID already taken');
    END IF;
  END IF;

  hashed_pin := crypt(input_pin, gen_salt('bf'));

  INSERT INTO custom_users (user_id, name, pin_hash, role)
  VALUES (new_user_id, input_name, hashed_pin, input_role);

  RETURN jsonb_build_object('success', true, 'user_id', new_user_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Recreate verify_login_credentials with extensions in search_path
CREATE OR REPLACE FUNCTION public.verify_login_credentials(input_user_id text, input_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  found_user record;
BEGIN
  SELECT id, user_id, name, role, pin_hash, last_login
  INTO found_user
  FROM custom_users
  WHERE user_id = input_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid user ID or PIN');
  END IF;

  IF found_user.pin_hash != crypt(input_pin, found_user.pin_hash) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid user ID or PIN');
  END IF;

  UPDATE custom_users SET last_login = now() WHERE user_id = input_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'user', jsonb_build_object(
      'id', found_user.id,
      'user_id', found_user.user_id,
      'name', found_user.name,
      'role', found_user.role,
      'last_login', now()
    )
  );
END;
$$;

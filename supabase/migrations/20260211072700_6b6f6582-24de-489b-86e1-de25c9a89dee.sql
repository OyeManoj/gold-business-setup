
CREATE OR REPLACE FUNCTION public.change_own_pin(input_user_id text, input_current_pin text, input_new_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  found_user record;
  hashed_pin text;
BEGIN
  SELECT id, pin_hash INTO found_user FROM custom_users WHERE user_id = input_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF found_user.pin_hash != crypt(input_current_pin, found_user.pin_hash) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Current PIN is incorrect');
  END IF;

  hashed_pin := crypt(input_new_pin, gen_salt('bf'));
  UPDATE custom_users SET pin_hash = hashed_pin WHERE user_id = input_user_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

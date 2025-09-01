-- Update the register function to accept optional user_id parameter
CREATE OR REPLACE FUNCTION public.register_custom_user(
  input_name text,
  input_pin text,
  input_role text DEFAULT 'employee',
  input_user_id text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_user_id text;
  user_record record;
  max_attempts integer := 10;
  attempt_count integer := 0;
BEGIN
  -- Use provided user_id if given, otherwise generate one
  IF input_user_id IS NOT NULL AND input_user_id != '' THEN
    -- Validate that the provided user_id is 4 digits
    IF input_user_id !~ '^[0-9]{4}$' THEN
      RETURN json_build_object(
        'success', false,
        'error', 'User ID must be exactly 4 digits'
      );
    END IF;
    
    -- Check if this user_id already exists
    IF EXISTS (SELECT 1 FROM custom_users WHERE user_id = input_user_id) THEN
      RETURN json_build_object(
        'success', false,
        'error', 'User ID already exists. Please choose a different one.'
      );
    END IF;
    
    new_user_id := input_user_id;
  ELSE
    -- Generate a unique 4-digit user ID
    LOOP
      new_user_id := (1000 + floor(random() * 9000))::text;
      
      -- Check if this user_id already exists
      IF NOT EXISTS (SELECT 1 FROM custom_users WHERE user_id = new_user_id) THEN
        EXIT;
      END IF;
      
      attempt_count := attempt_count + 1;
      IF attempt_count >= max_attempts THEN
        RETURN json_build_object(
          'success', false,
          'error', 'Unable to generate unique user ID. Please try again.'
        );
      END IF;
    END LOOP;
  END IF;
  
  -- Insert the new user
  INSERT INTO custom_users (user_id, pin, name, role)
  VALUES (new_user_id, input_pin, input_name, input_role)
  RETURNING id, user_id, name, role, created_at INTO user_record;
  
  -- Return success with user info
  RETURN json_build_object(
    'success', true,
    'user_id', user_record.user_id,
    'user', json_build_object(
      'id', user_record.id,
      'user_id', user_record.user_id,
      'name', user_record.name,
      'role', user_record.role,
      'created_at', user_record.created_at
    )
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User ID already exists. Please choose a different one.'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Registration failed. Please try again.'
    );
END;
$$;
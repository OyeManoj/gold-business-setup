-- Create RPC to delete a single transaction for a custom user
CREATE OR REPLACE FUNCTION public.delete_transaction_for_custom_user(
  input_user_id text,
  input_transaction_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  exists_user boolean;
  deleted_count int;
BEGIN
  -- Verify the custom user exists and is active
  SELECT EXISTS (
    SELECT 1 FROM custom_users 
    WHERE user_id = input_user_id AND is_active = true
  ) INTO exists_user;

  IF NOT exists_user THEN
    RETURN json_build_object('success', false, 'error', 'User not found or inactive');
  END IF;

  -- Delete the specific transaction belonging to this custom user
  DELETE FROM transactions 
  WHERE user_id = input_user_id 
    AND id = input_transaction_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    RETURN json_build_object('success', true, 'deleted', deleted_count);
  ELSE
    RETURN json_build_object('success', false, 'error', 'Transaction not found');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Failed to delete transaction');
END;
$function$;
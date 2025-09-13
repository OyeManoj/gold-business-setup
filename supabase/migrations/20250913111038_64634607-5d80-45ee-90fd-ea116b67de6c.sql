-- Secure RPCs for transactions using custom 4-digit user IDs

-- Upsert a transaction for a custom user (create or update)
CREATE OR REPLACE FUNCTION public.upsert_transaction_for_custom_user(
  input_user_id text,
  input_id uuid,
  input_type text,
  input_weight numeric,
  input_purity numeric,
  input_reduction numeric,
  input_rate numeric,
  input_fine_gold numeric,
  input_amount numeric,
  input_remaining_fine_gold numeric,
  input_created_at timestamptz,
  input_updated_at timestamptz
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM custom_users 
    WHERE user_id = input_user_id AND is_active = true
  ) INTO exists_user;

  IF NOT exists_user THEN
    RETURN json_build_object('success', false, 'error', 'User not found or inactive');
  END IF;

  INSERT INTO transactions (
    id, user_id, type, weight, purity, reduction, rate, fine_gold, amount, remaining_fine_gold, created_at, updated_at
  ) VALUES (
    input_id, input_user_id, input_type, input_weight, input_purity, input_reduction, input_rate, input_fine_gold, input_amount, input_remaining_fine_gold, input_created_at, input_updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    weight = EXCLUDED.weight,
    purity = EXCLUDED.purity,
    reduction = EXCLUDED.reduction,
    rate = EXCLUDED.rate,
    fine_gold = EXCLUDED.fine_gold,
    amount = EXCLUDED.amount,
    remaining_fine_gold = EXCLUDED.remaining_fine_gold,
    updated_at = EXCLUDED.updated_at;

  RETURN json_build_object('success', true, 'id', input_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Failed to upsert transaction');
END;
$$;

-- Get transactions for a custom user
CREATE OR REPLACE FUNCTION public.get_transactions_for_custom_user(input_user_id text)
RETURNS SETOF public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM custom_users 
    WHERE user_id = input_user_id AND is_active = true
  ) INTO exists_user;

  IF NOT exists_user THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT *
    FROM transactions
    WHERE user_id = input_user_id
    ORDER BY created_at DESC;
END;
$$;

-- Delete all transactions for a custom user
CREATE OR REPLACE FUNCTION public.delete_transactions_for_custom_user(input_user_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  exists_user boolean;
  deleted_count int;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM custom_users 
    WHERE user_id = input_user_id AND is_active = true
  ) INTO exists_user;

  IF NOT exists_user THEN
    RETURN json_build_object('success', false, 'error', 'User not found or inactive');
  END IF;

  DELETE FROM transactions WHERE user_id = input_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN json_build_object('success', true, 'deleted', deleted_count);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Failed to delete transactions');
END;
$$;
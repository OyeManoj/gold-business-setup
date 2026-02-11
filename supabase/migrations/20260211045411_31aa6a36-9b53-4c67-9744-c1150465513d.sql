
-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================
-- TABLES
-- =====================

-- 1. custom_users
CREATE TABLE public.custom_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  name text NOT NULL,
  pin_hash text NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_users ENABLE ROW LEVEL SECURITY;

-- 2. transactions
CREATE TABLE public.transactions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.custom_users(user_id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('EXCHANGE', 'PURCHASE', 'SALE')),
  weight numeric NOT NULL DEFAULT 0,
  purity numeric NOT NULL DEFAULT 0,
  reduction numeric,
  rate numeric NOT NULL DEFAULT 0,
  fine_gold numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  remaining_fine_gold numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. business_profiles
CREATE TABLE public.business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL REFERENCES public.custom_users(user_id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text,
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- 4. audit_logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  custom_user_id text,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_data jsonb,
  new_data jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  device_info jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================
-- RPC FUNCTIONS (SECURITY DEFINER)
-- =====================

-- 1. register_custom_user
CREATE OR REPLACE FUNCTION public.register_custom_user(
  input_name text,
  input_pin text,
  input_role text DEFAULT 'employee',
  input_user_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id text;
  hashed_pin text;
BEGIN
  -- Generate 4-digit user ID if not provided
  IF input_user_id IS NULL OR input_user_id = '' THEN
    LOOP
      new_user_id := LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
      EXIT WHEN NOT EXISTS (SELECT 1 FROM custom_users WHERE user_id = new_user_id);
    END LOOP;
  ELSE
    new_user_id := input_user_id;
    IF EXISTS (SELECT 1 FROM custom_users WHERE user_id = new_user_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'User ID already exists');
    END IF;
  END IF;

  -- Hash PIN
  hashed_pin := crypt(input_pin, gen_salt('bf'));

  INSERT INTO custom_users (user_id, name, pin_hash, role)
  VALUES (new_user_id, input_name, hashed_pin, input_role);

  RETURN jsonb_build_object('success', true, 'user_id', new_user_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. verify_login_credentials
CREATE OR REPLACE FUNCTION public.verify_login_credentials(
  input_user_id text,
  input_pin text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Update last login
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

-- 3. upsert_transaction_for_custom_user
CREATE OR REPLACE FUNCTION public.upsert_transaction_for_custom_user(
  input_user_id text,
  input_id text,
  input_type text,
  input_weight numeric,
  input_purity numeric,
  input_reduction numeric DEFAULT NULL,
  input_rate numeric DEFAULT 0,
  input_fine_gold numeric DEFAULT 0,
  input_amount numeric DEFAULT 0,
  input_remaining_fine_gold numeric DEFAULT NULL,
  input_created_at timestamptz DEFAULT now(),
  input_updated_at timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM custom_users WHERE user_id = input_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  INSERT INTO transactions (id, user_id, type, weight, purity, reduction, rate, fine_gold, amount, remaining_fine_gold, created_at, updated_at)
  VALUES (input_id, input_user_id, input_type, input_weight, input_purity, input_reduction, input_rate, input_fine_gold, input_amount, input_remaining_fine_gold, input_created_at, input_updated_at)
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

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 4. get_transactions_for_custom_user
CREATE OR REPLACE FUNCTION public.get_transactions_for_custom_user(
  input_user_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'type', t.type,
      'weight', t.weight,
      'purity', t.purity,
      'reduction', t.reduction,
      'rate', t.rate,
      'fine_gold', t.fine_gold,
      'amount', t.amount,
      'remaining_fine_gold', t.remaining_fine_gold,
      'created_at', t.created_at,
      'updated_at', t.updated_at
    ) ORDER BY t.created_at DESC
  ), '[]'::jsonb)
  INTO result
  FROM transactions t
  WHERE t.user_id = input_user_id;

  RETURN result;
END;
$$;

-- 5. delete_transaction_for_custom_user
CREATE OR REPLACE FUNCTION public.delete_transaction_for_custom_user(
  input_user_id text,
  input_transaction_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_deleted int;
BEGIN
  DELETE FROM transactions
  WHERE id = input_transaction_id AND user_id = input_user_id;

  GET DIAGNOSTICS rows_deleted = ROW_COUNT;

  IF rows_deleted = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 6. delete_transactions_for_custom_user
CREATE OR REPLACE FUNCTION public.delete_transactions_for_custom_user(
  input_user_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM transactions WHERE user_id = input_user_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- 7. get_user_business_profile
CREATE OR REPLACE FUNCTION public.get_user_business_profile(
  input_user_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_profile record;
BEGIN
  SELECT name, phone, address
  INTO found_profile
  FROM business_profiles
  WHERE user_id = input_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No profile found');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'profile', jsonb_build_object(
      'name', found_profile.name,
      'phone', found_profile.phone,
      'address', found_profile.address
    )
  );
END;
$$;

-- 8. upsert_business_profile
CREATE OR REPLACE FUNCTION public.upsert_business_profile(
  input_user_id text,
  input_name text,
  input_phone text DEFAULT NULL,
  input_address text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM custom_users WHERE user_id = input_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  INSERT INTO business_profiles (user_id, name, phone, address)
  VALUES (input_user_id, input_name, input_phone, input_address)
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    updated_at = now();

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =====================
-- RLS POLICIES (deny direct access, all through RPCs)
-- =====================

-- No direct access policies - all tables use SECURITY DEFINER RPCs
-- The default RLS with no policies = deny all direct access
-- Grant anon the ability to execute the RPC functions

GRANT USAGE ON SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION public.register_custom_user TO anon;
GRANT EXECUTE ON FUNCTION public.verify_login_credentials TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_transaction_for_custom_user TO anon;
GRANT EXECUTE ON FUNCTION public.get_transactions_for_custom_user TO anon;
GRANT EXECUTE ON FUNCTION public.delete_transaction_for_custom_user TO anon;
GRANT EXECUTE ON FUNCTION public.delete_transactions_for_custom_user TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_business_profile TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_business_profile TO anon;

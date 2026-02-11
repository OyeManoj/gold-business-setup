

# Database Setup Plan for "my gtrade" Supabase Project

This plan creates all the tables, functions, RLS policies, and fixes all TypeScript build errors so the app works with your new Supabase project.

---

## Phase 1: Database Migration

Create the following database objects in a single migration:

### Tables

1. **custom_users** - Stores user accounts with 4-digit IDs and hashed PINs
   - `id` (uuid, PK)
   - `user_id` (text, unique, 4 digits)
   - `name` (text)
   - `pin_hash` (text) -- bcrypt hashed
   - `role` (text: 'admin' or 'employee')
   - `last_login` (timestamptz)
   - `created_at` (timestamptz)

2. **transactions** - Gold transactions
   - `id` (text, PK)
   - `user_id` (text, references custom_users.user_id)
   - `type` (text: EXCHANGE/PURCHASE/SALE)
   - `weight`, `purity`, `reduction`, `rate`, `fine_gold`, `amount`, `remaining_fine_gold` (numeric)
   - `created_at`, `updated_at` (timestamptz)

3. **business_profiles** - Business info per user
   - `id` (uuid, PK)
   - `user_id` (text, references custom_users.user_id)
   - `name`, `phone`, `address` (text)
   - `created_at`, `updated_at` (timestamptz)

4. **audit_logs** - Action logging
   - `id` (uuid, PK)
   - `user_id` (uuid, nullable)
   - `custom_user_id` (text, nullable)
   - `action`, `resource_type`, `resource_id` (text)
   - `old_data`, `new_data`, `metadata`, `device_info` (jsonb)
   - `ip_address`, `user_agent` (text)
   - `created_at` (timestamptz)

### RPC Functions (SECURITY DEFINER)

1. **register_custom_user** - Creates user with hashed PIN, generates 4-digit ID if not provided
2. **verify_login_credentials** - Validates PIN using pgcrypto, returns user data
3. **upsert_transaction_for_custom_user** - Insert/update a transaction
4. **get_transactions_for_custom_user** - Fetch user's transactions
5. **delete_transaction_for_custom_user** - Delete single transaction
6. **delete_transactions_for_custom_user** - Delete all transactions for user
7. **get_user_business_profile** - Fetch business profile
8. **upsert_business_profile** - Insert/update business profile

### RLS Policies & Extensions

- Enable RLS on all tables
- Enable `pgcrypto` extension for password hashing
- Policies allow `anon` role to call RPC functions only (no direct table access from client)
- Direct SELECT/INSERT/UPDATE/DELETE denied on all tables (all access through SECURITY DEFINER RPCs)

---

## Phase 2: Fix TypeScript Build Errors

### 2a. Fix `supabase.rpc()` type errors
Since the generated `types.ts` has empty Functions, all `supabase.rpc(...)` calls fail type checking. Fix by casting: `(supabase.rpc as any)(...)` in:
- `src/contexts/AuthContext.tsx`
- `src/utils/storage.ts`
- `src/components/BusinessProfileForm.tsx`

### 2b. Fix `encryption.ts` BufferSource error (line 28)
Cast `encodedData` to fix the `Uint8Array` type incompatibility:
```typescript
encodedData as unknown as BufferSource
```

### 2c. Fix null checks
Add proper null checks (`data?.success`, `data?.error`, etc.) throughout AuthContext, storage, and BusinessProfileForm.

---

## Phase 3: Update Edge Function

Update `supabase/functions/audit-log/index.ts`:
- Use `SUPABASE_SERVICE_ROLE_KEY` instead of anon key (since there's no Supabase Auth user, the custom auth system is used)
- Remove `auth.getUser()` check, instead validate custom user from request body or header
- Use service role client to insert into `audit_logs` table

---

## Technical Summary

| Item | Count |
|------|-------|
| Tables to create | 4 |
| RPC functions | 8 |
| RLS policies | ~8 |
| Files to edit | 4 (AuthContext, storage, BusinessProfileForm, encryption) |
| Edge functions to update | 1 (audit-log) |


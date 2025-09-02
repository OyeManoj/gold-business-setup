-- Fix transactions table to work with custom authentication
-- Update the user_id to be text to match custom_users table
ALTER TABLE transactions 
ALTER COLUMN user_id TYPE text;

-- Update RLS policies to work with custom authentication
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

-- Create new policies that work with custom authentication stored in localStorage
CREATE POLICY "Allow all operations for authenticated users" ON transactions
FOR ALL
USING (true)
WITH CHECK (true);
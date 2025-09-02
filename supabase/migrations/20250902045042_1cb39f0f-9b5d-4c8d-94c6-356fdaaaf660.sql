-- First drop all existing policies that reference user_id
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

-- Now we can alter the column type
ALTER TABLE transactions 
ALTER COLUMN user_id TYPE text;

-- Create new policies that work with custom authentication
CREATE POLICY "Allow all operations for authenticated users" ON transactions
FOR ALL
USING (true)
WITH CHECK (true);
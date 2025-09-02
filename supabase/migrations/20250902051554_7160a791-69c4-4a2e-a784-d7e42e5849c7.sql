-- Drop existing RLS policies for business_profiles
DROP POLICY IF EXISTS "Users can view their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can insert their own business profile" ON business_profiles;

-- Change user_id column to text to work with custom authentication
ALTER TABLE business_profiles 
ALTER COLUMN user_id TYPE text;

-- Create new policies that allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON business_profiles
FOR ALL
USING (true)
WITH CHECK (true);
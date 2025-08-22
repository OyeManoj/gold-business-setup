-- Fix RLS policies for user_sessions to work with custom auth
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view sessions for their user ID" ON user_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON user_sessions;

-- Since we're using custom auth without Supabase Auth, we need to disable RLS for user_sessions
-- and handle access control in the application layer
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;
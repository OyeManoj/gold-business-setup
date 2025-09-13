-- Delete all accounts and related data
-- First delete related data to avoid foreign key constraints
DELETE FROM business_profiles;
DELETE FROM user_profiles;
DELETE FROM user_sessions;
DELETE FROM transactions;

-- Finally delete all custom users
DELETE FROM custom_users;
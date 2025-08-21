-- Add role column to custom_users table
ALTER TABLE public.custom_users ADD COLUMN role TEXT NOT NULL DEFAULT 'employee';

-- Create check constraint for valid roles
ALTER TABLE public.custom_users ADD CONSTRAINT valid_roles CHECK (role IN ('admin', 'employee'));

-- Update existing users with correct roles and credentials
UPDATE public.custom_users SET 
  role = 'admin',
  name = 'Admin User'
WHERE user_id = '1001';

UPDATE public.custom_users SET 
  user_id = '1002',
  pin = '9999',
  role = 'employee',
  name = 'Employee User'
WHERE user_id = '1002';

-- Remove the third user as it's not needed
DELETE FROM public.custom_users WHERE user_id = '1003';
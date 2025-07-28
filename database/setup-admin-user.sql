-- Setup admin user sinscrit@gmail.com in the database
-- This script should be run after the user is created in Supabase Auth
-- Run this in Supabase SQL Editor or via command line

-- First, ensure the user exists in Supabase Auth
-- You can create the user via Supabase Dashboard or Auth API
-- User ID: fa5911d7-f7c5-4ed4-8179-594359453d7f
-- Email: sinscrit@gmail.com

-- 1. Add user to admin_users table
INSERT INTO admin_users (id, email, full_name, role) 
VALUES (
  'fa5911d7-f7c5-4ed4-8179-594359453d7f',
  'sinscrit@gmail.com',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 2. Ensure the default account exists
INSERT INTO accounts (id, owner_id, name, description, settings) 
VALUES (
  '5036a927-fb8c-4a11-a698-9e17f32d6d5c',
  'fa5911d7-f7c5-4ed4-8179-594359453d7f',
  'Default Account',
  'Default account for admin user',
  '{}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  owner_id = EXCLUDED.owner_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 3. Add user to account_users table with owner role
INSERT INTO account_users (account_id, user_id, role, joined_at) 
VALUES (
  '5036a927-fb8c-4a11-a698-9e17f32d6d5c',
  'fa5911d7-f7c5-4ed4-8179-594359453d7f',
  'owner',
  NOW()
) ON CONFLICT (account_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  joined_at = EXCLUDED.joined_at;

-- 4. Update any existing properties to be associated with the account
UPDATE properties 
SET account_id = '5036a927-fb8c-4a11-a698-9e17f32d6d5c'
WHERE user_id = 'fa5911d7-f7c5-4ed4-8179-594359453d7f' 
  AND account_id IS NULL;

-- Verification queries (uncomment to run)
/*
-- Verify admin user
SELECT * FROM admin_users WHERE email = 'sinscrit@gmail.com';

-- Verify account
SELECT * FROM accounts WHERE id = '5036a927-fb8c-4a11-a698-9e17f32d6d5c';

-- Verify account association
SELECT au.*, a.name as account_name 
FROM account_users au 
JOIN accounts a ON au.account_id = a.id 
WHERE au.user_id = 'fa5911d7-f7c5-4ed4-8179-594359453d7f';

-- Verify properties
SELECT p.*, a.name as account_name 
FROM properties p 
LEFT JOIN accounts a ON p.account_id = a.id 
WHERE p.user_id = 'fa5911d7-f7c5-4ed4-8179-594359453d7f';
*/ 
# REQ-008: Multi-Tenant Database Structure Implementation (Phase 1) - Detailed Tasks

**Document Created**: July 26, 2025 17:24:51 CEST  
**Request Reference**: docs/gen_requests.md - Request #008  
**Overview Document**: docs/req-008-Multi-Tenant-Database-Structure-Implementation-Phase-1-Overview.md  
**Type**: Major Feature Implementation (Architecture - Phase 1)  
**Complexity**: 13 Points (High Complexity)  
**Status**: PENDING

## Implementation Instructions

**CRITICAL**: All tasks must be executed from the project root directory (`/Users/shinyqk/Documents/mastuff/proj/ai_stuff/aibnb/faqbnb_manus`). DO NOT navigate to other folders.

**Database Operations**: Use Supabase MCP tools (`mcp_supabase_*`) for all database schema modifications and data operations.

**Authorized Files**: Only modify files listed in the "Authorized Files and Functions for Modification" section of the overview document.

## Current Database State Analysis

Based on database inspection (July 26, 2025 17:24:51 CEST), the following tables already exist:
- ✅ `users` table (with auth integration)
- ✅ `properties` table (with user_id and property_type_id)
- ✅ `property_types` table
- ✅ `items` table (with property_id foreign key)
- ✅ `item_links`, `item_visits`, `item_reactions`, `admin_users`, `mailing_list_subscribers`

**Missing for REQ-008**:
- ❌ `accounts` table
- ❌ `account_users` junction table
- ❌ Account-based property relationships

## Task Breakdown (13 Story Points)

### 1. Database Schema Analysis and Validation (1 point) -unit tested-

**Goal**: Verify current database state and confirm requirements for account structure

**Substeps**:
- [x] Use `mcp_supabase_list_tables` to get current table list
- [x] Use `mcp_supabase_execute_sql` with `SELECT * FROM information_schema.tables WHERE table_schema = 'public'` to verify table existence
- [x] Use `mcp_supabase_execute_sql` with `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'properties' AND table_schema = 'public'` to verify properties table structure
- [x] Use `mcp_supabase_execute_sql` with `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'` to verify users table structure
- [x] Document findings in `tmp/database-state-analysis.md` with current schema state
- [x] Confirm no `accounts` or `account_users` tables exist
- [x] Validate that items.property_id foreign key exists and is properly constrained

### 2. Create Accounts Table Schema (1 point) -unit tested-

**Goal**: Create the primary accounts table for multi-tenant architecture

**Substeps**:
- [x] Use `mcp_supabase_apply_migration` to create accounts table with name: `create_accounts_table`
- [x] Include these columns in the migration:
  - [x] `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
  - [x] `owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - [x] `name VARCHAR(255) NOT NULL`
  - [x] `description TEXT`
  - [x] `settings JSONB DEFAULT '{}'::jsonb`
  - [x] `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
  - [x] `updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- [x] Add constraint: `CONSTRAINT accounts_name_owner_unique UNIQUE(owner_id, name)`
- [x] Add index: `CREATE INDEX idx_accounts_owner_id ON accounts(owner_id)`
- [x] Add comment: `COMMENT ON TABLE accounts IS 'Multi-tenant accounts - primary organizational entity'`
- [x] Enable RLS: `ALTER TABLE accounts ENABLE ROW LEVEL SECURITY`
- [x] Verify table creation with `mcp_supabase_execute_sql` using `SELECT * FROM accounts LIMIT 1`

### 3. Create Account-Users Junction Table Schema (1 point) -unit tested-

**Goal**: Create many-to-many relationship table between accounts and users

**Substeps**:
- [x] Use `mcp_supabase_apply_migration` to create account_users table with name: `create_account_users_table`
- [x] Include these columns in the migration:
  - [x] `account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE`
  - [x] `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - [x] `role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer'))`
  - [x] `invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
  - [x] `joined_at TIMESTAMP WITH TIME ZONE`
  - [x] `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- [x] Add primary key: `PRIMARY KEY (account_id, user_id)`
- [x] Add indexes: 
  - [x] `CREATE INDEX idx_account_users_account_id ON account_users(account_id)`
  - [x] `CREATE INDEX idx_account_users_user_id ON account_users(user_id)`
  - [x] `CREATE INDEX idx_account_users_role ON account_users(account_id, role)`
- [x] Add comment: `COMMENT ON TABLE account_users IS 'Junction table for account membership and roles'`
- [x] Enable RLS: `ALTER TABLE account_users ENABLE ROW LEVEL SECURITY`
- [x] Verify table creation with `mcp_supabase_execute_sql` using `SELECT * FROM account_users LIMIT 1`

### 4. Add Account Reference to Properties Table (1 point) -unit tested-

**Goal**: Link properties to accounts while maintaining backward compatibility

**Substeps**:
- [x] Use `mcp_supabase_apply_migration` to add account_id to properties with name: `add_account_id_to_properties`
- [x] Add column: `ALTER TABLE properties ADD COLUMN account_id UUID REFERENCES accounts(id)`
- [x] Add index: `CREATE INDEX idx_properties_account_id ON properties(account_id)`
- [x] Add comment: `COMMENT ON COLUMN properties.account_id IS 'Foreign key to accounts.id - which account owns this property'`
- [x] Verify column addition with `mcp_supabase_execute_sql` using `SELECT column_name FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'account_id'`
- [x] Test that existing properties are not affected with `mcp_supabase_execute_sql` using `SELECT id, user_id, account_id FROM properties`

### 5. Create Basic RLS Policies for Accounts (1 point) -unit tested-

**Goal**: Implement Row Level Security policies for account access control

**Substeps**:
- [x] Use `mcp_supabase_apply_migration` with name: `create_accounts_rls_policies`
- [x] Create policy for account owners: 
  - [x] `CREATE POLICY "Account owners can manage their accounts" ON accounts FOR ALL USING (owner_id = auth.uid())`
- [x] Create policy for account members:
  - [x] `CREATE POLICY "Account members can view accounts" ON accounts FOR SELECT USING (EXISTS (SELECT 1 FROM account_users WHERE account_users.account_id = accounts.id AND account_users.user_id = auth.uid()))`
- [x] Create policy for account_users table:
  - [x] `CREATE POLICY "Account members can view membership" ON account_users FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM accounts WHERE accounts.id = account_users.account_id AND accounts.owner_id = auth.uid()))`
- [x] Create policy for account owners to manage membership:
  - [x] `CREATE POLICY "Account owners can manage membership" ON account_users FOR ALL USING (EXISTS (SELECT 1 FROM accounts WHERE accounts.id = account_users.account_id AND accounts.owner_id = auth.uid()))`
- [x] Verify policies with `mcp_supabase_execute_sql` using `SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('accounts', 'account_users')`

### 6. Create Data Migration Script for Default Accounts (1 point) -unit tested-

**Goal**: Create default accounts for existing users without data loss

**Substeps**:
- [x] Create migration file `tmp/migrate-users-to-accounts.sql`
- [x] Add script content to create default account for each existing user:
  - [x] `INSERT INTO accounts (owner_id, name, description) SELECT id, 'Default Account', 'Auto-created default account' FROM users WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE accounts.owner_id = users.id)`
- [x] Add script to link users to their default accounts:
  - [x] `INSERT INTO account_users (account_id, user_id, role, joined_at) SELECT a.id, a.owner_id, 'owner', NOW() FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM account_users au WHERE au.account_id = a.id AND au.user_id = a.owner_id)`
- [x] Add validation query: `SELECT u.email, a.name, au.role FROM users u JOIN accounts a ON a.owner_id = u.id JOIN account_users au ON au.account_id = a.id AND au.user_id = u.id`
- [x] Test migration script in safe mode with `mcp_supabase_execute_sql` using `BEGIN; [migration content]; ROLLBACK;`
- [x] Document expected results in `tmp/migration-validation.md`

### 7. Execute Data Migration for Default Accounts (1 point) -unit tested-

**Goal**: Execute the migration to create accounts for existing users

**Substeps**:
- [x] Verify current user count with `mcp_supabase_execute_sql` using `SELECT COUNT(*) as user_count FROM users`
- [x] Execute migration with `mcp_supabase_execute_sql` using content from `tmp/migrate-users-to-accounts.sql`
- [x] Verify account creation with `mcp_supabase_execute_sql` using `SELECT COUNT(*) as account_count FROM accounts`
- [x] Verify account-user relationships with `mcp_supabase_execute_sql` using `SELECT COUNT(*) as membership_count FROM account_users WHERE role = 'owner'`
- [x] Validate data integrity with `mcp_supabase_execute_sql` using `SELECT u.email, a.name FROM users u LEFT JOIN accounts a ON a.owner_id = u.id WHERE a.id IS NULL`
- [x] Document migration results in `tmp/migration-execution-log.md`
- [x] Confirm no data loss by verifying all users have accounts

### 8. Link Existing Properties to Default Accounts (1 point) -unit tested-

**Goal**: Migrate existing properties to their user's default account

**Substeps**:
- [x] Create migration script in `tmp/link-properties-to-accounts.sql`
- [x] Add update query to link properties to default accounts:
  - [x] `UPDATE properties SET account_id = (SELECT id FROM accounts WHERE accounts.owner_id = properties.user_id) WHERE account_id IS NULL`
- [x] Add validation query: `SELECT p.nickname, u.email, a.name FROM properties p JOIN users u ON u.id = p.user_id JOIN accounts a ON a.id = p.account_id`
- [x] Test migration with `mcp_supabase_execute_sql` using `BEGIN; [migration content]; ROLLBACK;`
- [x] Execute migration with `mcp_supabase_execute_sql` using the update query
- [x] Verify all properties are linked with `mcp_supabase_execute_sql` using `SELECT COUNT(*) as unlinked_properties FROM properties WHERE account_id IS NULL`
- [x] Validate property-account relationships with `mcp_supabase_execute_sql` using `SELECT COUNT(*) as linked_properties FROM properties WHERE account_id IS NOT NULL`

### 9. Create Account TypeScript Interfaces (1 point) -unit tested-

**Goal**: Add TypeScript type definitions for account structures

**Substeps**:
- [x] Read current content of `src/types/index.ts`
- [x] Add Account interface:
  ```typescript
  export interface Account {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    settings: Record<string, any>;
    created_at: string;
    updated_at: string;
  }
  ```
- [x] Add AccountUser interface:
  ```typescript
  export interface AccountUser {
    account_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    invited_at: string;
    joined_at: string | null;
    created_at: string;
  }
  ```
- [x] Add AccountRole enum:
  ```typescript
  export type AccountRole = 'owner' | 'admin' | 'member' | 'viewer';
  ```
- [x] Update existing Property interface to include account_id:
  ```typescript
  account_id: string | null; // Add this field
  ```
- [x] Verify TypeScript compilation with `run_terminal_cmd` using `npm run build`

### 10. Create Basic Account Management API Routes (1 point)

**Goal**: Implement GET /api/admin/accounts endpoint

**Substeps**:
- [ ] Create directory `src/app/api/admin/accounts` 
- [ ] Create file `src/app/api/admin/accounts/route.ts`
- [ ] Import required dependencies:
  - [ ] `import { NextRequest, NextResponse } from 'next/server'`
  - [ ] `import { supabase } from '@/lib/supabase'`
  - [ ] `import { Account } from '@/types'`
- [ ] Implement GET handler to list user's accessible accounts:
  - [ ] Extract user from auth headers
  - [ ] Query accounts where user is owner or member
  - [ ] Return accounts with proper error handling
- [ ] Add proper TypeScript types for request/response
- [ ] Test endpoint with manual API call using `mcp_supabase_execute_sql` to verify data
- [ ] Verify endpoint responds correctly by testing in browser/Postman

### 11. Create Individual Account API Routes (1 point)

**Goal**: Implement GET /api/admin/accounts/[accountId] endpoint

**Substeps**:
- [ ] Create directory `src/app/api/admin/accounts/[accountId]`
- [ ] Create file `src/app/api/admin/accounts/[accountId]/route.ts` 
- [ ] Implement GET handler for individual account:
  - [ ] Extract accountId from params
  - [ ] Validate user has access to account
  - [ ] Return account details with membership info
- [ ] Implement PUT handler for account updates:
  - [ ] Validate user is account owner or admin
  - [ ] Update account name/description
  - [ ] Return updated account data
- [ ] Add proper authorization checks using RLS policies
- [ ] Test both GET and PUT endpoints
- [ ] Verify proper error handling for unauthorized access

### 12. Add Account Context to Authentication Library (1 point)

**Goal**: Extend auth.ts with account-related functions

**Substeps**:
- [ ] Read current content of `src/lib/auth.ts`
- [ ] Add function `getAccountsForUser(userId: string): Promise<Account[]>`:
  - [ ] Query accounts where user is owner or member
  - [ ] Include role information from account_users
  - [ ] Return array of accessible accounts
- [ ] Add function `canAccessAccount(userId: string, accountId: string): Promise<boolean>`:
  - [ ] Check if user is account owner or member
  - [ ] Return boolean access result
- [ ] Add function `validateAccountOwnership(userId: string, accountId: string): Promise<boolean>`:
  - [ ] Check if user is account owner specifically
  - [ ] Return boolean ownership result
- [ ] Add function `getDefaultAccountForUser(userId: string): Promise<Account | null>`:
  - [ ] Get user's default account (first owned account)
  - [ ] Return account or null if none exists
- [ ] Test new functions with `mcp_supabase_execute_sql` queries to verify logic
- [ ] Verify TypeScript compilation

### 13. Validate Public Access Unchanged (1 point)

**Goal**: Ensure all public item access continues to work identically

**Substeps**:
- [ ] Read current content of `src/app/item/[publicId]/page.tsx`
- [ ] Read current content of `src/app/api/items/[publicId]/route.ts`
- [ ] Test public item access with `mcp_supabase_execute_sql` using `SELECT public_id, name FROM items LIMIT 3`
- [ ] Manually test item URLs work in browser (if available)
- [ ] Verify QR code functionality remains unchanged
- [ ] Test that public API endpoints return data correctly
- [ ] Confirm no authentication is required for public item access
- [ ] Document test results in `tmp/public-access-validation.md`
- [ ] Verify that the account changes don't break any public functionality

## Testing and Validation Tasks

### Database Testing (Included in above tasks)
- All database operations include immediate validation queries
- Migration scripts include rollback testing
- Data integrity checks after each major change

### API Testing (Included in above tasks)  
- Each API endpoint includes basic functionality testing
- Authorization and error handling verification
- Response format validation

### Public Access Testing (Task 13)
- Complete validation that public functionality is preserved
- QR code and direct URL access verification

## Success Criteria Validation

After completing all tasks, verify:
- [ ] All existing public functionality preserved (Task 13)
- [ ] Zero data loss during migration (Tasks 6-8)
- [ ] Accounts table and relationships functional (Tasks 2-5)
- [ ] Basic account APIs operational (Tasks 10-11)
- [ ] TypeScript types properly defined (Task 9)
- [ ] Authentication library extended (Task 12)

## Risk Mitigation

- **Data Loss Prevention**: All migrations include validation and rollback testing
- **Public Access Protection**: Dedicated task for public functionality verification
- **Type Safety**: TypeScript compilation verification included
- **Authorization Security**: RLS policies implemented and tested

## Files Modified (As Per Authorization)

### Database Files
- Migration files created in Supabase using `mcp_supabase_apply_migration`
- Validation scripts in `tmp/` directory

### API Route Files  
- `src/app/api/admin/accounts/route.ts` (NEW)
- `src/app/api/admin/accounts/[accountId]/route.ts` (NEW)

### Type Definition Files
- `src/types/index.ts` (MODIFIED - add Account interfaces)

### Authentication Files
- `src/lib/auth.ts` (MODIFIED - add account functions)

### Validation Files
- `tmp/database-state-analysis.md` (NEW)
- `tmp/migrate-users-to-accounts.sql` (NEW)
- `tmp/migration-validation.md` (NEW)
- `tmp/migration-execution-log.md` (NEW)
- `tmp/link-properties-to-accounts.sql` (NEW)
- `tmp/public-access-validation.md` (NEW)

**Next Phase**: This implementation enables REQ-009 (Account-Based Property Management System - Phase 2) 
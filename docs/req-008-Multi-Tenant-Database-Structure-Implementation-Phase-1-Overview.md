# REQ-008: Multi-Tenant Database Structure Implementation (Phase 1) - Overview

**Document Created**: July 26, 2025 17:23:11 CEST  
**Request Reference**: docs/gen_requests.md - Request #008  
**Type**: Major Feature Implementation (Architecture - Phase 1)  
**Complexity**: 13 Points (High Complexity)  
**Status**: PENDING

## Request Summary

Implementation of foundational database structure for multi-tenant account system while preserving all existing public functionality. This phase establishes the core account architecture without breaking any existing features, preparing the foundation for full multi-tenant capabilities.

## Goals

1. **Database Architecture Foundation**: Create accounts table as primary tenant entity with owner relationships
2. **Account-User Association**: Establish many-to-many relationship between accounts and users through junction table
3. **Property-Account Linking**: Transform property ownership from direct user ownership to account-based ownership
4. **Data Preservation**: Maintain all existing data and public functionality during migration
5. **API Foundation**: Establish basic account management API endpoints for future phases

## Implementation Breakdown

### Phase 1.1: Database Schema Creation (8 points)
**Priority**: Critical - Foundation for entire system

#### 1.1.1 Accounts Table Creation
- **Goal**: Create primary tenant entity table
- **Implementation**:
  - UUID primary key with auto-generation
  - Owner user relationship (foreign key to auth.users)
  - Account metadata (name, description, settings)
  - Timestamps for audit trail
- **Success Criteria**: Accounts table created with proper constraints and indexes

#### 1.1.2 Account-Users Junction Table Creation  
- **Goal**: Enable many-to-many relationship between accounts and users
- **Implementation**:
  - Account ID and User ID foreign keys
  - Role within account (owner, admin, member, viewer)
  - Invitation and membership timestamps
  - Composite primary key on account_id + user_id
- **Success Criteria**: Junction table enables user membership in multiple accounts

#### 1.1.3 Properties Table Modification
- **Goal**: Link properties to accounts instead of direct user ownership
- **Implementation**:
  - Add account_id foreign key to properties table
  - Maintain user_id for backward compatibility during transition
  - Update indexes for account-based queries
  - Add migration constraints
- **Success Criteria**: Properties can be associated with accounts while preserving existing data

### Phase 1.2: Data Migration Strategy (3 points)
**Priority**: High - Data integrity critical

#### 1.2.1 Migration Script Development
- **Goal**: Safe migration with zero data loss
- **Implementation**:
  - Create default accounts for existing users
  - Migrate existing properties to user's default account
  - Preserve all item and link relationships
  - Validate data integrity throughout process
- **Success Criteria**: All existing data migrated successfully with validation

#### 1.2.2 Public Access Preservation
- **Goal**: Ensure item public URLs continue working unchanged
- **Implementation**:
  - Verify public item access routes remain functional
  - Test QR code scanning continues to work
  - Validate no breaking changes to public API
- **Success Criteria**: All public functionality works identically to before migration

#### 1.2.3 Rollback Capability
- **Goal**: Safe rollback if migration issues occur
- **Implementation**:
  - Pre-migration data backup
  - Rollback scripts for all schema changes
  - Data validation checkpoints
- **Success Criteria**: Complete rollback capability available

### Phase 1.3: Basic Account Management API (2 points)
**Priority**: Medium - Prepares for Phase 2

#### 1.3.1 Account Creation API
- **Goal**: Simple account creation for new users
- **Implementation**:
  - POST /api/admin/accounts endpoint
  - Basic validation and error handling
  - Owner assignment on creation
- **Success Criteria**: Accounts can be created via API

#### 1.3.2 Account Listing API
- **Goal**: Basic account retrieval for authenticated users
- **Implementation**:
  - GET /api/admin/accounts endpoint
  - User-specific account filtering
  - Basic response formatting
- **Success Criteria**: Users can retrieve their accessible accounts

#### 1.3.3 Owner Validation
- **Goal**: Ensure account ownership rules
- **Implementation**:
  - Account access validation middleware
  - Owner permission checking
  - Security policy enforcement
- **Success Criteria**: Only authorized users can access account data

## Technical Challenges

1. **Zero Downtime Migration**: Database changes without breaking existing functionality
2. **Public Access Preservation**: Maintaining item accessibility via public URLs during transition
3. **Data Integrity**: Ensuring proper relationships during migration
4. **Performance**: New account-based queries must be efficient from day one

## Implementation Order

1. **Database Schema Changes** (Critical Path)
   - Create accounts and account_users tables
   - Add account_id to properties table
   - Update indexes and constraints

2. **Migration Development** (Depends on Schema)
   - Develop migration scripts
   - Create validation procedures
   - Test rollback capabilities

3. **Data Migration Execution** (Depends on Migration Development)
   - Execute migration in staging environment
   - Validate data integrity
   - Execute production migration

4. **Basic API Implementation** (Can run parallel with migration)
   - Create account management endpoints
   - Implement type definitions
   - Add basic authentication integration

## Success Criteria

- ✅ All existing public functionality preserved
- ✅ Zero data loss during migration
- ✅ Accounts table and relationships functional
- ✅ Basic account APIs operational
- ✅ Performance maintained or improved
- ✅ Full rollback capability available

## Risk Mitigation

- **Data Loss Risk**: Comprehensive backup and validation procedures
- **Performance Risk**: Index optimization and query performance testing
- **Compatibility Risk**: Extensive testing of public access functionality
- **Security Risk**: Proper RLS policies and access control validation

## Authorized Files and Functions for Modification

### Database Schema Files
- `database/schema.sql` - Add accounts, account_users tables, modify properties table
- `database/migration-account-structure.sql` - New migration file for account structure
- Migration validation scripts (new files)

### API Route Files
- `src/app/api/admin/accounts/route.ts` - New account management API endpoints (CREATE)
- `src/app/api/admin/accounts/[accountId]/route.ts` - Individual account operations (CREATE)

### Type Definition Files  
- `src/types/index.ts` - Add Account, AccountUser interfaces and related types
  - Functions: Add Account, AccountUser, AccountRole interfaces
  - Functions: Update existing interfaces to include account context

### Authentication and Authorization Files
- `src/lib/auth.ts` - Add account context functions
  - Functions: getAccountsForUser(), canAccessAccount(), validateAccountOwnership()
- `src/contexts/AuthContext.tsx` - Add account context state management
  - Functions: Add accountContext state, account switching logic

### Migration and Validation Files (New)
- `database/migrations/001-create-accounts.sql` - Account table creation (CREATE)
- `database/migrations/002-add-account-to-properties.sql` - Property table modification (CREATE)
- `database/migrations/003-migrate-data-to-accounts.sql` - Data migration script (CREATE)
- `tmp/migration-validation.sql` - Migration validation queries (CREATE)

### Public Access Validation Files
- `src/app/item/[publicId]/page.tsx` - Verify public access unchanged
  - Functions: Ensure item display works identically
- `src/app/api/items/[publicId]/route.ts` - Verify public API unchanged
  - Functions: Ensure public item API works identically

### Configuration Files
- No configuration changes required for Phase 1

### Testing Files (Recommended)
- `tmp/account-test-queries.sql` - Account functionality testing (CREATE)
- `tmp/migration-test-scenarios.sql` - Migration testing scenarios (CREATE)

## Next Phase Dependencies

This Phase 1 implementation is a prerequisite for:
- **REQ-009**: Account-Based Property Management System (Phase 2)
- **REQ-010**: Multi-User Account Collaboration Features (Phase 3)

## Related Documentation

- **Request Details**: docs/gen_requests.md (Request #008)
- **Technical Architecture**: docs/gen_techguide.md
- **Use Cases**: docs/gen_USE_CASES.md 
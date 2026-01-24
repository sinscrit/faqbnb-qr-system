/**
 * Account Preferences API Endpoint
 *
 * REST API for managing account-level preferences such as preferred language.
 * Supports GET (retrieve) and PUT (update) operations with authentication and
 * authorization checks.
 *
 * REQ-E05-026: Create account preference API endpoint
 * Epic 5 - Owner Translation Management, Phase 6, Task 6.2
 *
 * @created 2026-01-24
 * @lastModified 2026-01-24
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Request body for updating account preferences.
 * Additional preferences can be added to this interface as needed.
 */
interface AccountPreferencesRequest {
  /** ISO 639-1 language code (e.g., 'en', 'fr', 'de') */
  preferredLanguage?: string;
  // Future preferences can be added here
}

/**
 * Successful response containing updated/current preferences.
 */
interface AccountPreferencesResponse {
  success: true;
  data: {
    accountId: string;
    preferences: {
      preferredLanguage: string | null;
    };
    updatedAt: string;
  };
}

/**
 * Error response for failed operations.
 */
interface ErrorResponse {
  success: false;
  error: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Supported language codes for preferences.
 * Must match the values in /src/lib/i18n/config.ts and database constraints.
 */
const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'nl', 'it'] as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Validates that the authenticated user is a member of the specified account.
 * Checks the account_users junction table for membership.
 *
 * @param userId - The authenticated user's ID
 * @param accountId - The account ID to check membership for
 * @returns Promise<boolean> - true if user is a member, false otherwise
 */
async function validateAccountAccess(
  userId: string,
  accountId: string
): Promise<boolean> {
  try {
    const { data: membership, error } = await supabase
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .single();

    if (error || !membership) {
      console.warn(`Account access denied: User ${userId} is not a member of account ${accountId}`);
      return false;
    }

    console.log(`Account access granted: User ${userId} has role '${membership.role}' in account ${accountId}`);
    return true;
  } catch (error) {
    console.error('Error validating account access:', error);
    return false;
  }
}

// =============================================================================
// PUT Endpoint
// =============================================================================

/**
 * Update account preferences (preferredLanguage, etc.).
 * Merges new preferences with existing settings to preserve other data.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<AccountPreferencesResponse | ErrorResponse>> {
  try {
    const authClient = createRouteHandlerClient<Database>({ cookies });
    const { accountId } = await params;

    console.log(`PUT /api/accounts/${accountId}/preferences - Request started`);

    // Step 1: Validate Authentication
    const { data: authResult, error: authError } = await authClient.auth.getUser();

    if (authError || !authResult.user) {
      console.warn('Authentication failed:', authError?.message || 'No user data');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;
    console.log(`Authenticated user: ${userId}`);

    // Step 2: Validate Authorization (Account Access)
    const hasAccess = await validateAccountAccess(userId, accountId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this account' },
        { status: 403 }
      );
    }

    // Step 3: Parse and Validate Request Body
    const body: AccountPreferencesRequest = await request.json();
    const { preferredLanguage } = body;

    if (preferredLanguage !== undefined) {
      if (typeof preferredLanguage !== 'string') {
        return NextResponse.json(
          { success: false, error: 'preferredLanguage must be a string' },
          { status: 400 }
        );
      }

      if (!SUPPORTED_LANGUAGES.includes(preferredLanguage as typeof SUPPORTED_LANGUAGES[number])) {
        return NextResponse.json(
          { success: false, error: `preferredLanguage must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` },
          { status: 400 }
        );
      }
    }

    console.log('Validated request body:', body);

    // Step 4: Fetch Current Account Settings
    const { data: currentAccount, error: fetchError } = await supabase
      .from('accounts')
      .select('settings')
      .eq('id', accountId)
      .single();

    if (fetchError || !currentAccount) {
      console.error('Account not found:', fetchError?.message);
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // Step 5: Merge New Preferences with Existing Settings
    const currentSettings = (currentAccount.settings as Record<string, unknown>) || {};
    const updatedSettings = {
      ...currentSettings,
      ...(preferredLanguage !== undefined && { preferredLanguage }),
    };

    console.log('Merging settings:', { current: currentSettings, updated: updatedSettings });

    // Step 6: Update Account Settings
    const { data: updatedAccount, error: updateError } = await supabase
      .from('accounts')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId)
      .select('id, settings, updated_at')
      .single();

    if (updateError || !updatedAccount) {
      console.error('Failed to update preferences:', updateError?.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    console.log(`Preferences updated successfully for account: ${accountId}`);

    // Step 7: Return Success Response
    const settings = updatedAccount.settings as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      data: {
        accountId: updatedAccount.id,
        preferences: {
          preferredLanguage: (settings?.preferredLanguage as string) || null,
        },
        updatedAt: updatedAccount.updated_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in PUT /api/accounts/[accountId]/preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET Endpoint
// =============================================================================

/**
 * Retrieve current account preferences.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
): Promise<NextResponse<AccountPreferencesResponse | ErrorResponse>> {
  try {
    const authClient = createRouteHandlerClient<Database>({ cookies });
    const { accountId } = await params;

    console.log(`GET /api/accounts/${accountId}/preferences - Request started`);

    // Validate authentication
    const { data: authResult, error: authError } = await authClient.auth.getUser();

    if (authError || !authResult.user) {
      console.warn('Authentication failed:', authError?.message || 'No user data');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = authResult.user.id;

    // Validate authorization
    const hasAccess = await validateAccountAccess(userId, accountId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this account' },
        { status: 403 }
      );
    }

    // Fetch account preferences
    const { data: account, error: fetchError } = await supabase
      .from('accounts')
      .select('id, settings, updated_at')
      .eq('id', accountId)
      .single();

    if (fetchError || !account) {
      console.error('Account not found:', fetchError?.message);
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    const settings = account.settings as Record<string, unknown>;
    return NextResponse.json({
      success: true,
      data: {
        accountId: account.id,
        preferences: {
          preferredLanguage: (settings?.preferredLanguage as string) || null,
        },
        updatedAt: account.updated_at || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/accounts/[accountId]/preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

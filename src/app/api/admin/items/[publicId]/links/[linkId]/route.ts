/**
 * REQ-E03-010: Individual Link Operations with Translation Integration
 *
 * GET /api/admin/items/[publicId]/links/[linkId] - Get single link
 * PUT /api/admin/items/[publicId]/links/[linkId] - Update link with translation trigger
 * DELETE /api/admin/items/[publicId]/links/[linkId] - Delete link
 *
 * Created: 2026-01-21
 * Last Modified: 2026-01-21 12:00:00 UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import {
  queueContentTranslations,
  detectSourceLanguage,
  deleteEntityTranslations
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type { UpdateLinkRequest } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

// Valid link types
const VALID_LINK_TYPES = ['youtube', 'pdf', 'image', 'text', 'video'] as const;

// Helper functions (same as parent route file)
async function getAccountContext(
  request: NextRequest,
  userId: string,
  isAdmin: boolean,
  supabase: SupabaseClient<Database>
): Promise<{ accountId: string | null; accountRole: string; error?: NextResponse }> {
  const accountIdHeader = request.headers.get('x-account-id');

  if (isAdmin && !accountIdHeader) {
    return { accountId: null, accountRole: 'admin' };
  }

  if (accountIdHeader) {
    const { data: accountUser, error } = await supabase
      .from('account_users')
      .select('account_id, role')
      .eq('user_id', userId)
      .eq('account_id', accountIdHeader)
      .single();

    if (error || !accountUser) {
      return {
        accountId: null,
        accountRole: '',
        error: NextResponse.json(
          { success: false, error: 'Access denied to specified account' },
          { status: 403 }
        )
      };
    }

    return { accountId: accountUser.account_id, accountRole: accountUser.role };
  }

  const { data: accountUser, error } = await supabase
    .from('account_users')
    .select('account_id, role')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !accountUser) {
    return {
      accountId: null,
      accountRole: '',
      error: NextResponse.json(
        { success: false, error: 'No account access' },
        { status: 403 }
      )
    };
  }

  return { accountId: accountUser.account_id, accountRole: accountUser.role };
}

async function getUserPreferredLanguage(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from('users')
    .select('preferred_language')
    .eq('id', userId)
    .single();
  return data?.preferred_language || null;
}

async function getAccountPreferredLanguage(
  supabase: SupabaseClient<Database>,
  accountId: string | null
): Promise<string | null> {
  if (!accountId) return null;
  const { data } = await supabase
    .from('accounts')
    .select('preferred_language')
    .eq('id', accountId)
    .single();
  return data?.preferred_language || null;
}

async function resolveAndValidateItemAccess(
  publicId: string,
  userId: string,
  isAdmin: boolean,
  accountId: string | null,
  supabase: SupabaseClient<Database>
): Promise<{ itemId: string | null; error?: NextResponse }> {
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      id,
      public_id,
      name,
      property_id,
      properties!left(account_id, user_id)
    `)
    .eq('public_id', publicId)
    .single();

  if (error || !item) {
    return {
      itemId: null,
      error: NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    };
  }

  const itemProperty = item.properties;

  if (isAdmin && !accountId) {
    return { itemId: item.id };
  }

  if (isAdmin && accountId) {
    if (itemProperty?.account_id !== accountId) {
      return {
        itemId: null,
        error: NextResponse.json(
          { success: false, error: 'Item does not belong to the specified account' },
          { status: 403 }
        )
      };
    }
    return { itemId: item.id };
  }

  const canAccess = itemProperty?.account_id === accountId;
  if (!canAccess) {
    return {
      itemId: null,
      error: NextResponse.json(
        { success: false, error: 'Access denied to item' },
        { status: 403 }
      )
    };
  }

  return { itemId: item.id };
}

/**
 * GET /api/admin/items/[publicId]/links/[linkId]
 * Get a single link by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
) {
  try {
    console.log('Admin get link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId, linkId } = await params;

    // Resolve item and validate access
    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    // Fetch the specific link
    const { data: link, error: linkError } = await supabase
      .from('item_links')
      .select('id, item_id, article_id, title, link_type, url, thumbnail_url, display_order, source_language, created_at')
      .eq('id', linkId)
      .eq('item_id', itemId)
      .single();

    if (linkError || !link) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: link.id,
        itemId: link.item_id,
        articleId: link.article_id || undefined,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url || undefined,
        displayOrder: link.display_order || 0,
        sourceLanguage: link.source_language || undefined,
        createdAt: link.created_at
      },
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Link GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/items/[publicId]/links/[linkId]
 * Update a link with translation trigger.
 * Only re-queues translations when title field changes.
 * URL changes do NOT trigger translation workflows.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
) {
  try {
    console.log('Admin update link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId, linkId } = await params;

    // Resolve item and validate access
    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    // Fetch existing link
    const { data: existingLink, error: linkError } = await supabase
      .from('item_links')
      .select('*')
      .eq('id', linkId)
      .eq('item_id', itemId)
      .single();

    if (linkError || !existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body: UpdateLinkRequest = await request.json();

    // Validate link type if provided
    if (body.linkType !== undefined && !VALID_LINK_TYPES.includes(body.linkType as typeof VALID_LINK_TYPES[number])) {
      return NextResponse.json(
        { success: false, error: `Invalid link type: ${body.linkType}. Valid types: ${VALID_LINK_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate URL if provided
    if (body.url !== undefined) {
      try {
        new URL(body.url);
      } catch {
        return NextResponse.json(
          { success: false, error: `Invalid URL format: ${body.url}` },
          { status: 400 }
        );
      }
    }

    // Detect if translatable field (title only) has changed
    const newTitle = body.title !== undefined ? body.title.trim() : existingLink.title;
    const translatableFieldsChanged = newTitle !== existingLink.title;

    // Fetch language preferences for source language detection
    const [userPreferredLanguage, accountPreferredLanguage] = await Promise.all([
      getUserPreferredLanguage(supabase, user.id),
      getAccountPreferredLanguage(supabase, accountId)
    ]);

    // Determine source language
    const sourceLanguage = detectSourceLanguage({
      user: { preferred_language: userPreferredLanguage },
      account: { preferred_language: accountPreferredLanguage },
      override: body.sourceLanguage
    });

    // Build update data object
    const updateData: Record<string, string | number | null> = {
      source_language: sourceLanguage
    };
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.linkType !== undefined) updateData.link_type = body.linkType;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl;
    if (body.displayOrder !== undefined) updateData.display_order = body.displayOrder;

    // Update link in database
    const { data: updatedLink, error: updateError } = await supabase
      .from('item_links')
      .update(updateData)
      .eq('id', linkId)
      .select()
      .single();

    if (updateError || !updatedLink) {
      console.error('Link update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update link' },
        { status: 500 }
      );
    }

    console.log('Link updated successfully:', updatedLink.id);

    // Translation handling - only process if title changed
    let translationJobIds: string[] = [];
    let translationError: string | undefined;
    let queuedLanguages: SupportedLanguage[] = [];

    if (translatableFieldsChanged) {
      try {
        // Delete existing translations (guests see source content while re-translating)
        await deleteEntityTranslations('link', updatedLink.id);
        console.log('Existing translations deleted for link:', updatedLink.id);

        // Queue new translations
        const translationResult = await queueContentTranslations({
          content: {
            entityType: 'link',
            entityId: updatedLink.id,
            sourceLanguage,
            fields: [
              {
                fieldName: 'title',
                value: updatedLink.title,
                context: { contentType: 'link_title', domainContext: 'property_rental_media' },
                maxLength: 255
              }
              // NOTE: URL is NEVER included - URLs are not translated
            ]
          },
          trigger: 'update'
        });

        if (translationResult.success) {
          translationJobIds = translationResult.jobIds;
          queuedLanguages = translationResult.queuedLanguages;
          console.log('Translation jobs queued after link update:', translationJobIds.length);
        } else {
          translationError = translationResult.error;
        }
      } catch (error) {
        console.error('Translation update error:', error);
        translationError = error instanceof Error ? error.message : 'Unknown translation error';
      }
    } else {
      console.log('No translatable field changes - skipping translation queuing');
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedLink.id,
        itemId: updatedLink.item_id,
        articleId: updatedLink.article_id || undefined,
        title: updatedLink.title,
        linkType: updatedLink.link_type,
        url: updatedLink.url,
        thumbnailUrl: updatedLink.thumbnail_url || undefined,
        displayOrder: updatedLink.display_order || 0,
        sourceLanguage: updatedLink.source_language || undefined,
        createdAt: updatedLink.created_at
      },
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError }),
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Link PUT API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/items/[publicId]/links/[linkId]
 * Delete a link. Translations are cascade-deleted by database FK constraint.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string; linkId: string }> }
) {
  try {
    console.log('Admin delete link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId, linkId } = await params;

    // Resolve item and validate access
    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    // Verify link exists and belongs to item
    const { data: existingLink, error: linkError } = await supabase
      .from('item_links')
      .select('id')
      .eq('id', linkId)
      .eq('item_id', itemId)
      .single();

    if (linkError || !existingLink) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Delete link (translations cascade-deleted via FK constraint)
    const { error: deleteError } = await supabase
      .from('item_links')
      .delete()
      .eq('id', linkId);

    if (deleteError) {
      console.error('Link delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete link' },
        { status: 500 }
      );
    }

    console.log('Link deleted successfully:', linkId);

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully',
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Link DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

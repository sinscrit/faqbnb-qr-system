/**
 * REQ-E03-010: Links CRUD Endpoints with Translation Integration
 *
 * GET /api/admin/items/[publicId]/links - List all links for an item
 * POST /api/admin/items/[publicId]/links - Create new link with translation trigger
 *
 * Created: 2026-01-21
 * Last Modified: 2026-01-21 12:00:00 UTC
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import {
  queueContentTranslations,
  detectSourceLanguage,
} from '@/lib/content-translation';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';
import type { CreateLinkRequest } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

// Valid link types
const VALID_LINK_TYPES = ['youtube', 'pdf', 'image', 'text', 'video'] as const;

/**
 * Extract account context from request headers.
 * Follows pattern from /src/app/api/admin/items/route.ts
 */
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

/**
 * Fetch user's preferred language from database.
 */
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

/**
 * Fetch account's preferred language from database.
 */
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

/**
 * Resolve item ID from publicId and validate access.
 */
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
 * GET /api/admin/items/[publicId]/links
 * List all links for an item, ordered by display_order.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    console.log('Admin list links API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId } = await params;

    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;

    const { data: links, error: linksError } = await supabase
      .from('item_links')
      .select('id, item_id, article_id, title, link_type, url, thumbnail_url, display_order, source_language, created_at')
      .eq('item_id', itemId)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('Links fetch error:', linksError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch links' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (links || []).map(link => ({
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
      })),
      accountContext: { accountId, accountRole }
    });
  } catch (error) {
    console.error('Links GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/items/[publicId]/links
 * Create a new link with translation trigger.
 * Only the title field is translated - URLs are never translated.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    console.log('Admin create link API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) return authResult.error;

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) return accountContext.error;

    const { accountId, accountRole } = accountContext;
    const { publicId } = await params;

    const itemAccess = await resolveAndValidateItemAccess(
      publicId,
      user.id,
      userIsAdmin,
      accountId,
      supabase
    );
    if (itemAccess.error) return itemAccess.error;

    const itemId = itemAccess.itemId!;
    const body: CreateLinkRequest = await request.json();

    // Validation
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required field: title' },
        { status: 400 }
      );
    }

    if (!body.linkType || !VALID_LINK_TYPES.includes(body.linkType as typeof VALID_LINK_TYPES[number])) {
      return NextResponse.json(
        { success: false, error: `Invalid link type: ${body.linkType}. Valid types: ${VALID_LINK_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { success: false, error: `Invalid URL format: ${body.url}` },
        { status: 400 }
      );
    }

    if (body.articleId) {
      const { data: article, error: articleError } = await supabase
        .from('item_articles')
        .select('id')
        .eq('id', body.articleId)
        .eq('item_id', itemId)
        .single();

      if (articleError || !article) {
        return NextResponse.json(
          { success: false, error: 'Invalid article ID or article does not belong to this item' },
          { status: 400 }
        );
      }
    }

    // Language detection
    const [userPreferredLanguage, accountPreferredLanguage] = await Promise.all([
      getUserPreferredLanguage(supabase, user.id),
      getAccountPreferredLanguage(supabase, accountId)
    ]);

    const sourceLanguage = detectSourceLanguage({
      user: { preferred_language: userPreferredLanguage },
      account: { preferred_language: accountPreferredLanguage },
      override: body.sourceLanguage
    });

    // Create link
    const { data: newLink, error: insertError } = await supabase
      .from('item_links')
      .insert({
        item_id: itemId,
        article_id: body.articleId || null,
        title: body.title.trim(),
        link_type: body.linkType,
        url: body.url,
        thumbnail_url: body.thumbnailUrl || null,
        display_order: body.displayOrder ?? 0,
        source_language: sourceLanguage
      })
      .select()
      .single();

    if (insertError || !newLink) {
      console.error('Link creation error:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create link' },
        { status: 500 }
      );
    }

    console.log('Link created successfully:', newLink.id);

    // Queue translations
    let translationJobIds: string[] = [];
    let translationError: string | undefined;
    let queuedLanguages: SupportedLanguage[] = [];

    try {
      const translationResult = await queueContentTranslations({
        content: {
          entityType: 'link',
          entityId: newLink.id,
          sourceLanguage,
          fields: [
            {
              fieldName: 'title',
              value: newLink.title,
              context: { contentType: 'link_title', domainContext: 'property_rental_media' },
              maxLength: 255
            }
          ]
        },
        trigger: 'create'
      });

      if (translationResult.success) {
        translationJobIds = translationResult.jobIds;
        queuedLanguages = translationResult.queuedLanguages;
        console.log('Translation jobs queued for link:', translationJobIds.length);
      } else {
        translationError = translationResult.error;
        console.error('Translation queuing returned error:', translationError);
      }
    } catch (error) {
      console.error('Translation queuing error:', error);
      translationError = error instanceof Error ? error.message : 'Unknown translation error';
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newLink.id,
        itemId: newLink.item_id,
        articleId: newLink.article_id || undefined,
        title: newLink.title,
        linkType: newLink.link_type,
        url: newLink.url,
        thumbnailUrl: newLink.thumbnail_url || undefined,
        displayOrder: newLink.display_order || 0,
        sourceLanguage: newLink.source_language || undefined,
        createdAt: newLink.created_at
      },
      translationJobIds,
      queuedLanguages,
      ...(translationError && { translationError }),
      accountContext: { accountId, accountRole }
    }, { status: 201 });
  } catch (error) {
    console.error('Links POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

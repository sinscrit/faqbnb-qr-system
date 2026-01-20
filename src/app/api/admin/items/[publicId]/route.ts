import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateItemRequest, ItemResponse } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import { triggerTagTranslation } from '@/lib/content-translation';
import type { QueueTranslationResult } from '@/lib/content-translation/content-translation.types';
import type { SupportedLanguage } from '@/lib/translation-service/translation-service.types';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    console.log('🔑 validateAdminAuth: Starting authentication validation...');
    
    // Use standard Supabase server creation without custom cookie handling
    const supabase = await createSupabaseServer();
    
    // Add current account header to all requests
    const currentAccountId = request.headers.get('x-current-account');
    if (currentAccountId) {
      supabase.headers = {
        ...supabase.headers,
        'x-current-account': currentAccountId
      };
    }
    console.log('🔑 validateAdminAuth: Supabase server client created');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('🔑 validateAdminAuth: Got user from Supabase:', { user: user?.email, error: userError?.message });

    if (userError || !user) {
      console.log('User session not found:', userError?.message);
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Invalid or expired token',
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        )
      };
    }

    if (!user.email) {
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'User email not found in token',
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        )
      };
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .eq('email', user.email)
      .single();

    if (adminError || !adminUser) {
      // If not admin, check if user is a regular user
      const { data: regularUser, error: userError } = await supabase
        .from('users')
        .select('email, full_name, role')
        .eq('id', user.id)
        .single();

      if (userError || !regularUser) {
        console.log('User validation failed:', { 
          userId: user.id, 
          email: user.email, 
          adminError: adminError?.message,
          userError: userError?.message
        });
        return {
          error: NextResponse.json(
            { 
              success: false, 
              error: 'User not found in system',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }

      // Return regular user data
      const validatedUser = {
        id: user.id,
        email: regularUser.email,
        fullName: regularUser.full_name || undefined,
        role: regularUser.role
      };

      console.log('Authentication successful for user:', validatedUser.email);
      return { user: validatedUser, isAdmin: false, supabase };
    }

    // Return admin user data
    const validatedUser = {
      id: user.id,
        email: adminUser.email,
      fullName: adminUser.full_name || undefined,
        role: adminUser.role
    };

    console.log('Authentication successful for admin:', validatedUser.email);
    return { user: validatedUser, isAdmin: adminUser.role === 'admin', supabase };

  } catch (error) {
    console.error('Auth validation error:', error);
    return {
      error: NextResponse.json(
        { 
          success: false, 
          error: 'Authentication validation failed',
          code: 'AUTH_ERROR' 
        },
        { status: 500 }
      )
    };
  }
}

// Helper function to extract account context from request
async function getAccountContext(request: NextRequest, userId: string, isAdmin: boolean, supabase: any) {
  try {
    // Extract account_id from query parameters or headers
    const { searchParams } = new URL(request.url);
    const requestedAccountId = searchParams.get('account_id') || request.headers.get('x-account-id');
    
    if (requestedAccountId) {
      // Validate user has access to the requested account
      const { data: accountAccess, error: accessError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('account_id', requestedAccountId)
        .eq('user_id', userId)
        .single();
        
      if (accessError || !accountAccess) {
        return {
          error: NextResponse.json(
            { 
              success: false, 
              error: 'Access denied to requested account',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }
      
      return { accountId: requestedAccountId, accountRole: accountAccess.role };
    }
    
    // If no specific account requested, get user's default account
    if (isAdmin) {
      // Admin can see all accounts - no specific filtering unless requested
      return { accountId: null, accountRole: 'admin' };
    } else {
      // Regular user: get their primary account
      const { data: userAccounts, error: accountsError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
        
      if (accountsError || !userAccounts) {
        return {
          error: NextResponse.json(
            { 
              success: false, 
              error: 'No account access found for user',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }
      
      return { accountId: userAccounts.account_id, accountRole: userAccounts.role };
    }
  } catch (error) {
    console.error('Account context extraction error:', error);
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Failed to determine account context',
          code: 'ACCOUNT_ERROR'
        },
        { status: 500 }
      )
    };
  }
}

/**
 * Filters out system tags from a tags array.
 * System tags start with '#' (e.g., '#room.kitchen', '#type.appliance')
 * and are pre-seeded with translations, so they don't need dynamic translation.
 *
 * @param tags - Array of tag strings from item
 * @returns Array of user-defined tags only (excluding system tags)
 */
function getUserTags(tags: string[] | undefined | null): string[] {
  if (!tags || tags.length === 0) return [];
  return tags.filter(tag => !tag.startsWith('#'));
}

// Helper function to validate item access within account context
async function validateItemAccess(publicId: string, userId: string, isAdmin: boolean, accountId: string | null, supabaseClient: any) {
  try {
    // Get item with property and account information
    let itemQuery = supabaseClient
      .from('items')
      .select(`
        id, 
        public_id, 
        name, 
        description,
        property_id,
        properties!left(id, nickname, user_id, account_id)
      `)
      .eq('public_id', publicId);

    const { data: item, error: itemError } = await itemQuery.single();

    if (itemError || !item) {
      return {
        canAccess: false,
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Item not found',
            code: 'NOT_FOUND' 
          },
          { status: 404 }
        )
      };
    }

    // Apply account-based access control
    const itemProperty = (item as any).properties;
    
    if (isAdmin && !accountId) {
      // Admin can access any item when no specific account is requested
      return { canAccess: true, item };
    } else if (isAdmin && accountId) {
      // Admin viewing specific account's item
      if (itemProperty.account_id !== accountId) {
        return {
          canAccess: false,
          error: NextResponse.json(
            { 
              success: false, 
              error: 'Item does not belong to the specified account',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }
      return { canAccess: true, item };
    } else {
      // Regular user can only access items within their account and owned by them
      const canAccess = itemProperty.account_id === accountId && 
                       itemProperty.user_id === userId;
      
      if (!canAccess) {
        return {
          canAccess: false,
          error: NextResponse.json(
            { 
              success: false, 
              error: 'Access denied to item within account context',
              code: 'FORBIDDEN' 
            },
            { status: 403 }
          )
        };
      }
      
      return { canAccess: true, item };
    }
  } catch (error) {
    console.error('Item access validation error:', error);
    return {
      canAccess: false,
      error: NextResponse.json(
        { 
          success: false, 
          error: 'Failed to validate item access',
          code: 'VALIDATION_ERROR' 
        },
        { status: 500 }
      )
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    console.log('Admin get item API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    
    console.log('Authentication successful for user:', user.email, 'account:', accountId || 'all');
    
    const { publicId } = await params;
    console.log('Public ID:', publicId);
    
    // Validate publicId format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(publicId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid publicId format' },
        { status: 400 }
      );
    }

    // Validate item access within account context
    const { canAccess, item, error } = await validateItemAccess(publicId, user.id, userIsAdmin, accountId, supabase);
    if (!canAccess || error) {
      return error;
    }
    
    console.log('Item access validated, fetching item details...');

    // Get item with property and links
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select(`
        id,
        public_id,
        name,
        description,
        property_id,
        tags,
        qr_code_url,
        created_at,
        updated_at,
        properties!left(id, nickname, user_id, account_id)
      `)
      .eq('public_id', publicId)
      .single();
      
    if (itemError || !itemData) {
      console.error('Item fetch error:', itemError);
      return NextResponse.json(
        { success: false, error: 'Item not found within account context' },
        { status: 404 }
      );
    }

    // Get item links
    const { data: links, error: linksError } = await supabase
      .from('item_links')
      .select('id, title, link_type, url, thumbnail_url, display_order, created_at')
      .eq('item_id', itemData.id)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('Links fetch error:', linksError);
      // Don't fail the request, just return empty links
    }

    // REQ-151: Fetch articles for this item
    const { data: articles, error: articlesError } = await supabase
      .from('item_articles')
      .select('*')
      .eq('item_id', itemData.id)
      .order('display_order', { ascending: true });

    if (articlesError) {
      console.error('Articles fetch error:', articlesError);
      // Don't fail the request, just log the error
    }

    // REQ-151: For each article, get associated links
    const articlesWithLinks = await Promise.all(
      (articles || []).map(async (article) => {
        const { data: articleLinks } = await supabase
          .from('item_links')
          .select('id, title, link_type, url, thumbnail_url, display_order, created_at')
          .eq('article_id', article.id)
          .order('display_order', { ascending: true });

        return {
          id: article.id,
          itemId: article.item_id,
          purpose: article.purpose,
          title: article.title,
          description: article.description,
          displayOrder: article.display_order || 0,
          createdAt: article.created_at,
          updatedAt: article.updated_at,
          links: (articleLinks || []).map(link => ({
            id: link.id,
            title: link.title,
            linkType: link.link_type,
            url: link.url,
            thumbnailUrl: link.thumbnail_url,
            displayOrder: link.display_order || 0
          }))
        };
      })
    );

    console.log('Item fetched successfully:', itemData.id);

    const response = {
      success: true,
      data: {
        id: itemData.id,
        publicId: itemData.public_id,
        name: itemData.name,
        description: itemData.description,
        property_id: itemData.property_id,
        tags: itemData.tags || [],  // REQ-215: Include tags
        qr_code_url: itemData.qr_code_url,
        created_at: itemData.created_at,
        updated_at: itemData.updated_at,
        property: itemData.properties,
        articles: articlesWithLinks,  // REQ-151: Articles with nested links
        links: links || []  // Keep for backward compatibility
      },
      accountContext: {
        accountId,
        accountRole
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GET /api/admin/items/[publicId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    console.log('Admin update item API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    
    console.log('Authentication successful for user:', user.email, 'account:', accountId || 'all');
    
    const { publicId } = await params;
    console.log('Public ID:', publicId);
    
    // Validate publicId format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(publicId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid publicId format' },
        { status: 400 }
      );
    }

    // Validate item access within account context
    const { canAccess, item, error } = await validateItemAccess(publicId, user.id, userIsAdmin, accountId, supabase);
    if (!canAccess || error) {
      return error;
    }
    
    const body: UpdateItemRequest = await request.json();
    console.log('Request body received');
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
        { status: 400 }
      );
    }
    
    if (!body.propertyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: propertyId' },
        { status: 400 }
      );
    }
    
    // Validate links array structure
    if (body.links && !Array.isArray(body.links)) {
      return NextResponse.json(
        { success: false, error: 'links must be an array' },
        { status: 400 }
      );
    }
    
    // Validate QR code URL if provided
    if (body.qrCodeUrl) {
      try {
        new URL(body.qrCodeUrl);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: `Invalid QR code URL: ${body.qrCodeUrl}` },
          { status: 400 }
        );
      }
    }
    
    // Validate link types and URLs
    const validLinkTypes = ['youtube', 'pdf', 'image', 'text', 'video'];
    for (const link of body.links || []) {
      if (!validLinkTypes.includes(link.linkType)) {
        return NextResponse.json(
          { success: false, error: `Invalid link type: ${link.linkType}` },
          { status: 400 }
        );
      }
      
      try {
        new URL(link.url);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: `Invalid URL: ${link.url}` },
          { status: 400 }
        );
      }
    }

    // REQ-151: Validate article field if provided
    const bodyWithArticle = body as UpdateItemRequest & {
      article?: {
        purpose: string;
        title?: string;
        description?: string;
      }
    };
    if (bodyWithArticle.article) {
      if (!bodyWithArticle.article.purpose || !isValidPurposeType(bodyWithArticle.article.purpose)) {
        return NextResponse.json(
          { success: false, error: 'Invalid or missing article purpose' },
          { status: 400 }
        );
      }
    }

    // Use the authenticated Supabase client from validateAdminAuth
    // Note: 'supabase' is already authenticated from line 427

    // Verify the property exists and belongs to the current account context
    let propertyQuery = supabase
      .from('properties')
      .select('id, account_id, user_id')
      .eq('id', body.propertyId);

    // Apply account filtering
    if (accountId) {
      propertyQuery = propertyQuery.eq('account_id', accountId);
    }

    // For regular users, also check user ownership
    if (!userIsAdmin) {
      propertyQuery = propertyQuery.eq('user_id', user.id);
    }

    const { data: property, error: propertyError } = await propertyQuery.single();

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID, property not found, or property not accessible within current account context' },
        { status: 400 }
      );
    }

    // Additional validation for account context
    if (accountId && property.account_id !== accountId) {
      return NextResponse.json(
        { success: false, error: 'Property does not belong to the specified account' },
        { status: 403 }
      );
    }

    console.log('Property verified within account context, updating item...');

    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({
        name: body.name,
        description: body.description || null,
        property_id: body.propertyId,
        tags: body.tags || [],  // REQ-215: Support tags update
        qr_code_url: body.qrCodeUrl || null,
        qr_code_uploaded_at: body.qrCodeUrl ? new Date().toISOString() : null,
      })
      .eq('public_id', publicId)
      .select()
      .single();
      
    if (updateError || !updatedItem) {
      console.error('Item update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update item within account context' },
        { status: 500 }
      );
    }
    
    console.log('Item updated successfully:', updatedItem.id);
    
    // Delete existing links
    const { error: deleteLinksError } = await supabase
      .from('item_links')
      .delete()
      .eq('item_id', item.id);
      
    if (deleteLinksError) {
      console.error('Links deletion error:', deleteLinksError);
      return NextResponse.json(
        { success: false, error: 'Failed to update links' },
        { status: 500 }
      );
    }
    
    console.log('Existing links deleted');
    
    // Create new links if provided
    const createdLinks = [];
    if (body.links && body.links.length > 0) {
      const linksToInsert = body.links.map((link, index) => ({
        item_id: updatedItem.id,
        title: link.title,
        link_type: link.linkType,
        url: link.url,
        thumbnail_url: link.thumbnailUrl || null,
        display_order: link.displayOrder !== undefined ? link.displayOrder : index,
      }));
      
      const { data: newLinks, error: linksError } = await supabase
        .from('item_links')
        .insert(linksToInsert)
        .select();
        
      if (linksError) {
        console.error('Links creation error:', linksError);
        return NextResponse.json(
          { success: false, error: 'Failed to create links' },
          { status: 500 }
        );
      }
      
      createdLinks.push(...(newLinks || []));
      console.log('New links created successfully:', createdLinks.length);
    }

    // REQ-151: Handle article creation/update if article data provided
    let updatedArticle: any = null;
    if (bodyWithArticle.article) {
      const articleTitle = bodyWithArticle.article.title || generateArticleTitle({
        itemName: body.name,
        purpose: bodyWithArticle.article.purpose as any
      });

      // Check if article with this purpose already exists for this item
      const { data: existingArticle } = await supabase
        .from('item_articles')
        .select('id')
        .eq('item_id', updatedItem.id)
        .eq('purpose', bodyWithArticle.article.purpose)
        .single();

      if (existingArticle) {
        // Update existing article
        const { data: updated, error: updateError } = await supabase
          .from('item_articles')
          .update({
            title: articleTitle,
            description: bodyWithArticle.article.description || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingArticle.id)
          .select()
          .single();

        if (updateError) {
          console.error('Article update error:', updateError);
        } else {
          updatedArticle = updated;
          console.log('Article updated successfully:', updated.id);
        }
      } else {
        // Create new article
        const { data: newArticle, error: articleError } = await supabase
          .from('item_articles')
          .insert({
            item_id: updatedItem.id,
            purpose: bodyWithArticle.article.purpose,
            title: articleTitle,
            description: bodyWithArticle.article.description || null,
            display_order: 0
          })
          .select()
          .single();

        if (articleError) {
          console.error('Article creation error:', articleError);
        } else {
          updatedArticle = newArticle;
          console.log('Article created successfully:', newArticle.id);
        }
      }

      // Associate newly created links with article
      if (updatedArticle && createdLinks.length > 0) {
        const linkIds = createdLinks.map(link => link.id);
        await supabase
          .from('item_links')
          .update({ article_id: updatedArticle.id })
          .in('id', linkIds);
        console.log('Links associated with article:', linkIds.length);
      }
    }

    // ============================================================
    // TAG TRANSLATION (REQ-E03-011)
    // Queue tag translations after item update
    // ============================================================
    const userTags = getUserTags(body.tags);
    if (userTags.length > 0) {
      // Determine source language (from REQ-E03-008 or default to 'en')
      const sourceLanguage: SupportedLanguage = 'en';

      console.log('ITEMS_API: Processing tag translations on update', {
        itemId: updatedItem.id,
        publicId: updatedItem.public_id,
        tagCount: userTags.length,
        tags: userTags,
        sourceLanguage: sourceLanguage,
      });

      // Process tags in parallel, but don't fail item update on tag errors
      try {
        const tagResults = await Promise.allSettled(
          userTags.map(tag => triggerTagTranslation(tag, sourceLanguage))
        );

        // Count successful jobs queued
        const tagJobsQueued = tagResults
          .filter((r): r is PromiseFulfilledResult<QueueTranslationResult> =>
            r.status === 'fulfilled' && r.value.success)
          .reduce((sum, r) => sum + r.value.jobIds.length, 0);

        // Collect any errors
        const tagErrors = tagResults
          .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
          .map(r => r.reason?.message || String(r.reason));

        // Also collect errors from fulfilled but unsuccessful results
        const fulfillmentErrors = tagResults
          .filter((r): r is PromiseFulfilledResult<QueueTranslationResult> =>
            r.status === 'fulfilled' && !r.value.success)
          .map(r => r.value.error || 'Unknown error');

        const allTagErrors = [...tagErrors, ...fulfillmentErrors];

        if (allTagErrors.length > 0) {
          console.error('ITEMS_API: Tag translation errors on update', {
            itemId: updatedItem.id,
            publicId: updatedItem.public_id,
            errors: allTagErrors,
          });
        }

        console.log('ITEMS_API: Tag translation complete on update', {
          itemId: updatedItem.id,
          publicId: updatedItem.public_id,
          tagsProcessed: userTags.length,
          jobsQueued: tagJobsQueued,
          errors: allTagErrors.length,
        });
      } catch (tagTranslationError) {
        // Log but don't fail item update
        console.error('ITEMS_API: Tag translation processing error on update', {
          itemId: updatedItem.id,
          publicId: updatedItem.public_id,
          error: tagTranslationError instanceof Error ? tagTranslationError.message : String(tagTranslationError),
        });
      }
    }
    // ============================================================

    // Transform response to match ItemResponse type
    // REQ-151: Include articles in response
    const response = {
      success: true,
      data: {
        id: updatedItem.id,
        publicId: updatedItem.public_id,
        name: updatedItem.name,
        description: updatedItem.description || '',
        qrCodeUrl: updatedItem.qr_code_url || undefined,
        qrCodeUploadedAt: updatedItem.qr_code_uploaded_at || undefined,
        links: createdLinks.map(link => ({
          id: link.id,
          title: link.title,
          linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
          url: link.url,
          thumbnailUrl: link.thumbnail_url || undefined,
          displayOrder: link.display_order || 0,
        })),
        // REQ-151: Include article if created/updated
        articles: updatedArticle ? [{
          id: updatedArticle.id,
          purpose: updatedArticle.purpose,
          title: updatedArticle.title,
          description: updatedArticle.description,
          displayOrder: updatedArticle.display_order || 0,
          createdAt: updatedArticle.created_at,
          updatedAt: updatedArticle.updated_at,
          links: createdLinks.map(link => ({
            id: link.id,
            title: link.title,
            linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
            url: link.url,
            thumbnailUrl: link.thumbnail_url || undefined,
            displayOrder: link.display_order || 0,
          }))
        }] : [],
      },
      accountContext: {
        accountId,
        accountRole
      }
    };
    
    console.log(`Item updated by: ${user.email}, account: ${accountId || 'all'}, item: ${updatedItem.name} (${updatedItem.public_id})`);
    
    console.log('Item update completed successfully');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    console.log('Admin delete item API called - validating authentication...');
    
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    
    console.log('Authentication successful for user:', user.email, 'account:', accountId || 'all');
    
    const { publicId } = await params;
    console.log('Public ID to delete:', publicId);
    
    // Validate publicId format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(publicId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid publicId format' },
        { status: 400 }
      );
    }
    
    // Validate item access within account context
    const { canAccess, item, error } = await validateItemAccess(publicId, user.id, userIsAdmin, accountId, supabase);
    if (!canAccess || error) {
      return error;
    }
    
    console.log('Item found and access validated, proceeding with deletion...');
    
    // Count associated links before deletion for verification
    const { count: linkCount, error: linkCountError } = await supabase
      .from('item_links')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', item.id);
      
    if (linkCountError) {
      console.error('Link count error:', linkCountError);
    } else {
      console.log('Links to be cascade deleted:', linkCount || 0);
    }
    
    // Delete the item (CASCADE will automatically delete associated links)
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('public_id', publicId);
      
    if (deleteError) {
      console.error('Item deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete item within account context' },
        { status: 500 }
      );
    }
    
    // Verify the item was actually deleted
    const { data: verifyItem, error: verifyError } = await supabase
      .from('items')
      .select('id')
      .eq('public_id', publicId)
      .single();
      
    if (!verifyError && verifyItem) {
      console.error('Item still exists after deletion attempt');
      return NextResponse.json(
        { success: false, error: 'Failed to delete item' },
        { status: 500 }
      );
    }
    
    // Verify associated links were cascade deleted
    const { count: remainingLinks, error: linksVerifyError } = await supabase
      .from('item_links')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', item.id);
      
    if (linksVerifyError) {
      console.error('Links verification error:', linksVerifyError);
    } else {
      console.log('Remaining links after deletion:', remainingLinks || 0);
      if ((remainingLinks || 0) > 0) {
        console.warn('Warning: Some links may not have been cascade deleted');
      }
    }
    
    console.log(`Item deleted by: ${user.email}, account: ${accountId || 'all'}, item: ${item.name} (${publicId}), deleted links: ${linkCount || 0}`);
    
    console.log('Item deletion completed successfully');
    
    return NextResponse.json({
      success: true,
      message: `Item "${item.name}" and its ${linkCount || 0} associated links have been deleted successfully`,
      deletedItem: {
        publicId,
        name: item.name,
        deletedLinks: linkCount || 0,
      },
      accountContext: {
        accountId,
        accountRole
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
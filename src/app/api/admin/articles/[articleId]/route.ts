/**
 * REQ-151: Single Article CRUD Endpoints
 * Created: 2026-01-10
 *
 * GET /api/admin/articles/[articleId] - Get single article with nested links
 * PUT /api/admin/articles/[articleId] - Update article
 * DELETE /api/admin/articles/[articleId] - Delete article
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import { UpdateArticleRequest, ArticleResponse, PurposeType, LinkType } from '@/types';

// Helper function to extract account context from request
async function getAccountContext(request: NextRequest, userId: string, isAdmin: boolean, supabase: any) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedAccountId = searchParams.get('account_id') || request.headers.get('x-account-id');

    if (requestedAccountId) {
      const { data: accountAccess, error: accessError } = await supabase
        .from('account_users')
        .select('account_id, role')
        .eq('account_id', requestedAccountId)
        .eq('user_id', userId)
        .single();

      if (accessError || !accountAccess) {
        return {
          error: NextResponse.json(
            { success: false, error: 'Access denied to requested account', code: 'FORBIDDEN' },
            { status: 403 }
          )
        };
      }

      return { accountId: requestedAccountId, accountRole: accountAccess.role };
    }

    if (isAdmin) {
      return { accountId: null, accountRole: 'admin' };
    } else {
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
            { success: false, error: 'No account access found for user', code: 'FORBIDDEN' },
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
        { success: false, error: 'Failed to determine account context', code: 'ACCOUNT_ERROR' },
        { status: 500 }
      )
    };
  }
}

// Helper function to validate article access
async function validateArticleAccess(articleId: string, userId: string, isAdmin: boolean, accountId: string | null, supabase: any) {
  // Fetch article with item and property info
  const { data: article, error: articleError } = await supabase
    .from('item_articles')
    .select(`
      id,
      item_id,
      purpose,
      title,
      description,
      display_order,
      created_at,
      updated_at,
      items!inner(
        id,
        name,
        property_id,
        properties!inner(account_id, user_id)
      )
    `)
    .eq('id', articleId)
    .single();

  if (articleError || !article) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    };
  }

  // Check account access
  const itemProperty = (article as any).items.properties;
  if (!isAdmin && itemProperty.account_id !== accountId) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Access denied to article' },
        { status: 403 }
      )
    };
  }

  return { article, itemName: (article as any).items.name };
}

// GET /api/admin/articles/[articleId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    console.log('Admin get article API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    const { articleId } = await params;

    // Validate UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(articleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid articleId format' },
        { status: 400 }
      );
    }

    // Validate access
    const accessResult = await validateArticleAccess(articleId, user.id, userIsAdmin, accountId, supabase);
    if (accessResult.error) {
      return accessResult.error;
    }

    const { article } = accessResult;

    // REQ-213: Extract item data from the joined query result
    const itemData = (article as any).items;

    // Get associated links
    const { data: articleLinks } = await supabase
      .from('item_links')
      .select('id, title, link_type, url, thumbnail_url, display_order, created_at')
      .eq('article_id', article.id)
      .order('display_order', { ascending: true });

    // REQ-213: Get item tags for edit mode
    let itemTags: string[] = [];
    if (itemData?.id) {
      const { data: fullItem } = await supabase
        .from('items')
        .select('tags')
        .eq('id', itemData.id)
        .single();
      itemTags = fullItem?.tags || [];
    }

    const response: ArticleResponse = {
      success: true,
      data: {
        id: article.id,
        itemId: article.item_id,
        purpose: article.purpose as PurposeType,
        title: article.title || '',
        description: article.description || null,
        displayOrder: article.display_order || 0,
        createdAt: article.created_at || '',
        updatedAt: article.updated_at || '',
        links: (articleLinks || []).map(link => ({
          id: link.id,
          item_id: article.item_id,
          article_id: article.id,
          title: link.title,
          link_type: link.link_type as LinkType,
          url: link.url,
          thumbnail_url: link.thumbnail_url,
          display_order: link.display_order || 0,
          created_at: link.created_at || new Date().toISOString()
        })),
        // REQ-213: Include item data for edit mode
        item: itemData ? {
          id: itemData.id,
          name: itemData.name,
          tags: itemTags
        } : undefined
      },
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles/[articleId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    console.log('Admin update article API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    const { articleId } = await params;

    // Validate UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(articleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid articleId format' },
        { status: 400 }
      );
    }

    // Validate access
    const accessResult = await validateArticleAccess(articleId, user.id, userIsAdmin, accountId, supabase);
    if (accessResult.error) {
      return accessResult.error;
    }

    const { article, itemName } = accessResult;

    const body: UpdateArticleRequest = await request.json();

    // Validate purpose if provided
    if (body.purpose && !isValidPurposeType(body.purpose)) {
      return NextResponse.json(
        { success: false, error: 'Invalid purpose type' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (body.purpose !== undefined) {
      updateData.purpose = body.purpose;
    }
    if (body.title !== undefined) {
      updateData.title = body.title;
    } else if (body.purpose && body.purpose !== article.purpose) {
      // Auto-regenerate title if purpose changed and no new title provided
      updateData.title = generateArticleTitle({
        itemName: itemName,
        purpose: body.purpose
      });
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.displayOrder !== undefined) {
      updateData.display_order = body.displayOrder;
    }

    // Update article
    const { data: updatedArticle, error: updateError } = await supabase
      .from('item_articles')
      .update(updateData)
      .eq('id', articleId)
      .select()
      .single();

    if (updateError) {
      console.error('Article update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update article' },
        { status: 500 }
      );
    }

    // Handle item tags update if provided (REQ-214)
    if (body.itemTags !== undefined) {
      const { error: tagsError } = await supabase
        .from('items')
        .update({
          tags: body.itemTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.item_id);

      if (tagsError) {
        console.error('Failed to update item tags:', tagsError);
        // Non-blocking: article was saved, tags update failed
        // Could add warning to response in future
      } else {
        console.log('Item tags updated successfully for item:', article.item_id);
      }
    }

    // Handle links updates if provided
    if (body.links !== undefined) {
      // Get existing links
      const { data: existingLinks } = await supabase
        .from('item_links')
        .select('id')
        .eq('article_id', articleId);

      const existingLinkIds = new Set((existingLinks || []).map(l => l.id));
      const updatedLinkIds = new Set(body.links.filter(l => l.id).map(l => l.id!));

      // Delete removed links
      const linksToDelete = Array.from(existingLinkIds).filter(id => !updatedLinkIds.has(id));
      if (linksToDelete.length > 0) {
        await supabase
          .from('item_links')
          .delete()
          .in('id', linksToDelete);
      }

      // Process each link in the request
      for (const link of body.links) {
        if (link.id && existingLinkIds.has(link.id)) {
          // Update existing link
          await supabase
            .from('item_links')
            .update({
              title: link.title,
              link_type: link.linkType,
              url: link.url,
              thumbnail_url: link.thumbnailUrl,
              display_order: link.displayOrder,
            })
            .eq('id', link.id);
        } else {
          // Insert new link
          await supabase
            .from('item_links')
            .insert({
              item_id: article.item_id,
              article_id: articleId,
              title: link.title,
              link_type: link.linkType,
              url: link.url,
              thumbnail_url: link.thumbnailUrl,
              display_order: link.displayOrder,
            });
        }
      }
    }

    // Get associated links for response
    const { data: articleLinks } = await supabase
      .from('item_links')
      .select('id, title, link_type, url, thumbnail_url, display_order, created_at')
      .eq('article_id', updatedArticle.id)
      .order('display_order', { ascending: true });

    console.log('Article updated successfully:', updatedArticle.id);

    const response: ArticleResponse = {
      success: true,
      data: {
        id: updatedArticle.id,
        itemId: updatedArticle.item_id,
        purpose: updatedArticle.purpose as PurposeType,
        title: updatedArticle.title || '',
        description: updatedArticle.description || null,
        displayOrder: updatedArticle.display_order || 0,
        createdAt: updatedArticle.created_at || '',
        updatedAt: updatedArticle.updated_at || '',
        links: (articleLinks || []).map(link => ({
          id: link.id,
          item_id: updatedArticle.item_id,
          article_id: updatedArticle.id,
          title: link.title,
          link_type: link.link_type as LinkType,
          url: link.url,
          thumbnail_url: link.thumbnail_url,
          display_order: link.display_order || 0,
          created_at: link.created_at || new Date().toISOString()
        }))
      },
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/[articleId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    console.log('Admin delete article API called - validating authentication...');

    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase;

    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    const { articleId } = await params;

    // Validate UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(articleId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid articleId format' },
        { status: 400 }
      );
    }

    // Validate access
    const accessResult = await validateArticleAccess(articleId, user.id, userIsAdmin, accountId, supabase);
    if (accessResult.error) {
      return accessResult.error;
    }

    const { article } = accessResult;

    // Set article_id to NULL on associated links (instead of deleting them)
    const { error: linksUpdateError } = await supabase
      .from('item_links')
      .update({ article_id: null })
      .eq('article_id', articleId);

    if (linksUpdateError) {
      console.error('Failed to disassociate links:', linksUpdateError);
    }

    // Delete article
    const { error: deleteError } = await supabase
      .from('item_articles')
      .delete()
      .eq('id', articleId);

    if (deleteError) {
      console.error('Article deletion error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete article' },
        { status: 500 }
      );
    }

    console.log(`Article deleted by: ${user.email}, articleId: ${articleId}`);

    return NextResponse.json({
      success: true,
      message: `Article "${article.title}" has been deleted successfully`,
      deletedArticle: {
        id: article.id,
        title: article.title,
        purpose: article.purpose
      },
      accountContext: { accountId, accountRole }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

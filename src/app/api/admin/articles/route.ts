/**
 * REQ-151: Articles API Endpoints
 * Created: 2026-01-10
 *
 * GET /api/admin/articles?item_id=xxx - List articles for an item
 * POST /api/admin/articles - Create a new article
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/auth-server';
import { generateArticleTitle, isValidPurposeType } from '@/lib/titleGenerator';
import { CreateArticleRequest, ArticlesListResponse, ArticleResponse } from '@/types';

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

// GET /api/admin/articles?item_id=xxx
export async function GET(request: NextRequest) {
  try {
    console.log('Admin articles list API called - validating authentication...');

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

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: item_id' },
        { status: 400 }
      );
    }

    // Validate item belongs to user's account
    let itemQuery = supabase
      .from('items')
      .select('id, property_id, properties!left(account_id, user_id)')
      .eq('id', itemId);

    const { data: item, error: itemError } = await itemQuery.single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check account access
    const itemProperty = (item as any).properties;
    if (!userIsAdmin && itemProperty.account_id !== accountId) {
      return NextResponse.json(
        { success: false, error: 'Access denied to item' },
        { status: 403 }
      );
    }

    // Fetch articles for item
    const { data: articles, error: articlesError } = await supabase
      .from('item_articles')
      .select('*')
      .eq('item_id', itemId)
      .order('display_order', { ascending: true });

    if (articlesError) {
      console.error('Articles fetch error:', articlesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    // For each article, get associated links
    const articlesWithLinks = await Promise.all(
      (articles || []).map(async (article) => {
        const { data: articleLinks } = await supabase
          .from('item_links')
          .select('id, title, link_type, url, thumbnail_url, display_order')
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

    const response: ArticlesListResponse = {
      success: true,
      data: articlesWithLinks,
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

// POST /api/admin/articles
export async function POST(request: NextRequest) {
  try {
    console.log('Admin create article API called - validating authentication...');

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

    const body: CreateArticleRequest = await request.json();

    // Validate required fields
    if (!body.itemId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: itemId' },
        { status: 400 }
      );
    }

    if (!body.purpose || !isValidPurposeType(body.purpose)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing purpose' },
        { status: 400 }
      );
    }

    // Validate item belongs to user's account
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('id, name, property_id, properties!left(account_id, user_id)')
      .eq('id', body.itemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check account access
    const itemProperty = (item as any).properties;
    if (!userIsAdmin && itemProperty.account_id !== accountId) {
      return NextResponse.json(
        { success: false, error: 'Access denied to item' },
        { status: 403 }
      );
    }

    // Auto-generate title if not provided
    const articleTitle = body.title || generateArticleTitle({
      itemName: item.name,
      purpose: body.purpose
    });

    // Get max display order
    const { data: maxOrderResult } = await supabase
      .from('item_articles')
      .select('display_order')
      .eq('item_id', body.itemId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextDisplayOrder = body.displayOrder ?? ((maxOrderResult?.display_order || 0) + 1);

    // Create article
    const { data: newArticle, error: articleError } = await supabase
      .from('item_articles')
      .insert({
        item_id: body.itemId,
        purpose: body.purpose,
        title: articleTitle,
        description: body.description || null,
        display_order: nextDisplayOrder
      })
      .select()
      .single();

    if (articleError) {
      console.error('Article creation error:', articleError);
      return NextResponse.json(
        { success: false, error: 'Failed to create article' },
        { status: 500 }
      );
    }

    console.log('Article created successfully:', newArticle.id);

    const response: ArticleResponse = {
      success: true,
      data: {
        id: newArticle.id,
        itemId: newArticle.item_id,
        purpose: newArticle.purpose,
        title: newArticle.title,
        description: newArticle.description,
        displayOrder: newArticle.display_order || 0,
        createdAt: newArticle.created_at,
        updatedAt: newArticle.updated_at,
        links: []
      },
      accountContext: { accountId, accountRole }
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

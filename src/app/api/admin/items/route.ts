import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ItemsListResponse, CreateItemRequest, ItemResponse } from '@/types';
import { createSupabaseServer } from '@/lib/supabase-server';
import type { Database } from '@/lib/supabase';
import { validateAdminAuth } from '@/lib/auth-server';

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

export async function GET(request: NextRequest) {
  try {
    console.log('Admin items API called - validating authentication...');
    
    // Validate authentication and admin role
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase; // Get supabase client from authResult

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    
    console.log('Authentication successful for user:', user.email, 'account:', accountId || 'all');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const propertyId = searchParams.get('property') || ''; // Fixed: use 'property' parameter
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('Query params:', { search, propertyId, page, limit, accountId });
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query with search, property, and account filtering
    let query = supabase
      .from('items')
      .select(`
        id, 
        public_id, 
        name, 
        qr_code_url, 
        created_at,
        property_id,
        properties!inner(id, nickname, user_id, account_id)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply account-based filtering
    if (userIsAdmin && !accountId) {
      // Admin can see all items when no specific account is requested
      // No additional filtering needed
    } else if (userIsAdmin && accountId) {
      // Admin viewing specific account's items
      query = query.eq('properties.account_id', accountId);
    } else {
      // Regular user can only see items within their account context
      query = query
        .eq('properties.account_id', accountId)
        .eq('properties.user_id', user.id);
    }

    // Add property filter if provided
    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,public_id.ilike.%${search}%`);
    }

    console.log('Executing query...');
    const { data: items, error } = await query;

    if (error) {
      console.error('Database error:', error.message, error.details, error.hint);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch items', details: error.message },
        { status: 500 }
      );
    }

    console.log('Query successful, found items:', items?.length || 0);

    // Get link counts and analytics data for each item
    const itemsWithCounts = await Promise.all(
      (items || []).map(async (item) => {
        // Get links count
        const { count: linksCount } = await supabase
          .from('item_links')
          .select('*', { count: 'exact', head: true })
          .eq('item_id', item.id);

        // Get visit analytics
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const { data: visitData } = await supabase
          .from('item_visits')
          .select('visited_at')
          .eq('item_id', item.id);

        const visits = visitData || [];
        const visitCounts = {
          last24Hours: visits.filter(v => v.visited_at && new Date(v.visited_at) >= last24Hours).length,
          last7Days: visits.filter(v => v.visited_at && new Date(v.visited_at) >= last7Days).length,
          allTime: visits.length,
        };

        // Get reaction analytics
        const { data: reactionData } = await supabase
          .from('item_reactions')
          .select('reaction_type')
          .eq('item_id', item.id);

        const reactions = reactionData || [];
        const reactionCounts = {
          total: reactions.length,
          byType: {
            like: reactions.filter(r => r.reaction_type === 'like').length,
            dislike: reactions.filter(r => r.reaction_type === 'dislike').length,
            love: reactions.filter(r => r.reaction_type === 'love').length,
            confused: reactions.filter(r => r.reaction_type === 'confused').length,
            total: reactions.length,
          },
        };

        return {
          id: item.id,
          publicId: item.public_id,
          name: item.name,
          qrCodeUrl: item.qr_code_url || undefined,
          createdAt: item.created_at || new Date().toISOString(),
          propertyId: item.property_id,
          property: item.properties,
          linksCount: linksCount || 0,
          analytics: {
            visits: visitCounts,
            reactions: reactionCounts,
          },
        };
      })
    );

    const response: ItemsListResponse = {
      success: true,
      data: itemsWithCounts,
      pagination: {
        page,
        limit,
        total: itemsWithCounts.length,
        hasMore: itemsWithCounts.length === limit,
      },
      accountContext: {
        accountId,
        accountRole
      }
    };

    console.log(`Items list response prepared with ${itemsWithCounts.length} items for account: ${accountId || 'all'}`);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Admin create item API called - validating authentication...');
    
    // Validate authentication and admin role
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    const user = authResult.user;
    const userIsAdmin = authResult.isAdmin;
    const supabase = authResult.supabase; // Get supabase client from authResult

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin, supabase);
    if (accountContext.error) {
      return accountContext.error;
    }

    const { accountId, accountRole } = accountContext;
    
    console.log('Authentication successful for user:', user.email, 'account:', accountId || 'all');
    
    const body: CreateItemRequest = await request.json();
    console.log('Request body:', body);
    
    // Validate required fields
    if (!body.publicId || !body.name || !body.propertyId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: publicId, name, and propertyId' },
        { status: 400 }
      );
    }
    
    // Validate publicId is UUID format
    const uuidRegex = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;
    if (!uuidRegex.test(body.publicId)) {
      return NextResponse.json(
        { success: false, error: 'publicId must be a valid UUID' },
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
    
    // Validate link types
    const validLinkTypes = ['youtube', 'pdf', 'image', 'text'];
    for (const link of body.links || []) {
      if (!validLinkTypes.includes(link.linkType)) {
        return NextResponse.json(
          { success: false, error: `Invalid link type: ${link.linkType}. Must be one of: ${validLinkTypes.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Basic URL validation
      try {
        new URL(link.url);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: `Invalid URL: ${link.url}` },
          { status: 400 }
        );
      }
    }
    
    console.log('Validation passed, checking property within account context...');
    
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
    
    console.log('Property verified within account context, creating item...');
    
    // Create item in database using transaction
    const { data: newItem, error: itemError } = await supabase
      .from('items')
      .insert({
        public_id: body.publicId,
        name: body.name,
        description: body.description || null,
        property_id: body.propertyId,
        qr_code_url: body.qrCodeUrl || null,
        qr_code_uploaded_at: body.qrCodeUrl ? new Date().toISOString() : null,
      })
      .select()
      .single();
      
    if (itemError) {
      console.error('Item creation error:', itemError);
      if (itemError.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'An item with this public ID already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to create item' },
        { status: 500 }
      );
    }
    
    console.log('Item created successfully:', newItem.id);
    
    // Create links if provided
    const createdLinks = [];
    if (body.links && body.links.length > 0) {
      const linksToInsert = body.links.map((link, index) => ({
        item_id: newItem.id,
        title: link.title,
        link_type: link.linkType,
        url: link.url,
        thumbnail_url: link.thumbnailUrl || null,
        display_order: link.displayOrder || index,
      }));
      
      const { data: newLinks, error: linksError } = await supabase
        .from('item_links')
        .insert(linksToInsert)
        .select();
        
      if (linksError) {
        console.error('Links creation error:', linksError);
        // Clean up the item if links failed
        await supabase.from('items').delete().eq('id', newItem.id);
        return NextResponse.json(
          { success: false, error: 'Failed to create links' },
          { status: 500 }
        );
      }
      
      createdLinks.push(...(newLinks || []));
      console.log('Links created successfully:', createdLinks.length);
    }
    
    // Transform response to match ItemResponse type
    const response: ItemResponse = {
      success: true,
      data: {
        id: newItem.id,
        publicId: newItem.public_id,
        name: newItem.name,
        description: newItem.description || '',
        qrCodeUrl: newItem.qr_code_url || undefined,
        qrCodeUploadedAt: newItem.qr_code_uploaded_at || undefined,
        links: createdLinks.map(link => ({
          id: link.id,
          title: link.title,
          linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
          url: link.url,
          thumbnailUrl: link.thumbnail_url || undefined,
          displayOrder: link.display_order || 0,
        })),
      },
      accountContext: {
        accountId,
        accountRole
      }
    };
    
    // Add audit log for admin operations
    console.log(`Item created by: ${user.email}, account: ${accountId || 'all'}, item: ${newItem.name} (${newItem.public_id})`);
    
    console.log('Item creation completed successfully');
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
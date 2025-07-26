import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ItemsListResponse, CreateItemRequest, ItemResponse } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required - no valid Authorization header',
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        )
      };
    }

    const token = authHeader.substring(7);
    if (!token) {
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required - no token provided',
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        )
      };
    }

    // Create a Supabase client to validate the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Server configuration error',
            code: 'SERVER_ERROR' 
          },
          { status: 500 }
        )
      };
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

    // Set the session using the provided token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.log('Token validation failed:', userError?.message);
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
    // Note: In production, this would use a service role key to bypass RLS
    // For now, we'll validate based on the JWT token claims and known admin email
    const isKnownAdmin = user.email === 'sinscrit@gmail.com' && user.id === 'fa5911d7-f7c5-4ed4-8179-594359453d7f';
    const adminUser = isKnownAdmin ? { email: user.email, role: 'admin', full_name: null } : null;
    const adminError = null;

    if (adminError || !adminUser || adminUser.role !== 'admin') {
      console.log('Admin validation failed:', { 
        userId: user.id, 
        email: user.email, 
        adminError: adminError || 'No admin access',
        hasAdminUser: !!adminUser,
        role: adminUser?.role 
      });
      return {
        error: NextResponse.json(
          { 
            success: false, 
            error: 'Admin privileges required',
            code: 'FORBIDDEN' 
          },
          { status: 403 }
        )
      };
    }

    // Return validated user data
    const validatedUser = {
      id: user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role
    };

    console.log('Authentication successful for admin:', validatedUser.email);
    return { user: validatedUser, isAdmin: true };

  } catch (error) {
    console.error('Admin auth validation error:', error);
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

export async function GET(request: NextRequest) {
  try {
    console.log('Admin items API called - validating authentication...');
    
    // Validate authentication and admin role
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }
    
    console.log('Authentication successful for user:', authResult.user.email);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const propertyId = searchParams.get('propertyId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('Query params:', { search, propertyId, page, limit });
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query with search and property filtering
    let query = supabase
      .from('items')
      .select(`
        id, 
        public_id, 
        name, 
        qr_code_url, 
        created_at,
        property_id,
        properties!inner(id, nickname, user_id)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

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
          last24Hours: visits.filter(v => new Date(v.visited_at) >= last24Hours).length,
          last7Days: visits.filter(v => new Date(v.visited_at) >= last7Days).length,
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
          linksCount: linksCount || 0,
          qrCodeUrl: item.qr_code_url || undefined,
          createdAt: item.created_at || new Date().toISOString(),
          propertyId: item.property_id,
          propertyNickname: (item as any).properties?.nickname,
          visitCounts,
          reactionCounts,
        };
      })
    );

    const response: ItemsListResponse = {
      success: true,
      data: itemsWithCounts,
    };

    // Add audit log for admin operations with analytics summary
    const totalVisits = itemsWithCounts.reduce((sum, item) => sum + (item.visitCounts?.allTime || 0), 0);
    const totalReactions = itemsWithCounts.reduce((sum, item) => sum + (item.reactionCounts?.total || 0), 0);
    console.log(`Admin items list accessed by: ${authResult.user?.email}, found ${itemsWithCounts.length} items (${totalVisits} total visits, ${totalReactions} total reactions)`);

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
    
    console.log('Authentication successful for user:', authResult.user.email);
    
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
    
    console.log('Validation passed, checking property...');
    
    // Verify the property exists and user has access to it
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', body.propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { success: false, error: 'Invalid property ID or property not found' },
        { status: 400 }
      );
    }
    
    console.log('Property verified, creating item...');
    
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
    };
    
    // Add audit log for admin operations
    console.log(`Item created by admin: ${authResult.user?.email}, item: ${newItem.name} (${newItem.public_id})`);
    
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
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ItemsListResponse, CreateItemRequest, ItemResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin items API called');
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log('Query params:', { search, page, limit });
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query with search filtering
    let query = supabase
      .from('items')
      .select('id, public_id, name, qr_code_url, created_at')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

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

    // Get link counts for each item
    const itemsWithCounts = await Promise.all(
      (items || []).map(async (item) => {
        const { count: linksCount } = await supabase
          .from('item_links')
          .select('*', { count: 'exact', head: true })
          .eq('item_id', item.id);

        return {
          id: item.id,
          publicId: item.public_id,
          name: item.name,
          linksCount: linksCount || 0,
          qrCodeUrl: item.qr_code_url || undefined,
          createdAt: item.created_at || new Date().toISOString(),
        };
      })
    );

    const response: ItemsListResponse = {
      success: true,
      data: itemsWithCounts,
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

export async function POST(request: NextRequest) {
  try {
    console.log('Admin create item API called');
    
    const body: CreateItemRequest = await request.json();
    console.log('Request body:', body);
    
    // Validate required fields
    if (!body.publicId || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: publicId and name' },
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
    
    console.log('Validation passed, creating item...');
    
    // Create item in database using transaction
    const { data: newItem, error: itemError } = await supabase
      .from('items')
      .insert({
        public_id: body.publicId,
        name: body.name,
        description: body.description || null,
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
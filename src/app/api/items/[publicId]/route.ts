import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Fetch item with its links from Supabase
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*')
      .eq('public_id', publicId)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    // Fetch links for this item
    const { data: links, error: linksError } = await supabase
      .from('item_links')
      .select('*')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });

    if (linksError) {
      console.error('Error fetching links:', linksError);
      return NextResponse.json(
        { success: false, error: 'Error fetching item links' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const itemWithLinks = {
      id: item.id,
      publicId: item.public_id,
      name: item.name,
      description: item.description,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      links: (links || []).map(link => ({
        id: link.id,
        title: link.title,
        linkType: link.link_type,
        url: link.url,
        thumbnailUrl: link.thumbnail_url,
        displayOrder: link.display_order,
        createdAt: link.created_at,
      })),
    };

    return NextResponse.json({
      success: true,
      data: itemWithLinks,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
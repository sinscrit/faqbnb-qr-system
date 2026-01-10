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

    // REQ-151: Fetch articles for this item
    const { data: articles, error: articlesError } = await supabase
      .from('item_articles')
      .select('*')
      .eq('item_id', item.id)
      .order('display_order', { ascending: true });

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      // Don't fail, continue without articles
    }

    // REQ-151: Build articles with nested links
    const articlesWithLinks = await Promise.all(
      (articles || []).map(async (article) => {
        const { data: articleLinks } = await supabase
          .from('item_links')
          .select('*')
          .eq('article_id', article.id)
          .order('display_order', { ascending: true });

        return {
          id: article.id,
          purpose: article.purpose,
          title: article.title,
          description: article.description,
          displayOrder: article.display_order || 0,
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

    // Transform the data to match the expected format
    const itemWithLinks = {
      id: item.id,
      publicId: item.public_id,
      name: item.name,
      description: item.description,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      articles: articlesWithLinks,  // REQ-151: Articles with nested links
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
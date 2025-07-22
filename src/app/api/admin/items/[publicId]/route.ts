import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateItemRequest, ItemResponse } from '@/types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    console.log('Admin update item API called');
    
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
    
    const body: UpdateItemRequest = await request.json();
    console.log('Request body received');
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
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
    const validLinkTypes = ['youtube', 'pdf', 'image', 'text'];
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
    
    // Check if item exists
    const { data: existingItem, error: itemLookupError } = await supabase
      .from('items')
      .select('id, name, description')
      .eq('public_id', publicId)
      .single();
      
    if (itemLookupError || !existingItem) {
      console.error('Item lookup error:', itemLookupError);
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }
    
    console.log('Item found, updating...');
    
    // Update item basic info
    const updateData: {
      name: string;
      description: string | null;
      updated_at: string;
      qr_code_url?: string | null;
      qr_code_uploaded_at?: string | null;
    } = {
      name: body.name,
      description: body.description || null,
      updated_at: new Date().toISOString(),
    };
    
    // Update QR code URL if provided or explicitly set to null
    if (body.qrCodeUrl !== undefined) {
      updateData.qr_code_url = body.qrCodeUrl || null;
      updateData.qr_code_uploaded_at = body.qrCodeUrl ? new Date().toISOString() : null;
    }
    
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update(updateData)
      .eq('public_id', publicId)
      .select()
      .single();
      
    if (updateError) {
      console.error('Item update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update item' },
        { status: 500 }
      );
    }
    
    console.log('Item updated successfully');
    
    // Get current links from database
    const { data: currentLinks, error: linksError } = await supabase
      .from('item_links')
      .select('*')
      .eq('item_id', existingItem.id);
      
    if (linksError) {
      console.error('Links fetch error:', linksError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch current links' },
        { status: 500 }
      );
    }
    
    // Process links updates
    const newLinks = body.links || [];
    const currentLinkIds = (currentLinks || []).map(link => link.id);
    const newLinkIds = newLinks.filter(link => link.id).map(link => link.id);
    
    // Delete removed links
    const linksToDelete = currentLinkIds.filter(id => !newLinkIds.includes(id));
    if (linksToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('item_links')
        .delete()
        .in('id', linksToDelete);
        
      if (deleteError) {
        console.error('Links delete error:', deleteError);
        return NextResponse.json(
          { success: false, error: 'Failed to delete links' },
          { status: 500 }
        );
      }
      console.log('Deleted links:', linksToDelete.length);
    }
    
    // Update existing links and create new ones
    const finalLinks = [];
    
    for (let index = 0; index < newLinks.length; index++) {
      const link = newLinks[index];
      
      if (link.id) {
        // Update existing link
        const { data: updatedLink, error: linkUpdateError } = await supabase
          .from('item_links')
          .update({
            title: link.title,
            link_type: link.linkType,
            url: link.url,
            thumbnail_url: link.thumbnailUrl || null,
            display_order: link.displayOrder || index,
          })
          .eq('id', link.id)
          .select()
          .single();
          
        if (linkUpdateError) {
          console.error('Link update error:', linkUpdateError);
          return NextResponse.json(
            { success: false, error: 'Failed to update link' },
            { status: 500 }
          );
        }
        
        finalLinks.push(updatedLink);
      } else {
        // Create new link
        const { data: newLink, error: linkCreateError } = await supabase
          .from('item_links')
          .insert({
            item_id: existingItem.id,
            title: link.title,
            link_type: link.linkType,
            url: link.url,
            thumbnail_url: link.thumbnailUrl || null,
            display_order: link.displayOrder || index,
          })
          .select()
          .single();
          
        if (linkCreateError) {
          console.error('Link create error:', linkCreateError);
          return NextResponse.json(
            { success: false, error: 'Failed to create new link' },
            { status: 500 }
          );
        }
        
        finalLinks.push(newLink);
      }
    }
    
    console.log('Links processed successfully:', finalLinks.length);
    
    // Transform response to match ItemResponse type
    const response: ItemResponse = {
      success: true,
      data: {
        id: updatedItem.id,
        publicId: updatedItem.public_id,
        name: updatedItem.name,
        description: updatedItem.description || '',
        qrCodeUrl: updatedItem.qr_code_url || undefined,
        qrCodeUploadedAt: updatedItem.qr_code_uploaded_at || undefined,
        links: finalLinks
          .sort((a, b) => a.display_order - b.display_order)
          .map(link => ({
            id: link.id,
            title: link.title,
            linkType: link.link_type as 'youtube' | 'pdf' | 'image' | 'text',
            url: link.url,
            thumbnailUrl: link.thumbnail_url || undefined,
            displayOrder: link.display_order,
          })),
      },
    };
    
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
    console.log('Admin delete item API called');
    
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
    
    // Check if item exists before deletion
    const { data: existingItem, error: itemLookupError } = await supabase
      .from('items')
      .select('id, name')
      .eq('public_id', publicId)
      .single();
      
    if (itemLookupError || !existingItem) {
      console.error('Item lookup error:', itemLookupError);
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }
    
    console.log('Item found, proceeding with deletion...');
    
    // Count associated links before deletion for verification
    const { count: linkCount, error: linkCountError } = await supabase
      .from('item_links')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', existingItem.id);
      
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
        { success: false, error: 'Failed to delete item' },
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
      .eq('item_id', existingItem.id);
      
    if (linksVerifyError) {
      console.error('Links verification error:', linksVerifyError);
    } else {
      console.log('Remaining links after deletion:', remainingLinks || 0);
      if ((remainingLinks || 0) > 0) {
        console.warn('Warning: Some links may not have been cascade deleted');
      }
    }
    
    console.log('Item deletion completed successfully');
    
    return NextResponse.json({
      success: true,
      message: `Item "${existingItem.name}" and its ${linkCount || 0} associated links have been deleted successfully`,
      deletedItem: {
        publicId,
        name: existingItem.name,
        deletedLinks: linkCount || 0,
      },
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
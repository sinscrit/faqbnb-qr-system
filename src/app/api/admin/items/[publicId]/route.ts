import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateItemRequest, ItemResponse } from '@/types';
import { getUser, isAdmin } from '@/lib/auth';

// Helper function to validate authentication for admin operations
async function validateAdminAuth(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid authorization header found');
      return { user: null, isAdmin: false, error: 'Authentication required - no valid Authorization header' };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 Validating JWT token for admin access...');

    // Validate token with Supabase
    const { data: authResult, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authResult.user) {
      console.log('❌ Token validation failed:', authError?.message || 'No user data');
      return { user: null, isAdmin: false, error: 'Invalid or expired token' };
    }

    // Check if user exists in admin_users table with proper role
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authResult.user.id)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminUser) {
      console.log('❌ User not found in admin_users or insufficient privileges');
      return { user: authResult.user, isAdmin: false, error: 'Insufficient privileges' };
    }

    console.log('✅ Admin authentication successful:', adminUser.email);
    return { 
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      }, 
      isAdmin: true 
    };
  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    return { user: null, isAdmin: false, error: 'Authentication failed' };
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    console.log('Admin update item API called - validating authentication...');
    
    // Validate authentication and admin role
    const authResult = await validateAdminAuth(request);
    
    if (!authResult.isAdmin || !authResult.user) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error || 'Authentication required',
          code: authResult.error === 'Insufficient privileges' ? 'FORBIDDEN' : 'UNAUTHORIZED'
        },
        { status: authResult.error === 'Insufficient privileges' ? 403 : 401 }
      );
    }
    
    console.log('Authentication successful for user:', authResult.user.email);
    
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
    
    console.log('Item found, proceeding with update...');
    
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

    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({
        name: body.name,
        description: body.description || null,
        property_id: body.propertyId,
        qr_code_url: body.qrCodeUrl || null,
        qr_code_uploaded_at: body.qrCodeUrl ? new Date().toISOString() : null,
      })
      .eq('public_id', publicId)
      .select()
      .single();
      
    if (updateError || !updatedItem) {
      console.error('Item update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update item' },
        { status: 500 }
      );
    }
    
    console.log('Item updated successfully:', updatedItem.id);
    
    // Delete existing links
    const { error: deleteLinksError } = await supabase
      .from('item_links')
      .delete()
      .eq('item_id', existingItem.id);
      
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
    console.log(`Item updated by admin: ${authResult.user.email}, item: ${updatedItem.name} (${updatedItem.public_id})`);
    
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
    
    // Validate authentication and admin role
    const authResult = await validateAdminAuth(request);
    
    if (!authResult.isAdmin || !authResult.user) {
      console.log('❌ Authentication failed:', authResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error || 'Authentication required',
          code: authResult.error === 'Insufficient privileges' ? 'FORBIDDEN' : 'UNAUTHORIZED'
        },
        { status: authResult.error === 'Insufficient privileges' ? 403 : 401 }
      );
    }
    
    console.log('Authentication successful for user:', authResult.user.email);
    
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
    
    // Add audit log for admin operations
    console.log(`Item deleted by admin: ${authResult.user.email}, item: ${existingItem.name} (${publicId}), deleted links: ${linkCount || 0}`);
    
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
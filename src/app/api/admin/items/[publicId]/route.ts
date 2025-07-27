import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { UpdateItemRequest, ItemResponse } from '@/types';
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

    // Validate the token and get user
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
      return { user: validatedUser, isAdmin: false };
    }

    // Return admin user data
    const validatedUser = {
      id: user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role
    };

    console.log('Authentication successful for admin:', validatedUser.email);
    return { user: validatedUser, isAdmin: adminUser.role === 'admin' };

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
async function getAccountContext(request: NextRequest, userId: string, isAdmin: boolean) {
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

// Helper function to validate item access within account context
async function validateItemAccess(publicId: string, userId: string, isAdmin: boolean, accountId: string | null) {
  try {
    // Get item with property and account information
    let itemQuery = supabase
      .from('items')
      .select(`
        id, 
        public_id, 
        name, 
        description,
        property_id,
        properties!inner(id, nickname, user_id, account_id)
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

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin);
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
    const { canAccess, item, error } = await validateItemAccess(publicId, user.id, userIsAdmin, accountId);
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

    // Get account context
    const accountContext = await getAccountContext(request, user.id, userIsAdmin);
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
    const { canAccess, item, error } = await validateItemAccess(publicId, user.id, userIsAdmin, accountId);
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
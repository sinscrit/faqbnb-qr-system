import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function validateAdminAuth(request: NextRequest) {
  const DEBUG_PREFIX = '🔍[ACCESS_REQ_DEBUG]';
  try {
    console.log(`${DEBUG_PREFIX} AUTH_VALIDATE_START: Starting authentication validation...`);
    const supabase = await createSupabaseServer();
    console.log(`${DEBUG_PREFIX} AUTH_SUPABASE_CLIENT: Server client created successfully`);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log(`${DEBUG_PREFIX} AUTH_GET_USER: Got user from Supabase:`, { user: user?.email, error: userError?.message });
    
    if (userError || !user) {
      console.log(`${DEBUG_PREFIX} AUTH_USER_FAILED: User session not found:`, userError?.message);
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
      console.log('ADMIN_API_DEBUG: No email in user data');
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
    console.log('ADMIN_API_DEBUG: User email found:', user.email);

    // Check if user is an admin using service role client
    console.log('ADMIN_API_DEBUG: Checking if user is admin using service role...');
    console.log('ADMIN_API_DEBUG: Environment check:', { 
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      userId: user.id,
      userEmail: user.email
    });
    
    // Query admin_users table with detailed debugging
    console.log('ADMIN_API_DEBUG: Querying admin_users with:', { 
      userId: user.id, 
      userEmail: user.email,
      userIdType: typeof user.id,
      userEmailType: typeof user.email 
    });
    
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('email, full_name, role, id')  // Added id to see what we get back
      .eq('id', user.id)
      .eq('email', user.email)
      .single();
    console.error('🚨 ADMIN_API_DEBUG: Raw admin query result:', { 
      adminUser, 
      adminError: adminError?.message,
      adminErrorCode: adminError?.code,
      adminErrorDetails: adminError?.details 
    });

    // Also check is_admin flag in users table
    const { data: userWithAdminFlag, error: userFlagError } = await supabaseAdmin
      .from('users')
      .select('email, full_name, role, is_admin, id')
      .eq('id', user.id)
      .single();
    console.error('🚨 ADMIN_API_DEBUG: User admin flag query result:', { 
      userWithAdminFlag, 
      userFlagError: userFlagError?.message 
    });

    const isAdminByTable = !adminError && adminUser;
    const isAdminByFlag = !userFlagError && userWithAdminFlag?.is_admin;

    if (!isAdminByTable && !isAdminByFlag) {
      // Check if user exists in users table (we already have this data)
      if (userFlagError || !userWithAdminFlag) {
        console.error('🚨 ADMIN_API_DEBUG: User validation failed:', { 
          userId: user.id, 
          email: user.email, 
          adminError: adminError?.message,
          userFlagError: userFlagError?.message
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
        email: userWithAdminFlag.email,
        fullName: userWithAdminFlag.full_name || undefined,
        role: userWithAdminFlag.role
      };

      console.log('ADMIN_API_DEBUG: Authentication successful for user:', validatedUser.email);
      return { user: validatedUser, isAdmin: false, supabase };
    }

    // Return admin user data (prioritize admin_users table if available)
    const userInfo = isAdminByTable ? adminUser : userWithAdminFlag;
    const validatedUser = {
      id: user.id,
      email: userInfo.email,
      fullName: userInfo.full_name || undefined,
      role: userInfo.role
    };

    console.log('ADMIN_API_DEBUG: Authentication successful for admin:', validatedUser.email);
    return { user: validatedUser, isAdmin: true, supabase };

  } catch (error) {
    console.error('ADMIN_API_DEBUG: Auth validation error:', error);
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
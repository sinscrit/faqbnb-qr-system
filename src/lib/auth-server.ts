import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createSupabaseServer } from '@/lib/supabase-server';

export async function validateAdminAuth(request: NextRequest) {
  try {
    console.log('ADMIN_API_DEBUG: Starting authentication validation...');
    const supabase = await createSupabaseServer();
    console.log('ADMIN_API_DEBUG: Supabase server client created');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('ADMIN_API_DEBUG: Got user from Supabase:', { user: user?.email, error: userError?.message });
    
    if (userError || !user) {
      console.log('ADMIN_API_DEBUG: User session not found:', userError?.message);
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
    
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('email, full_name, role')
      .eq('id', user.id)
      .eq('email', user.email)
      .single();
    console.log('ADMIN_API_DEBUG: Raw query result:', { adminUser, adminError });

    if (adminError || !adminUser) {
      // If not admin, check if user is a regular user
      console.log('ADMIN_API_DEBUG: Not admin, checking if regular user...');
      const { data: regularUser, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, full_name, role')
        .eq('id', user.id)
        .single();
      console.log('ADMIN_API_DEBUG: Regular user check result:', { regularUser, userError: userError?.message });

      if (userError || !regularUser) {
        console.log('ADMIN_API_DEBUG: User validation failed:', { 
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

      console.log('ADMIN_API_DEBUG: Authentication successful for user:', validatedUser.email);
      return { user: validatedUser, isAdmin: false, supabase };
    }

    // Return admin user data
    const validatedUser = {
      id: user.id,
      email: adminUser.email,
      fullName: adminUser.full_name || undefined,
      role: adminUser.role
    };

    console.log('ADMIN_API_DEBUG: Authentication successful for admin:', validatedUser.email);
    return { user: validatedUser, isAdmin: adminUser.role === 'admin', supabase };

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
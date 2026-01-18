import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth, isSysAdmin } from '@/lib/auth-server';

/**
 * Check if the current user is a system administrator
 * Returns { isSysAdmin: boolean } for client-side checks
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await validateAdminAuth(request);

    if (authResult.error) {
      return authResult.error;
    }

    const userIsSysAdmin = isSysAdmin(authResult.user?.email);

    return NextResponse.json({
      success: true,
      data: {
        isSysAdmin: userIsSysAdmin,
        email: authResult.user?.email
      }
    });

  } catch (error) {
    console.error('CHECK_SYSADMIN_ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check sysadmin status',
        code: 'CHECK_FAILED'
      },
      { status: 500 }
    );
  }
}

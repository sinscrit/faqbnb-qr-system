import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { validateAdminAuth } from '@/lib/auth-server';

/**
 * Upload API Endpoint
 *
 * Handles file uploads for item media (videos, photos, PDFs).
 * Files are stored in Supabase Storage bucket 'item-media'.
 *
 * @route POST /api/admin/upload
 * @created 2026-01-09 (REQ-146)
 */

// File size limits in bytes
const FILE_SIZE_LIMITS: Record<string, number> = {
  video: 50 * 1024 * 1024,  // 50MB for videos
  image: 10 * 1024 * 1024,  // 10MB for photos
  pdf: 20 * 1024 * 1024,    // 20MB for PDFs
};

// Allowed MIME types grouped by category
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  video: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
  pdf: ['application/pdf'],
};

// Get file category from MIME type
function getFileCategory(mimeType: string): string | null {
  for (const [category, types] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (types.includes(mimeType)) {
      return category;
    }
  }
  return null;
}

// Generate unique filename
function generateFilename(userId: string, originalName: string, mimeType: string): string {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const ext = originalName.split('.').pop() || mimeType.split('/').pop() || 'bin';
  return `${userId}/${timestamp}-${uuid}.${ext}`;
}

export async function POST(request: NextRequest) {
  console.log('UPLOAD_API: Starting file upload...');

  try {
    // Validate authentication
    const authResult = await validateAdminAuth(request);
    if (authResult.error) {
      console.log('UPLOAD_API: Authentication failed');
      return authResult.error;
    }

    const { user } = authResult;
    console.log('UPLOAD_API: Authenticated user:', user.email);

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('UPLOAD_API: File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    const category = getFileCategory(file.type);
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed types: video (mp4, webm, mov), image (jpg, png, gif, webp), pdf`
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = FILE_SIZE_LIMITS[category];
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size for ${category}: ${maxSizeMB}MB`
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = generateFilename(user.id, file.name, file.type);
    console.log('UPLOAD_API: Generated filename:', filename);

    // Upload to Supabase Storage
    const supabase = await createSupabaseServer();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('item-media')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('UPLOAD_API: Upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log('UPLOAD_API: Upload successful:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('item-media')
      .getPublicUrl(filename);

    const publicUrl = urlData.publicUrl;
    console.log('UPLOAD_API: Public URL:', publicUrl);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: file.name,
        size: file.size,
        contentType: file.type,
        category,
      },
    });

  } catch (error) {
    console.error('UPLOAD_API: Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      },
      { status: 500 }
    );
  }
}

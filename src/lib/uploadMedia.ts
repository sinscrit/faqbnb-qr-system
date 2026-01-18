/**
 * Media Upload Utility
 *
 * Client-side utility for uploading media files (video, photo, PDF)
 * to the server via the /api/admin/upload endpoint.
 *
 * @created 2026-01-09 (REQ-147)
 */

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  contentType: string;
  category: 'video' | 'image' | 'pdf';
}

export interface UploadError {
  message: string;
  code?: string;
}

/**
 * Upload a media file to storage.
 *
 * @param file - The File or Blob to upload
 * @param filename - Optional filename (defaults to 'upload' for Blobs)
 * @returns Promise with upload result containing the public URL
 * @throws Error if upload fails
 *
 * @example
 * ```ts
 * const result = await uploadMediaFile(videoBlob, 'my-video.mp4');
 * console.log('Uploaded to:', result.url);
 * ```
 */
export async function uploadMediaFile(
  file: File | Blob,
  filename?: string
): Promise<UploadResult> {
  // Create FormData with the file
  const formData = new FormData();

  // If it's a Blob without a name, wrap it in a File
  if (file instanceof Blob && !(file instanceof File)) {
    const name = filename || `upload-${Date.now()}.${getExtensionFromMimeType(file.type)}`;
    file = new File([file], name, { type: file.type });
  }

  formData.append('file', file);

  // Make the upload request
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    body: formData,
    // Note: Don't set Content-Type header - browser sets it with boundary for multipart
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Upload failed');
  }

  return result.data as UploadResult;
}

/**
 * Upload multiple files in sequence.
 *
 * @param files - Array of files to upload
 * @param onProgress - Optional callback for progress updates
 * @returns Promise with array of upload results
 */
export async function uploadMultipleFiles(
  files: Array<{ file: File | Blob; filename?: string }>,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const { file, filename } = files[i];
    const result = await uploadMediaFile(file, filename);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return results;
}

/**
 * Get file extension from MIME type.
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'application/pdf': 'pdf',
  };

  return mimeToExt[mimeType] || 'bin';
}

/**
 * Check if a file type is supported for upload.
 */
export function isSupportedFileType(mimeType: string): boolean {
  const supported = [
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif',
    'application/pdf',
  ];
  return supported.includes(mimeType);
}

/**
 * Get the link type for API based on file category.
 */
export function getLinkTypeFromCategory(category: string): 'video' | 'image' | 'pdf' {
  switch (category) {
    case 'video':
      return 'video';
    case 'image':
      return 'image';
    case 'pdf':
      return 'pdf';
    default:
      return 'image'; // fallback
  }
}

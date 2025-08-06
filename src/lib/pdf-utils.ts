/**
 * PDF utility functions for client-side operations
 */

/**
 * Download a PDF blob as a file
 */
export function downloadPDFBlob(blob: Blob, filename: string = 'qr-codes.pdf'): void {
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
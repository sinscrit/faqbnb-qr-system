// This module is lazy-loaded only when a user uploads a PDF
// It should NOT be imported directly - use dynamic import

export async function generatePDFThumbnail(file: File): Promise<Blob | null> {
  // Dynamic import of pdfjs-dist
  const pdfjs = await import('pdfjs-dist');

  // Configure worker from CDN to avoid bundling
  pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext('2d');
    if (!context) return null;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  } catch (error) {
    console.error('PDF thumbnail generation failed:', error);
    return null;
  }
}

export async function getPDFPageCount(file: File): Promise<number> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

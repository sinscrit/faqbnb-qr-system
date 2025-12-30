'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';

// Lazy load heavy components
const ImageCropper = dynamic(
  () => import('@/components/ItemCapture/editors/ImageCropper'),
  { ssr: false, loading: () => <p>Loading cropper...</p> }
);

export default function BundleTestPage() {
  const [showCropper, setShowCropper] = useState(false);
  const [pdfResult, setPdfResult] = useState<string | null>(null);

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    // Dynamic import only when PDF is uploaded
    const { generatePDFThumbnail, getPDFPageCount } = await import(
      '@/components/ItemCapture/utils/pdfThumbnailGenerator'
    );

    const pageCount = await getPDFPageCount(file);
    setPdfResult(`PDF has ${pageCount} pages`);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Bundle Size Test Page</h1>

      {/* Markdown - loaded eagerly (small) */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">Markdown (Eager Load)</h2>
        <ReactMarkdown>**Bold text** and *italic text*</ReactMarkdown>
      </section>

      {/* PDF - loaded lazily on upload */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">PDF Processing (Lazy Load on Upload)</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePDFUpload}
          className="block"
        />
        {pdfResult && <p className="mt-2 text-green-600">{pdfResult}</p>}
      </section>

      {/* Image Cropper - loaded lazily on button click */}
      <section className="border p-4 rounded">
        <h2 className="font-semibold">Image Cropper (Lazy Load on Click)</h2>
        <button
          onClick={() => setShowCropper(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Open Cropper
        </button>
        {showCropper && (
          <ImageCropper
            imageSrc="/placeholder.jpg"
            onCropComplete={() => {}}
            onCancel={() => setShowCropper(false)}
          />
        )}
      </section>
    </div>
  );
}

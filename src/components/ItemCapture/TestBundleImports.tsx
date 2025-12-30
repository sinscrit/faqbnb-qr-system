'use client';

// Eager imports for bundle measurement
import * as pdfjsLib from 'pdfjs-dist';
import ReactCrop from 'react-image-crop';
import ReactMarkdown from 'react-markdown';
import 'react-image-crop/dist/ReactCrop.css';

// This component exists only to measure bundle impact
// It should be deleted after the spike is complete
export function TestBundleImports() {
  console.log('Bundle test:', { pdfjsLib, ReactCrop, ReactMarkdown });
  return <div>Bundle test component</div>;
}

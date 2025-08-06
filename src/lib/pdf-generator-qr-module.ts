/**
 * PDF Generator with QR Code Support - TypeScript Integration
 * 
 * This module provides TypeScript integration for the PDF generator module
 * that supports embedded QR codes, titles, and professional layouts.
 */

// Import the JavaScript module
const pdfModule = require('./pdf_generator_module');

// Re-export with proper TypeScript types
export const {
  generateSinglePDF,
  generatePDFsFromJSON,
  generatePDFBuffer,
  generateQRCodeBuffer,
  convertToPoints,
  getPaperSize,
  getMarginSize,
  getQRCodeSize
} = pdfModule;

// Export types for TypeScript usage
export interface QRCodeData {
  id: string;
  label: string;
  imageData?: Buffer | string | null; // Pre-generated QR code image
}

export interface PDFConfig {
  paperSize?: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'Letter' | 'Legal' | 'Tabloid' | 'Ledger';
  margin?: 'none' | 'thin' | 'standard' | 'large' | string;
  qrCodeCount?: number;
  qrCodesPerRow?: number;
  qrCodeSize?: 'small' | 'medium' | 'large' | string;
  qrBoxMargin?: string | null;
  showCutlines?: boolean;
  debug?: boolean;
  title?: string;
  outputFileName?: string; // Deprecated: use pdfOutput parameter instead
  qrCodes?: QRCodeData[];
}

export interface PDFOutputConfig {
  type: 'file' | 'blob';
  path?: string;
  name?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  type: 'file' | 'blob';
  outputPath?: string;
  data?: Buffer;
  size?: number;
  error?: string;
  config?: PDFConfig;
}

// Type-safe function declarations
export declare function generatePDFsFromJSON(
  jsonString: string, 
  pdfOutput?: PDFOutputConfig
): Promise<PDFGenerationResult[]>;

export declare function generateSinglePDF(
  config: PDFConfig, 
  pdfOutput?: PDFOutputConfig
): Promise<PDFGenerationResult>;

export declare function generatePDFBuffer(config: PDFConfig): Promise<Buffer>;

export declare function generateQRCodeBuffer(data: string, size?: number): Promise<Buffer | null>;

export declare function convertToPoints(value: string | number): number;
export declare function getPaperSize(size: string): [number, number];
export declare function getMarginSize(marginType: string, paperSize: [number, number]): number;
export declare function getQRCodeSize(sizeType: string, availableSpace: number): number;
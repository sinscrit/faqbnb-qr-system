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

// Type definitions for the imported module functions
// Note: The actual exports are from the destructured pdfModule above
// These type definitions are for documentation and IDE support only
export type GeneratePDFsFromJSON = (
  jsonString: string,
  pdfOutput?: PDFOutputConfig
) => Promise<PDFGenerationResult[]>;

export type GenerateSinglePDF = (
  config: PDFConfig,
  pdfOutput?: PDFOutputConfig
) => Promise<PDFGenerationResult>;

export type GeneratePDFBuffer = (config: PDFConfig) => Promise<Buffer>;

export type GenerateQRCodeBuffer = (data: string, size?: number) => Promise<Buffer | null>;

export type ConvertToPoints = (value: string | number) => number;
export type GetPaperSize = (size: string) => [number, number];
export type GetMarginSize = (marginType: string, paperSize: [number, number]) => number;
export type GetQRCodeSize = (sizeType: string, availableSpace: number) => number;
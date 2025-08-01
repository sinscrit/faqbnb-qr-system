import { PDFDocument, PDFPage, rgb, RGB } from 'pdf-lib';

// Custom error class for cutline generation
export class CutlineGenerationError extends Error {
  constructor(message: string) {
    super(`CutlineGenerationError: ${message}`);
    this.name = 'CutlineGenerationError';
  }
}

// Interface for dash pattern configuration
export interface DashPattern {
  /** Array of numbers representing dash pattern (e.g., [4, 4] for 4pt on/4pt off) */
  pattern: number[];
  /** Phase offset for the dash pattern */
  phase: number;
}

// Interface for line drawing options
export interface LineOptions {
  /** Stroke width in points (0.5-1pt recommended) */
  strokeWidth: number;
  /** Line color (RGB object) */
  color: RGB;
  /** Dash pattern configuration */
  dashPattern?: DashPattern;
}

// Default cutline configuration as per REQ-013 specifications
export const DEFAULT_CUTLINE_OPTIONS: LineOptions = {
  strokeWidth: 0.75, // 0.75pt stroke width
  color: rgb(0.6, 0.6, 0.6), // #999999 gray
  dashPattern: {
    pattern: [4, 4], // 4pt on / 4pt off
    phase: 0
  }
};

/**
 * Validates line coordinates and options
 * 
 * @param startX - Starting X coordinate
 * @param startY - Starting Y coordinate  
 * @param endX - Ending X coordinate
 * @param endY - Ending Y coordinate
 * @param options - Line drawing options
 * @throws CutlineGenerationError if validation fails
 */
export function validateLineInput(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: LineOptions
): void {
  // Validate coordinates are finite numbers
  if (!Number.isFinite(startX) || !Number.isFinite(startY) || 
      !Number.isFinite(endX) || !Number.isFinite(endY)) {
    throw new CutlineGenerationError('Line coordinates must be finite numbers');
  }

  // Validate stroke width is positive and within reasonable range
  if (!Number.isFinite(options.strokeWidth) || options.strokeWidth <= 0) {
    throw new CutlineGenerationError('Stroke width must be a positive number');
  }

  if (options.strokeWidth < 0.1 || options.strokeWidth > 10) {
    throw new CutlineGenerationError('Stroke width must be between 0.1 and 10 points');
  }

  // Validate dash pattern if provided
  if (options.dashPattern) {
    if (!Array.isArray(options.dashPattern.pattern) || options.dashPattern.pattern.length === 0) {
      throw new CutlineGenerationError('Dash pattern must be a non-empty array');
    }

    for (const value of options.dashPattern.pattern) {
      if (!Number.isFinite(value) || value < 0) {
        throw new CutlineGenerationError('Dash pattern values must be non-negative finite numbers');
      }
    }

    if (!Number.isFinite(options.dashPattern.phase)) {
      throw new CutlineGenerationError('Dash pattern phase must be a finite number');
    }
  }
}

/**
 * Configures dash pattern for cutlines
 * 
 * @param pattern - Array of numbers for dash pattern (e.g., [4, 4] for 4pt on/4pt off)
 * @param phase - Phase offset for the pattern (default: 0)
 * @returns Configured dash pattern
 */
export function configureDashPattern(pattern: number[], phase: number = 0): DashPattern {
  if (!Array.isArray(pattern) || pattern.length === 0) {
    throw new CutlineGenerationError('Dash pattern must be a non-empty array');
  }

  for (const value of pattern) {
    if (!Number.isFinite(value) || value < 0) {
      throw new CutlineGenerationError('Dash pattern values must be non-negative finite numbers');
    }
  }

  if (!Number.isFinite(phase)) {
    throw new CutlineGenerationError('Dash pattern phase must be a finite number');
  }

  return {
    pattern,
    phase
  };
}

/**
 * Draws a dashed line on a PDF page with specified coordinates and options
 * 
 * @param page - PDF page to draw on
 * @param startX - Starting X coordinate in points
 * @param startY - Starting Y coordinate in points  
 * @param endX - Ending X coordinate in points
 * @param endY - Ending Y coordinate in points
 * @param options - Line drawing options (stroke width, color, dash pattern)
 */
export function drawDashedLine(
  page: PDFPage,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: LineOptions = DEFAULT_CUTLINE_OPTIONS
): void {
  if (!page) {
    throw new CutlineGenerationError('PDF page is required for line drawing');
  }

  // Validate input parameters
  validateLineInput(startX, startY, endX, endY, options);

  // Use pdf-lib's drawing capabilities
  page.drawLine({
    start: { x: startX, y: startY },
    end: { x: endX, y: endY },
    thickness: options.strokeWidth,
    color: options.color,
    dashArray: options.dashPattern?.pattern,
    dashPhase: options.dashPattern?.phase || 0
  });
}

/**
 * Draws a vertical dashed line (commonly used for column boundaries)
 * 
 * @param page - PDF page to draw on
 * @param x - X coordinate for the vertical line
 * @param startY - Starting Y coordinate
 * @param endY - Ending Y coordinate
 * @param options - Line drawing options
 */
export function drawVerticalDashedLine(
  page: PDFPage,
  x: number,
  startY: number,
  endY: number,
  options: LineOptions = DEFAULT_CUTLINE_OPTIONS
): void {
  drawDashedLine(page, x, startY, x, endY, options);
}

/**
 * Draws a horizontal dashed line (commonly used for row boundaries)
 * 
 * @param page - PDF page to draw on
 * @param y - Y coordinate for the horizontal line
 * @param startX - Starting X coordinate
 * @param endX - Ending X coordinate
 * @param options - Line drawing options
 */
export function drawHorizontalDashedLine(
  page: PDFPage,
  y: number,
  startX: number,
  endX: number,
  options: LineOptions = DEFAULT_CUTLINE_OPTIONS
): void {
  drawDashedLine(page, startX, y, endX, y, options);
}

/**
 * Creates line options with custom stroke width while keeping default color and pattern
 * 
 * @param strokeWidth - Custom stroke width in points
 * @returns Line options with custom stroke width
 */
export function createCustomStrokeOptions(strokeWidth: number): LineOptions {
  if (!Number.isFinite(strokeWidth) || strokeWidth <= 0) {
    throw new CutlineGenerationError('Stroke width must be a positive number');
  }

  return {
    ...DEFAULT_CUTLINE_OPTIONS,
    strokeWidth
  };
}

/**
 * Creates line options with custom color while keeping default stroke width and pattern
 * 
 * @param r - Red component (0-1)
 * @param g - Green component (0-1) 
 * @param b - Blue component (0-1)
 * @returns Line options with custom color
 */
export function createCustomColorOptions(r: number, g: number, b: number): LineOptions {
  return {
    ...DEFAULT_CUTLINE_OPTIONS,
    color: rgb(r, g, b)
  };
}

/**
 * Creates line options with custom dash pattern while keeping default stroke width and color
 * 
 * @param pattern - Array of numbers for dash pattern
 * @param phase - Phase offset for the pattern
 * @returns Line options with custom dash pattern
 */
export function createCustomDashOptions(pattern: number[], phase: number = 0): LineOptions {
  return {
    ...DEFAULT_CUTLINE_OPTIONS,
    dashPattern: configureDashPattern(pattern, phase)
  };
}
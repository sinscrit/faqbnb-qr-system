import { PDFDocument, PDFPage, rgb, RGB } from 'pdf-lib';
import { GridLayout } from './pdf-geometry';

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

// Interface for grid boundaries
export interface GridBoundaries {
  /** Array of X coordinates for vertical column lines */
  columnLines: number[];
  /** Array of Y coordinates for horizontal row lines */
  rowLines: number[];
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

// Grid Boundary Detection Functions

/**
 * Validates grid layout for boundary calculations
 * 
 * @param layout - Grid layout configuration
 * @throws CutlineGenerationError if layout is invalid
 */
export function validateGridLayout(layout: GridLayout): void {
  if (!layout) {
    throw new CutlineGenerationError('Grid layout is required');
  }

  if (!Number.isFinite(layout.pageWidth) || layout.pageWidth <= 0) {
    throw new CutlineGenerationError('Page width must be a positive finite number');
  }

  if (!Number.isFinite(layout.pageHeight) || layout.pageHeight <= 0) {
    throw new CutlineGenerationError('Page height must be a positive finite number');
  }

  if (!Number.isFinite(layout.usableWidth) || layout.usableWidth <= 0) {
    throw new CutlineGenerationError('Usable width must be a positive finite number');
  }

  if (!Number.isFinite(layout.usableHeight) || layout.usableHeight <= 0) {
    throw new CutlineGenerationError('Usable height must be a positive finite number');
  }

  if (!Number.isFinite(layout.qrSize) || layout.qrSize <= 0) {
    throw new CutlineGenerationError('QR size must be a positive finite number');
  }

  if (!Number.isInteger(layout.columns) || layout.columns <= 0) {
    throw new CutlineGenerationError('Columns must be a positive integer');
  }

  if (!Number.isInteger(layout.rows) || layout.rows <= 0) {
    throw new CutlineGenerationError('Rows must be a positive integer');
  }

  if (!Number.isInteger(layout.itemsPerPage) || layout.itemsPerPage <= 0) {
    throw new CutlineGenerationError('Items per page must be a positive integer');
  }
}

/**
 * Calculates vertical line positions for column boundaries
 * 
 * @param layout - Grid layout configuration
 * @returns Array of X coordinates for vertical lines
 */
export function calculateColumnLines(layout: GridLayout): number[] {
  validateGridLayout(layout);

  const columnLines: number[] = [];
  
  // Calculate left margin (to center the grid)
  const leftMargin = (layout.pageWidth - layout.usableWidth) / 2;
  
  // Add vertical lines for each column boundary
  for (let col = 0; col <= layout.columns; col++) {
    const x = leftMargin + (col * layout.qrSize);
    columnLines.push(x);
  }

  return columnLines;
}

/**
 * Calculates horizontal line positions for row boundaries
 * 
 * @param layout - Grid layout configuration
 * @param actualItemCount - Number of actual items on this page (for partial pages)
 * @returns Array of Y coordinates for horizontal lines
 */
export function calculateRowLines(layout: GridLayout, actualItemCount?: number): number[] {
  validateGridLayout(layout);

  const rowLines: number[] = [];
  
  // Calculate top margin (to center the grid)
  const topMargin = (layout.pageHeight - layout.usableHeight) / 2;
  
  // Determine actual number of rows needed
  const itemsOnPage = actualItemCount ?? layout.itemsPerPage;
  const actualRows = Math.ceil(itemsOnPage / layout.columns);
  
  // Add horizontal lines for each row boundary
  const maxRows = Math.min(actualRows, layout.rows);
  for (let row = 0; row <= maxRows; row++) {
    const y = layout.pageHeight - topMargin - (row * layout.qrSize);
    rowLines.push(y);
  }

  return rowLines;
}

/**
 * Validates boundary coordinates are within page bounds and properly ordered
 * 
 * @param boundaries - Grid boundaries to validate
 * @param pageWidth - Page width in points
 * @param pageHeight - Page height in points
 * @throws CutlineGenerationError if boundaries are invalid
 */
export function validateBoundaries(boundaries: GridBoundaries, pageWidth: number, pageHeight: number): void {
  if (!boundaries) {
    throw new CutlineGenerationError('Grid boundaries are required');
  }

  if (!Array.isArray(boundaries.columnLines)) {
    throw new CutlineGenerationError('Column lines must be an array');
  }

  if (!Array.isArray(boundaries.rowLines)) {
    throw new CutlineGenerationError('Row lines must be an array');
  }

  // Validate column lines
  for (let i = 0; i < boundaries.columnLines.length; i++) {
    const x = boundaries.columnLines[i];
    
    if (!Number.isFinite(x)) {
      throw new CutlineGenerationError(`Column line ${i} coordinate must be finite`);
    }

    if (x < 0 || x > pageWidth) {
      throw new CutlineGenerationError(`Column line ${i} coordinate ${x} is outside page bounds (0-${pageWidth})`);
    }

    // Check ordering (should be ascending)
    if (i > 0 && x <= boundaries.columnLines[i - 1]) {
      throw new CutlineGenerationError(`Column lines must be in ascending order`);
    }
  }

  // Validate row lines
  for (let i = 0; i < boundaries.rowLines.length; i++) {
    const y = boundaries.rowLines[i];
    
    if (!Number.isFinite(y)) {
      throw new CutlineGenerationError(`Row line ${i} coordinate must be finite`);
    }

    if (y < 0 || y > pageHeight) {
      throw new CutlineGenerationError(`Row line ${i} coordinate ${y} is outside page bounds (0-${pageHeight})`);
    }

    // Check ordering (should be descending for PDF coordinate system)
    if (i > 0 && y >= boundaries.rowLines[i - 1]) {
      throw new CutlineGenerationError(`Row lines must be in descending order for PDF coordinate system`);
    }
  }
}

/**
 * Calculates exact positions for grid boundaries where cutlines should be drawn
 * 
 * @param layout - Grid layout configuration
 * @param actualItemCount - Number of actual items on this page (optional, for partial pages)
 * @returns Object containing arrays of column and row line coordinates
 */
export function calculateGridBoundaries(layout: GridLayout, actualItemCount?: number): GridBoundaries {
  validateGridLayout(layout);

  const columnLines = calculateColumnLines(layout);
  const rowLines = calculateRowLines(layout, actualItemCount);

  const boundaries: GridBoundaries = {
    columnLines,
    rowLines
  };

  // Validate the calculated boundaries
  validateBoundaries(boundaries, layout.pageWidth, layout.pageHeight);

  return boundaries;
}
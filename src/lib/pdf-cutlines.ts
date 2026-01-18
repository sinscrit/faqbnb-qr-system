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

// Cutline Grid Generation Functions

/**
 * Options for cutline grid generation
 */
export interface CutlineGridOptions {
  /** Line drawing options (stroke width, color, dash pattern) */
  lineOptions?: LineOptions;
  /** Whether to draw border lines around the entire grid */
  drawBorder?: boolean;
  /** Whether to extend lines to page margins */
  extendToMargins?: boolean;
  /** Number of actual items on this page (for partial pages) */
  actualItemCount?: number;
}

/**
 * Default options for cutline grid generation
 */
export const DEFAULT_CUTLINE_GRID_OPTIONS: CutlineGridOptions = {
  lineOptions: DEFAULT_CUTLINE_OPTIONS,
  drawBorder: true,
  extendToMargins: true
};

/**
 * Draws all vertical cutlines for column boundaries
 * 
 * @param page - PDF page to draw on
 * @param boundaries - Calculated grid boundaries
 * @param layout - Grid layout configuration
 * @param options - Cutline generation options
 */
export function drawVerticalCutlines(
  page: PDFPage,
  boundaries: GridBoundaries,
  layout: GridLayout,
  options: CutlineGridOptions = DEFAULT_CUTLINE_GRID_OPTIONS
): void {
  if (!page) {
    throw new CutlineGenerationError('PDF page is required for drawing vertical cutlines');
  }

  if (!boundaries || !Array.isArray(boundaries.columnLines)) {
    throw new CutlineGenerationError('Valid grid boundaries with column lines are required');
  }

  const lineOptions = options.lineOptions || DEFAULT_CUTLINE_OPTIONS;
  const extendToMargins = options.extendToMargins !== false;

  // Calculate vertical line extent
  const topMargin = (layout.pageHeight - layout.usableHeight) / 2;
  const bottomMargin = topMargin;
  
  const startY = extendToMargins ? bottomMargin : Math.min(...boundaries.rowLines);
  const endY = extendToMargins ? layout.pageHeight - topMargin : Math.max(...boundaries.rowLines);

  // Draw each vertical column line
  for (const x of boundaries.columnLines) {
    drawVerticalDashedLine(page, x, startY, endY, lineOptions);
  }
}

/**
 * Draws all horizontal cutlines for row boundaries
 * 
 * @param page - PDF page to draw on
 * @param boundaries - Calculated grid boundaries
 * @param layout - Grid layout configuration
 * @param options - Cutline generation options
 */
export function drawHorizontalCutlines(
  page: PDFPage,
  boundaries: GridBoundaries,
  layout: GridLayout,
  options: CutlineGridOptions = DEFAULT_CUTLINE_GRID_OPTIONS
): void {
  if (!page) {
    throw new CutlineGenerationError('PDF page is required for drawing horizontal cutlines');
  }

  if (!boundaries || !Array.isArray(boundaries.rowLines)) {
    throw new CutlineGenerationError('Valid grid boundaries with row lines are required');
  }

  const lineOptions = options.lineOptions || DEFAULT_CUTLINE_OPTIONS;
  const extendToMargins = options.extendToMargins !== false;

  // Calculate horizontal line extent
  const leftMargin = (layout.pageWidth - layout.usableWidth) / 2;
  const rightMargin = leftMargin;
  
  const startX = extendToMargins ? leftMargin : Math.min(...boundaries.columnLines);
  const endX = extendToMargins ? layout.pageWidth - rightMargin : Math.max(...boundaries.columnLines);

  // Draw each horizontal row line
  for (const y of boundaries.rowLines) {
    drawHorizontalDashedLine(page, y, startX, endX, lineOptions);
  }
}

/**
 * Draws border lines around the entire grid area
 * 
 * @param page - PDF page to draw on
 * @param layout - Grid layout configuration
 * @param options - Cutline generation options
 */
export function drawGridBorder(
  page: PDFPage,
  layout: GridLayout,
  options: CutlineGridOptions = DEFAULT_CUTLINE_GRID_OPTIONS
): void {
  if (!page) {
    throw new CutlineGenerationError('PDF page is required for drawing grid border');
  }

  const lineOptions = options.lineOptions || DEFAULT_CUTLINE_OPTIONS;
  
  // Calculate border coordinates
  const leftMargin = (layout.pageWidth - layout.usableWidth) / 2;
  const rightMargin = leftMargin;
  const topMargin = (layout.pageHeight - layout.usableHeight) / 2;
  const bottomMargin = topMargin;
  
  const left = leftMargin;
  const right = layout.pageWidth - rightMargin;
  const bottom = bottomMargin;
  const top = layout.pageHeight - topMargin;

  // Draw border rectangle
  drawHorizontalDashedLine(page, bottom, left, right, lineOptions); // Bottom border
  drawHorizontalDashedLine(page, top, left, right, lineOptions);    // Top border
  drawVerticalDashedLine(page, left, bottom, top, lineOptions);     // Left border
  drawVerticalDashedLine(page, right, bottom, top, lineOptions);    // Right border
}

/**
 * Validates cutline generation options
 * 
 * @param options - Cutline generation options to validate
 * @throws CutlineGenerationError if options are invalid
 */
export function validateCutlineGridOptions(options: CutlineGridOptions): void {
  if (!options) {
    return; // Null/undefined options are acceptable (defaults will be used)
  }

  // Validate line options if provided
  if (options.lineOptions) {
    // Basic validation - the line drawing functions will do detailed validation
    if (typeof options.lineOptions.strokeWidth !== 'number' || options.lineOptions.strokeWidth <= 0) {
      throw new CutlineGenerationError('Line options must have a positive stroke width');
    }
  }

  // Validate boolean options
  if (options.drawBorder !== undefined && typeof options.drawBorder !== 'boolean') {
    throw new CutlineGenerationError('drawBorder option must be a boolean');
  }

  if (options.extendToMargins !== undefined && typeof options.extendToMargins !== 'boolean') {
    throw new CutlineGenerationError('extendToMargins option must be a boolean');
  }

  // Validate actualItemCount if provided
  if (options.actualItemCount !== undefined) {
    if (!Number.isInteger(options.actualItemCount) || options.actualItemCount < 0) {
      throw new CutlineGenerationError('actualItemCount must be a non-negative integer');
    }
  }
}

/**
 * Generates complete cutline grid for a PDF page using calculated boundaries and line drawing utilities
 * 
 * @param page - PDF page to draw cutlines on
 * @param layout - Grid layout configuration
 * @param options - Cutline generation options
 */
export function generateCutlineGrid(
  page: PDFPage,
  layout: GridLayout,
  options: CutlineGridOptions = DEFAULT_CUTLINE_GRID_OPTIONS
): void {
  if (!page) {
    throw new CutlineGenerationError('PDF page is required for cutline grid generation');
  }

  // Validate inputs
  validateGridLayout(layout);
  validateCutlineGridOptions(options);

  // Calculate grid boundaries
  const boundaries = calculateGridBoundaries(layout, options.actualItemCount);

  // Draw vertical cutlines (column boundaries)
  drawVerticalCutlines(page, boundaries, layout, options);

  // Draw horizontal cutlines (row boundaries)
  drawHorizontalCutlines(page, boundaries, layout, options);

  // Draw border lines if requested
  if (options.drawBorder !== false) {
    drawGridBorder(page, layout, options);
  }
}

// Multi-Page Cutline Consistency Functions

/**
 * Options for multi-page cutline generation
 */
export interface MultiPageCutlineOptions extends CutlineGridOptions {
  /** Total number of items across all pages */
  totalItemCount?: number;
  /** Items per page (derived from layout if not specified) */
  itemsPerPage?: number;
}

/**
 * Information about a specific page in a multi-page document
 */
export interface PageInfo {
  /** Page number (1-based) */
  pageNumber: number;
  /** Total number of pages in document */
  totalPages: number;
  /** Number of items on this specific page */
  itemsOnPage: number;
  /** Starting item index for this page (0-based) */
  startItemIndex: number;
  /** Ending item index for this page (0-based, inclusive) */
  endItemIndex: number;
  /** Whether this is a partial page (fewer items than full capacity) */
  isPartialPage: boolean;
}

/**
 * Validates page number and document structure for multi-page operations
 * 
 * @param pageNumber - Page number to validate (1-based)
 * @param totalPages - Total number of pages in document
 * @param totalItemCount - Total number of items across all pages
 * @param itemsPerPage - Items per page capacity
 * @throws CutlineGenerationError if validation fails
 */
export function validatePageInfo(
  pageNumber: number,
  totalPages: number,
  totalItemCount: number,
  itemsPerPage: number
): void {
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new CutlineGenerationError('Page number must be a positive integer starting from 1');
  }

  if (!Number.isInteger(totalPages) || totalPages < 1) {
    throw new CutlineGenerationError('Total pages must be a positive integer');
  }

  if (pageNumber > totalPages) {
    throw new CutlineGenerationError(`Page number ${pageNumber} exceeds total pages ${totalPages}`);
  }

  if (!Number.isInteger(totalItemCount) || totalItemCount < 0) {
    throw new CutlineGenerationError('Total item count must be a non-negative integer');
  }

  if (!Number.isInteger(itemsPerPage) || itemsPerPage < 1) {
    throw new CutlineGenerationError('Items per page must be a positive integer');
  }

  // Validate that total items doesn't exceed total capacity
  const totalCapacity = totalPages * itemsPerPage;
  if (totalItemCount > totalCapacity) {
    throw new CutlineGenerationError(
      `Total items ${totalItemCount} exceeds total capacity ${totalCapacity} (${totalPages} pages × ${itemsPerPage} items/page)`
    );
  }
}

/**
 * Calculates page information for a specific page in a multi-page document
 * 
 * @param pageNumber - Page number (1-based)
 * @param totalItemCount - Total number of items across all pages
 * @param itemsPerPage - Items per page capacity
 * @returns Page information including item count and indices
 */
export function calculatePageInfo(
  pageNumber: number,
  totalItemCount: number,
  itemsPerPage: number
): PageInfo {
  const totalPages = Math.ceil(totalItemCount / itemsPerPage);
  
  validatePageInfo(pageNumber, totalPages, totalItemCount, itemsPerPage);

  const startItemIndex = (pageNumber - 1) * itemsPerPage;
  const endItemIndex = Math.min(startItemIndex + itemsPerPage - 1, totalItemCount - 1);
  const itemsOnPage = endItemIndex - startItemIndex + 1;
  const isPartialPage = itemsOnPage < itemsPerPage;

  return {
    pageNumber,
    totalPages,
    itemsOnPage,
    startItemIndex,
    endItemIndex,
    isPartialPage
  };
}

/**
 * Ensures consistent layout configuration across all pages
 * 
 * @param baseLayout - Base grid layout configuration
 * @param pageInfo - Information about the specific page
 * @returns Layout configuration adjusted for this page
 */
export function ensureConsistentLayout(baseLayout: GridLayout, pageInfo: PageInfo): GridLayout {
  validateGridLayout(baseLayout);

  // Create a copy of the base layout to avoid mutations
  const consistentLayout: GridLayout = {
    ...baseLayout,
    // Ensure page dimensions are consistent
    pageWidth: baseLayout.pageWidth,
    pageHeight: baseLayout.pageHeight,
    usableWidth: baseLayout.usableWidth,
    usableHeight: baseLayout.usableHeight,
    qrSize: baseLayout.qrSize,
    columns: baseLayout.columns,
    rows: baseLayout.rows,
    itemsPerPage: baseLayout.itemsPerPage,
    margins: { ...baseLayout.margins }
  };

  // For partial pages, the layout remains the same but fewer items will be positioned
  // The grid structure should be consistent regardless of item count

  return consistentLayout;
}

/**
 * Creates consistent cutline options for multi-page documents
 * 
 * @param baseOptions - Base cutline options
 * @param pageInfo - Information about the specific page
 * @returns Cutline options adjusted for this page
 */
export function createConsistentCutlineOptions(
  baseOptions: MultiPageCutlineOptions,
  pageInfo: PageInfo
): CutlineGridOptions {
  const options: CutlineGridOptions = {
    // Ensure line styling is consistent across all pages
    lineOptions: baseOptions.lineOptions || DEFAULT_CUTLINE_OPTIONS,
    drawBorder: baseOptions.drawBorder !== false, // Default to true
    extendToMargins: baseOptions.extendToMargins !== false, // Default to true
    // Set actual item count for this page (affects row boundary calculation)
    actualItemCount: pageInfo.itemsOnPage
  };

  return options;
}

/**
 * Adds cutlines to a specific page with guaranteed consistency across multi-page documents
 * 
 * @param doc - PDF document
 * @param pageNumber - Page number to add cutlines to (1-based)
 * @param layout - Grid layout configuration
 * @param totalItemCount - Total number of items across all pages
 * @param options - Multi-page cutline options
 */
export function addPageCutlines(
  doc: PDFDocument,
  pageNumber: number,
  layout: GridLayout,
  totalItemCount: number,
  options: MultiPageCutlineOptions = DEFAULT_CUTLINE_GRID_OPTIONS
): void {
  if (!doc) {
    throw new CutlineGenerationError('PDF document is required for adding page cutlines');
  }

  // Validate inputs
  validateGridLayout(layout);
  
  const itemsPerPage = options.itemsPerPage || layout.itemsPerPage;
  const pageInfo = calculatePageInfo(pageNumber, totalItemCount, itemsPerPage);

  // Get the specific page from the document
  const pages = doc.getPages();
  if (pageNumber > pages.length) {
    throw new CutlineGenerationError(
      `Page ${pageNumber} does not exist in document (only ${pages.length} pages available)`
    );
  }

  const page = pages[pageNumber - 1]; // Convert to 0-based index

  // Ensure consistent layout across all pages
  const consistentLayout = ensureConsistentLayout(layout, pageInfo);

  // Create consistent cutline options for this page
  const consistentOptions = createConsistentCutlineOptions(options, pageInfo);

  // Generate cutlines for this page
  generateCutlineGrid(page, consistentLayout, consistentOptions);
}

/**
 * Adds cutlines to all pages in a multi-page document with guaranteed consistency
 * 
 * @param doc - PDF document
 * @param layout - Grid layout configuration
 * @param totalItemCount - Total number of items across all pages
 * @param options - Multi-page cutline options
 */
export function addAllPagesCutlines(
  doc: PDFDocument,
  layout: GridLayout,
  totalItemCount: number,
  options: MultiPageCutlineOptions = DEFAULT_CUTLINE_GRID_OPTIONS
): void {
  if (!doc) {
    throw new CutlineGenerationError('PDF document is required for adding cutlines to all pages');
  }

  validateGridLayout(layout);

  const itemsPerPage = options.itemsPerPage || layout.itemsPerPage;
  const totalPages = Math.ceil(totalItemCount / itemsPerPage);
  const documentPages = doc.getPages();

  if (documentPages.length !== totalPages) {
    throw new CutlineGenerationError(
      `Document has ${documentPages.length} pages but expected ${totalPages} pages for ${totalItemCount} items`
    );
  }

  // Add cutlines to each page
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    addPageCutlines(doc, pageNumber, layout, totalItemCount, options);
  }
}
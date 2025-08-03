/**
 * PDF Geometry and Coordinate System Utilities for REQ-013
 * Professional PDF QR Code Printing System with Vector Cutlines
 * 
 * This module provides mathematical utilities for precise coordinate conversion
 * between different measurement units with sub-pixel accuracy required for
 * professional printing alignment.
 */

/**
 * Mathematical constants for coordinate conversion
 * Based on PDF specification: 1 point = 1/72 inch = 0.352777778 mm
 */
export const CONVERSION_CONSTANTS = {
  /** Points per inch (PDF standard) */
  POINTS_PER_INCH: 72,
  /** Millimeters per inch */
  MM_PER_INCH: 25.4,
  /** Points per millimeter: 72 / 25.4 = 2.834645669291339 */
  POINTS_PER_MM: 72 / 25.4,
  /** Millimeters per point: 25.4 / 72 = 0.3527777777777778 */
  MM_PER_POINT: 25.4 / 72,
  /** Default DPI for pixel calculations */
  DEFAULT_DPI: 72
} as const;

/**
 * Error types for coordinate conversion failures
 */
export class CoordinateConversionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'CoordinateConversionError';
  }
}

/**
 * Interface for coordinate validation results
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Converts millimeters to points with high precision
 * 
 * @param mm - Value in millimeters to convert
 * @returns Value in points (1mm = 2.834645669291339 points)
 * 
 * @example
 * ```typescript
 * const points = convertMillimetersToPoints(10); // 28.34645669291339
 * const margin = convertMillimetersToPoints(5.5); // 15.590651381102365
 * ```
 */
export function convertMillimetersToPoints(mm: number): number {
  // Validate input
  const validation = validateNumericInput(mm, 'millimeters');
  if (!validation.isValid) {
    throw new CoordinateConversionError(validation.error!);
  }
  
  // Convert with high precision
  return mm * CONVERSION_CONSTANTS.POINTS_PER_MM;
}

/**
 * Converts points to millimeters with high precision
 * 
 * @param pts - Value in points to convert
 * @returns Value in millimeters (1 point = 0.3527777777777778 mm)
 * 
 * @example
 * ```typescript
 * const mm = convertPointsToMillimeters(72); // 25.4 (exactly 1 inch)
 * const pageWidthMM = convertPointsToMillimeters(595.28); // ~210 (A4 width)
 * ```
 */
export function convertPointsToMillimeters(pts: number): number {
  // Validate input
  const validation = validateNumericInput(pts, 'points');
  if (!validation.isValid) {
    throw new CoordinateConversionError(validation.error!);
  }
  
  // Convert with high precision
  return pts * CONVERSION_CONSTANTS.MM_PER_POINT;
}

/**
 * Converts pixels to points based on DPI
 * 
 * @param px - Value in pixels to convert
 * @param dpi - Dots per inch (default: 72)
 * @returns Value in points
 * 
 * @example
 * ```typescript
 * const points = convertPixelsToPoints(96, 96); // 72 points (1 inch at 96 DPI)
 * const standardPoints = convertPixelsToPoints(100); // 100 points (at default 72 DPI)
 * ```
 */
export function convertPixelsToPoints(px: number, dpi: number = CONVERSION_CONSTANTS.DEFAULT_DPI): number {
  // Validate inputs
  const pxValidation = validateNumericInput(px, 'pixels');
  if (!pxValidation.isValid) {
    throw new CoordinateConversionError(pxValidation.error!);
  }
  
  const dpiValidation = validateDPIInput(dpi);
  if (!dpiValidation.isValid) {
    throw new CoordinateConversionError(dpiValidation.error!);
  }
  
  // Convert: pixels * (points_per_inch / dpi)
  return px * (CONVERSION_CONSTANTS.POINTS_PER_INCH / dpi);
}

/**
 * Converts points to pixels based on DPI
 * 
 * @param pts - Value in points to convert
 * @param dpi - Dots per inch (default: 72)
 * @returns Value in pixels
 * 
 * @example
 * ```typescript
 * const pixels = convertPointsToPixels(72, 96); // 96 pixels (1 inch at 96 DPI)
 * const webPixels = convertPointsToPixels(36, 72); // 36 pixels (0.5 inch at 72 DPI)
 * ```
 */
export function convertPointsToPixels(pts: number, dpi: number = CONVERSION_CONSTANTS.DEFAULT_DPI): number {
  // Validate inputs
  const ptsValidation = validateNumericInput(pts, 'points');
  if (!ptsValidation.isValid) {
    throw new CoordinateConversionError(ptsValidation.error!);
  }
  
  const dpiValidation = validateDPIInput(dpi);
  if (!dpiValidation.isValid) {
    throw new CoordinateConversionError(dpiValidation.error!);
  }
  
  // Convert: points * (dpi / points_per_inch)
  return pts * (dpi / CONVERSION_CONSTANTS.POINTS_PER_INCH);
}

/**
 * Converts inches to points
 * 
 * @param inches - Value in inches to convert
 * @returns Value in points (1 inch = 72 points)
 * 
 * @example
 * ```typescript
 * const points = convertInchesToPoints(1); // 72
 * const halfInch = convertInchesToPoints(0.5); // 36
 * ```
 */
export function convertInchesToPoints(inches: number): number {
  const validation = validateNumericInput(inches, 'inches');
  if (!validation.isValid) {
    throw new CoordinateConversionError(validation.error!);
  }
  
  return inches * CONVERSION_CONSTANTS.POINTS_PER_INCH;
}

/**
 * Converts points to inches
 * 
 * @param pts - Value in points to convert
 * @returns Value in inches (72 points = 1 inch)
 * 
 * @example
 * ```typescript
 * const inches = convertPointsToInches(72); // 1
 * const letterWidth = convertPointsToInches(612); // 8.5
 * ```
 */
export function convertPointsToInches(pts: number): number {
  const validation = validateNumericInput(pts, 'points');
  if (!validation.isValid) {
    throw new CoordinateConversionError(validation.error!);
  }
  
  return pts / CONVERSION_CONSTANTS.POINTS_PER_INCH;
}

/**
 * Validates numeric input for coordinate conversion
 * 
 * @param value - Numeric value to validate
 * @param unit - Unit name for error messages
 * @returns Validation result
 */
function validateNumericInput(value: number, unit: string): ValidationResult {
  if (typeof value !== 'number') {
    return {
      isValid: false,
      error: `Invalid ${unit} value: must be a number, got ${typeof value}`
    };
  }
  
  if (!isFinite(value)) {
    return {
      isValid: false,
      error: `Invalid ${unit} value: must be finite, got ${value}`
    };
  }
  
  if (isNaN(value)) {
    return {
      isValid: false,
      error: `Invalid ${unit} value: cannot be NaN`
    };
  }
  
  // Check for reasonable ranges (prevent obvious errors)
  const MAX_REASONABLE_VALUE = 1000000; // 1M units should be enough for any document
  if (Math.abs(value) > MAX_REASONABLE_VALUE) {
    return {
      isValid: false,
      error: `Invalid ${unit} value: ${value} exceeds reasonable range (±${MAX_REASONABLE_VALUE})`
    };
  }
  
  return { isValid: true };
}

/**
 * Validates DPI input
 * 
 * @param dpi - DPI value to validate
 * @returns Validation result
 */
function validateDPIInput(dpi: number): ValidationResult {
  const baseValidation = validateNumericInput(dpi, 'DPI');
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  
  if (dpi <= 0) {
    return {
      isValid: false,
      error: `Invalid DPI value: must be positive, got ${dpi}`
    };
  }
  
  // Check for reasonable DPI range
  const MIN_DPI = 1;
  const MAX_DPI = 10000; // Support very high-resolution printing
  
  if (dpi < MIN_DPI || dpi > MAX_DPI) {
    return {
      isValid: false,
      error: `Invalid DPI value: ${dpi} outside reasonable range (${MIN_DPI}-${MAX_DPI})`
    };
  }
  
  return { isValid: true };
}

/**
 * Rounds coordinate to specified precision to avoid floating point issues
 * 
 * @param value - Value to round
 * @param precision - Number of decimal places (default: 6)
 * @returns Rounded value
 * 
 * @example
 * ```typescript
 * const precise = roundToPrecision(123.456789123, 3); // 123.457
 * const coord = roundToPrecision(28.346456692913385, 6); // 28.346457
 * ```
 */
export function roundToPrecision(value: number, precision: number = 6): number {
  const validation = validateNumericInput(value, 'value');
  if (!validation.isValid) {
    throw new CoordinateConversionError(validation.error!);
  }
  
  if (!Number.isInteger(precision) || precision < 0 || precision > 15) {
    throw new CoordinateConversionError(`Invalid precision: must be integer 0-15, got ${precision}`);
  }
  
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

/**
 * Utility object with all conversion functions for easy access
 */
export const CoordinateConverter = {
  mmToPoints: convertMillimetersToPoints,
  pointsToMm: convertPointsToMillimeters,
  pxToPoints: convertPixelsToPoints,
  pointsToPx: convertPointsToPixels,
  inchesToPoints: convertInchesToPoints,
  pointsToInches: convertPointsToInches,
  round: roundToPrecision,
  constants: CONVERSION_CONSTANTS
} as const;

/**
 * Type for supported measurement units
 */
export type MeasurementUnit = 'mm' | 'pt' | 'px' | 'in';

/**
 * Supported page formats for PDF generation
 */
export type PageFormat = 'A4' | 'Letter';

/**
 * Interface for page dimensions
 */
export interface PageDimensions {
  width: number;
  height: number;
  unit: 'pt';
}

/**
 * Interface for usable area after margins
 */
export interface UsableArea {
  width: number;
  height: number;
  x: number;
  y: number;
  unit: 'pt';
}

/**
 * Calculates page dimensions for different paper formats in points
 * 
 * @param format - Page format ('A4' or 'Letter')
 * @returns Page dimensions in points
 * 
 * @example
 * ```typescript
 * const a4 = calculatePageDimensions('A4');
 * // { width: 595.28, height: 841.89, unit: 'pt' }
 * 
 * const letter = calculatePageDimensions('Letter');
 * // { width: 612, height: 792, unit: 'pt' }
 * ```
 */
export function calculatePageDimensions(format: PageFormat): PageDimensions {
  switch (format) {
    case 'A4':
      // A4: 210mm × 297mm
      return {
        width: 595.28,  // 210mm in points
        height: 841.89, // 297mm in points
        unit: 'pt'
      };
    case 'Letter':
      // Letter: 8.5in × 11in
      return {
        width: 612,  // 8.5in in points
        height: 792, // 11in in points
        unit: 'pt'
      };
    default:
      throw new CoordinateConversionError(`Unsupported page format: ${format}`);
  }
}

/**
 * Calculates usable area after applying margins
 * 
 * @param pageWidth - Page width in points
 * @param pageHeight - Page height in points  
 * @param margins - Margin size in millimeters
 * @returns Usable area dimensions and position
 * 
 * @example
 * ```typescript
 * const a4 = calculatePageDimensions('A4');
 * const usable = calculateUsableArea(a4.width, a4.height, 10);
 * // Returns area with 10mm margins on all sides
 * ```
 */
export function calculateUsableArea(
  pageWidth: number, 
  pageHeight: number, 
  margins: number
): UsableArea {
  // Validate inputs
  const pageWidthValidation = validateNumericInput(pageWidth, 'page width');
  if (!pageWidthValidation.isValid) {
    throw new CoordinateConversionError(pageWidthValidation.error!);
  }
  
  const pageHeightValidation = validateNumericInput(pageHeight, 'page height');
  if (!pageHeightValidation.isValid) {
    throw new CoordinateConversionError(pageHeightValidation.error!);
  }
  
  const marginsValidation = validateMarginInput(margins);
  if (!marginsValidation.isValid) {
    throw new CoordinateConversionError(marginsValidation.error!);
  }
  
  // Convert margins from mm to points
  const marginsInPoints = convertMillimetersToPoints(margins);
  
  // Calculate usable dimensions
  const usableWidth = pageWidth - (2 * marginsInPoints);
  const usableHeight = pageHeight - (2 * marginsInPoints);
  
  // Validate that usable area is positive
  if (usableWidth <= 0 || usableHeight <= 0) {
    throw new CoordinateConversionError(
      `Margins too large: ${margins}mm margins result in negative usable area ` +
      `(page: ${pageWidth}×${pageHeight}pt, margins: ${marginsInPoints}pt each)`
    );
  }
  
  return {
    width: usableWidth,
    height: usableHeight,
    x: marginsInPoints,
    y: marginsInPoints,
    unit: 'pt'
  };
}

/**
 * Validates margin input
 * 
 * @param margins - Margin value in millimeters to validate
 * @returns Validation result
 */
function validateMarginInput(margins: number): ValidationResult {
  const baseValidation = validateNumericInput(margins, 'margins');
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  
  // Check margin range (5mm minimum, 25mm maximum for reasonable printing)
  const MIN_MARGIN_MM = 5;
  const MAX_MARGIN_MM = 25;
  
  if (margins < MIN_MARGIN_MM) {
    return {
      isValid: false,
      error: `Margin too small: ${margins}mm, minimum is ${MIN_MARGIN_MM}mm for professional printing`
    };
  }
  
  if (margins > MAX_MARGIN_MM) {
    return {
      isValid: false,
      error: `Margin too large: ${margins}mm, maximum is ${MAX_MARGIN_MM}mm for efficient space usage`
    };
  }
  
  return { isValid: true };
}

/**
 * Converts page dimensions from one format to points
 * 
 * @param width - Width value
 * @param height - Height value
 * @param unit - Source unit
 * @returns Page dimensions in points
 */
export function convertPageDimensionsToPoints(
  width: number, 
  height: number, 
  unit: MeasurementUnit
): PageDimensions {
  const widthPoint = convertCoordinateToPoints({ x: width, y: 0, unit }).x;
  const heightPoint = convertCoordinateToPoints({ x: 0, y: height, unit }).y;
  
  return {
    width: widthPoint,
    height: heightPoint,
    unit: 'pt'
  };
}

/**
 * Gets standard page dimensions with validation
 * 
 * @param format - Page format
 * @param margins - Margin size in mm (optional)
 * @returns Object with page dimensions and usable area
 */
export function getStandardPageLayout(format: PageFormat, margins?: number) {
  const pageDims = calculatePageDimensions(format);
  
  if (margins !== undefined) {
    const usableArea = calculateUsableArea(pageDims.width, pageDims.height, margins);
    return {
      page: pageDims,
      usable: usableArea,
      margins: {
        top: usableArea.y,
        right: pageDims.width - usableArea.x - usableArea.width,
        bottom: pageDims.height - usableArea.y - usableArea.height,
        left: usableArea.x,
        unit: 'pt' as const
      }
    };
  }
  
  return {
    page: pageDims,
    usable: null,
    margins: null
  };
}

/**
 * Interface for grid layout configuration
 */
export interface GridLayout {
  /** Number of columns in the grid */
  columns: number;
  /** Number of rows in the grid */
  rows: number;
  /** Width of each QR cell in points */
  cellWidth: number;
  /** Height of each QR cell in points */
  cellHeight: number;
  /** Total items that fit on one page */
  itemsPerPage: number;
  /** Starting X coordinate for the grid */
  startX: number;
  /** Starting Y coordinate for the grid */
  startY: number;
  /** QR code size within each cell in points */
  qrSize: number;
  /** Available width for the grid in points */
  gridWidth: number;
  /** Available height for the grid in points */
  gridHeight: number;
  /** Unit of measurement */
  unit: 'pt';
  /** Page width in points */
  pageWidth: number;
  /** Page height in points */
  pageHeight: number;
  /** Usable width (page width minus margins) in points */
  usableWidth: number;
  /** Usable height (page height minus margins) in points */
  usableHeight: number;
  /** Page margins configuration */
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    unit: 'pt';
  };
}

/**
 * Interface for cell position in grid
 */
export interface CellPosition {
  /** X coordinate of cell origin */
  x: number;
  /** Y coordinate of cell origin */
  y: number;
  /** Column index (0-based) */
  col: number;
  /** Row index (0-based) */
  row: number;
  /** Cell index in sequence (0-based) */
  index: number;
  /** Unit of measurement */
  unit: 'pt';
}

/**
 * Calculates optimal grid layout for QR codes on a page
 * 
 * @param pageWidth - Page width in points
 * @param pageHeight - Page height in points  
 * @param margins - Margin size in millimeters
 * @param qrSize - QR code size in millimeters
 * @returns Grid layout configuration
 * 
 * @example
 * ```typescript
 * const layout = calculateGridLayout(595.28, 841.89, 10, 40);
 * // Returns grid configuration for 40mm QR codes on A4 with 10mm margins
 * ```
 */
export function calculateGridLayout(
  pageWidth: number,
  pageHeight: number,
  margins: number,
  qrSize: number
): GridLayout {
  // Validate inputs
  const pageWidthValidation = validateNumericInput(pageWidth, 'page width');
  if (!pageWidthValidation.isValid) {
    throw new CoordinateConversionError(pageWidthValidation.error!);
  }
  
  const pageHeightValidation = validateNumericInput(pageHeight, 'page height');
  if (!pageHeightValidation.isValid) {
    throw new CoordinateConversionError(pageHeightValidation.error!);
  }
  
  const marginsValidation = validateMarginInput(margins);
  if (!marginsValidation.isValid) {
    throw new CoordinateConversionError(marginsValidation.error!);
  }
  
  const qrValidation = validateQRSizeInput(qrSize);
  if (!qrValidation.isValid) {
    throw new CoordinateConversionError(qrValidation.error!);
  }
  
  // Calculate usable area
  const usableArea = calculateUsableArea(pageWidth, pageHeight, margins);
  
  // Convert QR size from mm to points
  const qrSizePoints = convertMillimetersToPoints(qrSize);
  
  // Calculate number of columns: floor((usable_width) / qr_size)
  const columns = Math.floor(usableArea.width / qrSizePoints);
  
  // Calculate number of rows: floor((usable_height) / qr_size)  
  const rows = Math.floor(usableArea.height / qrSizePoints);
  
  // Validate that we can fit at least one QR code
  if (columns < 1 || rows < 1) {
    throw new CoordinateConversionError(
      `QR size too large: ${qrSize}mm QR codes don't fit in usable area ` +
      `(${convertPointsToMillimeters(usableArea.width).toFixed(1)}mm × ${convertPointsToMillimeters(usableArea.height).toFixed(1)}mm)`
    );
  }
  
  // Calculate actual cell dimensions (might be larger than QR size for centering)
  const cellWidth = usableArea.width / columns;
  const cellHeight = usableArea.height / rows;
  
  // Grid starts at usable area origin
  const startX = usableArea.x;
  const startY = usableArea.y;
  
  // Convert margins from mm to points for the margins object
  const marginsPoints = convertMillimetersToPoints(margins);
  
  const DEBUG_PREFIX = "🔍 PDF_DEBUG_013:";
  const result = {
    // Original properties
    columns,
    rows,
    cellWidth,
    cellHeight,
    itemsPerPage: columns * rows,
    startX,
    startY,
    qrSize: qrSizePoints,
    gridWidth: usableArea.width,
    gridHeight: usableArea.height,
    unit: 'pt',
    // Additional properties needed by cutlines system
    pageWidth,
    pageHeight,
    usableWidth: usableArea.width,
    usableHeight: usableArea.height,
    margins: {
      top: marginsPoints,
      right: marginsPoints,
      bottom: marginsPoints,
      left: marginsPoints,
      unit: 'pt' as const
    }
  };
  
  console.log(`${DEBUG_PREFIX} CALCULATE_GRID_LAYOUT_RESULT:`, {
    inputQrSize: qrSize,
    qrSizePoints: qrSizePoints,
    resultQrSize: result.qrSize,
    resultKeys: Object.keys(result),
    resultType: typeof result
  });
  
  return result;
}

/**
 * Gets the position of a specific QR cell in the grid
 * 
 * @param row - Row index (0-based)
 * @param col - Column index (0-based) 
 * @param layout - Grid layout configuration
 * @returns Cell position with coordinates
 * 
 * @example
 * ```typescript
 * const layout = calculateGridLayout(595.28, 841.89, 10, 40);
 * const pos = getQRCellPosition(0, 1, layout); // Second cell in first row
 * ```
 */
export function getQRCellPosition(row: number, col: number, layout: GridLayout): CellPosition {
  // Validate inputs
  if (!Number.isInteger(row) || row < 0 || row >= layout.rows) {
    throw new CoordinateConversionError(`Invalid row index: ${row} (must be 0-${layout.rows - 1})`);
  }
  
  if (!Number.isInteger(col) || col < 0 || col >= layout.columns) {
    throw new CoordinateConversionError(`Invalid column index: ${col} (must be 0-${layout.columns - 1})`);
  }
  
  // Calculate cell position
  const x = layout.startX + (col * layout.cellWidth);
  const y = layout.startY + (row * layout.cellHeight);
  const index = (row * layout.columns) + col;
  
  return {
    x,
    y,
    col,
    row,
    index,
    unit: 'pt'
  };
}

/**
 * Calculates total number of pages needed for given item count
 * 
 * @param itemCount - Total number of items to layout
 * @param itemsPerPage - Items that fit on one page
 * @returns Number of pages required
 * 
 * @example
 * ```typescript
 * const pages = calculateTotalPages(25, 12); // 3 pages needed
 * ```
 */
export function calculateTotalPages(itemCount: number, itemsPerPage: number): number {
  // 🔍 DEBUG: Log function input parameters
  const DEBUG_PREFIX = "🔍 PDF_DEBUG_013:";
  console.log(`${DEBUG_PREFIX} CALCULATE_TOTAL_PAGES_INPUT:`, {
    itemCount: itemCount,
    itemCountType: typeof itemCount,
    itemCountIsNumber: typeof itemCount === 'number',
    itemCountIsInteger: Number.isInteger(itemCount),
    itemsPerPage: itemsPerPage,
    itemsPerPageType: typeof itemsPerPage,
    itemsPerPageIsNumber: typeof itemsPerPage === 'number',
    itemsPerPageIsInteger: Number.isInteger(itemsPerPage)
  });

  // Validate inputs
  if (!Number.isInteger(itemCount) || itemCount < 0) {
    console.log(`${DEBUG_PREFIX} VALIDATION_ERROR_ITEM_COUNT:`, {
      itemCount: itemCount,
      itemCountType: typeof itemCount,
      isInteger: Number.isInteger(itemCount),
      isNonNegative: itemCount >= 0
    });
    throw new CoordinateConversionError(`Invalid item count: ${itemCount} (must be non-negative integer)`);
  }
  
  if (!Number.isInteger(itemsPerPage) || itemsPerPage < 1) {
    throw new CoordinateConversionError(`Invalid items per page: ${itemsPerPage} (must be positive integer)`);
  }
  
  if (itemCount === 0) {
    return 0;
  }
  
  return Math.ceil(itemCount / itemsPerPage);
}

/**
 * Gets positions for all items across multiple pages
 * 
 * @param itemCount - Total number of items
 * @param layout - Grid layout for one page
 * @returns Array of positions for each item with page information
 */
export function getAllItemPositions(itemCount: number, layout: GridLayout) {
  // 🔍 DEBUG: Log function input parameters
  const DEBUG_PREFIX = "🔍 PDF_DEBUG_013:";
  console.log(`${DEBUG_PREFIX} GET_ALL_ITEM_POSITIONS_INPUT:`, {
    itemCount: itemCount,
    itemCountType: typeof itemCount,
    layout: layout,
    layoutType: typeof layout,
    layoutItemsPerPage: layout?.itemsPerPage,
    layoutItemsPerPageType: typeof layout?.itemsPerPage
  });

  const totalPages = calculateTotalPages(itemCount, layout.itemsPerPage);
  console.log(`${DEBUG_PREFIX} GET_ALL_ITEM_POSITIONS_TOTAL_PAGES:`, {
    totalPages: totalPages,
    totalPagesType: typeof totalPages
  });
  
  const positions: Array<CellPosition & { page: number; globalIndex: number }> = [];
  
  for (let globalIndex = 0; globalIndex < itemCount; globalIndex++) {
    const page = Math.floor(globalIndex / layout.itemsPerPage);
    const pageIndex = globalIndex % layout.itemsPerPage;
    const row = Math.floor(pageIndex / layout.columns);
    const col = pageIndex % layout.columns;
    
    const cellPos = getQRCellPosition(row, col, layout);
    
    positions.push({
      ...cellPos,
      page,
      globalIndex
    });
  }
  
  return {
    positions,
    totalPages,
    itemsPerPage: layout.itemsPerPage
  };
}

/**
 * Validates QR size input
 * 
 * @param qrSize - QR size in millimeters to validate
 * @returns Validation result
 */
function validateQRSizeInput(qrSize: number): ValidationResult {
  const baseValidation = validateNumericInput(qrSize, 'QR size');
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  
  // Check QR size range (10mm minimum, 100mm maximum for reasonable printing)
  const MIN_QR_SIZE_MM = 10;
  const MAX_QR_SIZE_MM = 100;
  
  if (qrSize < MIN_QR_SIZE_MM) {
    return {
      isValid: false,
      error: `QR size too small: ${qrSize}mm, minimum is ${MIN_QR_SIZE_MM}mm for readability`
    };
  }
  
  if (qrSize > MAX_QR_SIZE_MM) {
    return {
      isValid: false,
      error: `QR size too large: ${qrSize}mm, maximum is ${MAX_QR_SIZE_MM}mm for efficient space usage`
    };
  }
  
  return { isValid: true };
}

/**
 * Calculates optimal QR size for maximum items per page
 * 
 * @param pageWidth - Page width in points
 * @param pageHeight - Page height in points
 * @param margins - Margin size in millimeters
 * @param targetItemCount - Target number of items to fit (optional)
 * @returns Optimal QR size in millimeters
 */
export function calculateOptimalQRSize(
  pageWidth: number,
  pageHeight: number,
  margins: number,
  targetItemCount?: number
): number {
  const usableArea = calculateUsableArea(pageWidth, pageHeight, margins);
  const usableWidthMm = convertPointsToMillimeters(usableArea.width);
  const usableHeightMm = convertPointsToMillimeters(usableArea.height);
  
  if (targetItemCount) {
    // Calculate QR size to fit target number of items
    const aspectRatio = usableWidthMm / usableHeightMm;
    const cols = Math.ceil(Math.sqrt(targetItemCount * aspectRatio));
    const rows = Math.ceil(targetItemCount / cols);
    
    const qrWidthMm = usableWidthMm / cols;
    const qrHeightMm = usableHeightMm / rows;
    
    const optimalSize = Math.min(qrWidthMm, qrHeightMm);
    
    // Ensure it's within valid range
    return Math.max(10, Math.min(100, Math.floor(optimalSize)));
  } else {
    // Calculate maximum QR size (single item)
    const maxSize = Math.min(usableWidthMm, usableHeightMm);
    return Math.max(10, Math.min(100, Math.floor(maxSize)));
  }
}

/**
 * Interface for coordinate point with unit
 */
export interface CoordinatePoint {
  x: number;
  y: number;
  unit: MeasurementUnit;
}

/**
 * Converts a coordinate point to points
 * 
 * @param point - Coordinate point with unit
 * @param dpi - DPI for pixel conversion (default: 72)
 * @returns Coordinate point in points
 */
export function convertCoordinateToPoints(point: CoordinatePoint, dpi?: number): CoordinatePoint {
  switch (point.unit) {
    case 'pt':
      return { ...point, unit: 'pt' };
    case 'mm':
      return {
        x: convertMillimetersToPoints(point.x),
        y: convertMillimetersToPoints(point.y),
        unit: 'pt'
      };
    case 'px':
      return {
        x: convertPixelsToPoints(point.x, dpi),
        y: convertPixelsToPoints(point.y, dpi),
        unit: 'pt'
      };
    case 'in':
      return {
        x: convertInchesToPoints(point.x),
        y: convertInchesToPoints(point.y),
        unit: 'pt'
      };
    default:
      throw new CoordinateConversionError(`Unsupported unit: ${(point as any).unit}`);
  }
}
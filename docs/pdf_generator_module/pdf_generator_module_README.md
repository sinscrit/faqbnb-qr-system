# PDF QR Code Generator Module

A reusable Node.js module for generating professional PDF layouts with QR code placeholders. Perfect for creating printable QR code sheets for hospitality, office management, inventory tracking, and more.

## Features

- **Multiple Layout Modes**: Adaptive grid layout and fixed box positioning
- **Flexible Paper Sizes**: A0-A6, Letter, Legal, Tabloid, Ledger
- **Custom Margins**: Predefined (none, thin, standard, large) or custom measurements
- **QR Code Sizing**: Predefined sizes or custom dimensions in cm, mm, or inches
- **Professional Cutlines**: Vector cutlines for precise cutting
- **Multiple Output Formats**: File save, Buffer for web responses
- **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install pdfkit
```

Copy the module files to your project:
- `pdf_generator_module.js` - Main module
- `pdf_generator_module.d.ts` - TypeScript declarations (optional)

## Quick Start

```javascript
const { generateSinglePDF, generatePDFBuffer } = require('./pdf_generator_module');

// Generate a simple QR code sheet
const config = {
  paperSize: "A4",
  margin: "standard",
  qrCodeCount: 4,
  qrCodesPerRow: 2,
  qrCodeSize: "medium",
  showCutlines: true,
  outputFileName: "my-qr-codes.pdf",
  qrCodes: [
    { id: "qr-1", label: "WiFi Password" },
    { id: "qr-2", label: "Guest Guide" },
    { id: "qr-3", label: "Emergency Info" },
    { id: "qr-4", label: "Check-out Instructions" }
  ]
};

// Save to file
const result = await generateSinglePDF(config, 'output');
console.log(result.success ? `Generated: ${result.outputPath}` : `Error: ${result.error}`);

// Generate as Buffer (for web responses)
const pdfBuffer = await generatePDFBuffer(config);
```

## API Reference

### Functions

#### `generateSinglePDF(config, outputDir?)`
Generate a single PDF from configuration object.

**Parameters:**
- `config` (Object): PDF configuration
- `outputDir` (String, optional): Output directory (default: 'tmp')

**Returns:** Promise<PDFGenerationResult>

#### `generatePDFsFromJSON(jsonString, outputDir?)`
Generate multiple PDFs from JSON string.

**Parameters:**
- `jsonString` (String): JSON string with array of configurations
- `outputDir` (String, optional): Output directory (default: 'tmp')

**Returns:** Promise<PDFGenerationResult[]>

#### `generatePDFBuffer(config)`
Generate PDF as Buffer for web applications.

**Parameters:**
- `config` (Object): PDF configuration

**Returns:** Promise<Buffer>

### Configuration Object

```javascript
{
  paperSize: "A4",           // Paper size: A0-A6, Letter, Legal, Tabloid, Ledger
  margin: "standard",        // Margin: "none", "thin", "standard", "large", or custom (e.g., "2cm", "1in")
  qrCodeCount: 4,           // Number of QR codes to generate
  qrCodesPerRow: 2,         // QR codes per row
  qrCodeSize: "medium",     // Size: "small", "medium", "large", or custom (e.g., "3cm", "1.5in")
  qrBoxMargin: null,        // Box margin for fixed layout (null = adaptive grid)
  showCutlines: true,       // Show cutting guides
  debug: false,             // Show visual debug guides (borders, margin boxes) - default: false
  outputFileName: "qr-codes.pdf", // Output filename
  qrCodes: [                // QR code data
    { id: "qr-1", label: "Label 1" },
    { id: "qr-2", label: "Label 2" }
  ]
}
```

## Layout Modes

### Adaptive Grid Layout (Default)
QR codes automatically scale to fit the available space in a grid.

```javascript
{
  qrBoxMargin: null,  // Enables adaptive mode
  qrCodeSize: "medium" // Scales relative to available space
}
```

### Fixed Box Layout
QR codes have specific sizes with defined margins between boxes.

```javascript
{
  qrBoxMargin: "1cm",  // Fixed spacing between boxes
  qrCodeSize: "3cm"    // Fixed QR code size
}
```

## Debug Mode

The `debug` parameter controls the visibility of visual guides that help with layout development and troubleshooting.

### Debug = true (Development Mode)
Shows visual guides for layout debugging:
- **Red page border**: Indicates the page boundaries
- **Grey margin guides**: Shows the margin area
- **Grey box outlines**: Shows individual QR code box boundaries (fixed layout only)

```javascript
{
  debug: true,
  showCutlines: true  // Can be combined with cutlines
}
```

### Debug = false (Production Mode - Default)
Clean output without visual guides:
- No page borders
- No margin guides  
- No box outlines
- Only QR codes, labels, and cutlines (if enabled)

```javascript
{
  debug: false,  // Default value
  showCutlines: true  // Cutlines still shown if enabled
}
```

**Note:** The `debug` parameter is separate from `showCutlines`. Cutlines are intended for actual cutting and remain visible even with `debug: false`.

## Examples

### Business Cards
```javascript
{
  paperSize: "A5",
  margin: "thin",
  qrCodeCount: 2,
  qrCodesPerRow: 1,
  qrCodeSize: "3cm",
  showCutlines: false,
  qrCodes: [
    { id: "card-1", label: "John Doe - Contact" },
    { id: "card-2", label: "Jane Smith - Contact" }
  ]
}
```

### Inventory Stickers
```javascript
{
  paperSize: "A4",
  margin: "none",
  qrCodeCount: 9,
  qrCodesPerRow: 3,
  qrCodeSize: "small",
  showCutlines: true,
  qrCodes: [
    { id: "inv-001", label: "Computer #1" },
    { id: "inv-002", label: "Monitor #1" },
    // ... more items
  ]
}
```

### Hotel Room Guide
```javascript
{
  paperSize: "Letter",
  margin: "1in",
  qrCodeCount: 6,
  qrCodesPerRow: 3,
  qrCodeSize: "large",
  qrBoxMargin: "5mm",
  showCutlines: true,
  qrCodes: [
    { id: "room-101", label: "WiFi Instructions" },
    { id: "room-102", label: "TV Guide" },
    { id: "room-103", label: "Room Service" },
    { id: "room-104", label: "Check-out" },
    { id: "room-105", label: "Emergency" },
    { id: "room-106", label: "Concierge" }
  ]
}
```

## Express.js Integration

```javascript
const express = require('express');
const { generatePDFBuffer, generateSinglePDF } = require('./pdf_generator_module');

const app = express();
app.use(express.json());

// API endpoint for direct PDF download
app.post('/api/generate-qr-pdf', async (req, res) => {
  try {
    const pdfBuffer = await generatePDFBuffer(req.body);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to save PDF on server
app.post('/api/save-qr-pdf', async (req, res) => {
  try {
    const result = await generateSinglePDF(req.body, 'uploads');
    
    if (result.success) {
      res.json({ 
        success: true, 
        downloadUrl: `/downloads/${path.basename(result.outputPath)}`
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Units and Measurements

The module supports various measurement units:

- **Points**: Default PDF unit (72 points = 1 inch)
- **Centimeters**: Use "cm" suffix (e.g., "2.5cm")
- **Millimeters**: Use "mm" suffix (e.g., "25mm")
- **Inches**: Use "in" suffix (e.g., "1in")

## Paper Sizes

| Size | Dimensions (points) | Dimensions (mm) |
|------|-------------------|-----------------|
| A4 | 595.28 × 841.89 | 210 × 297 |
| A5 | 419.53 × 595.28 | 148 × 210 |
| Letter | 612 × 792 | 216 × 279 |
| Legal | 612 × 1008 | 216 × 356 |

## Error Handling

All functions return structured results with error information:

```javascript
{
  success: boolean,
  outputPath: string,
  error?: string,     // Only present if success is false
  config: Object      // The configuration used
}
```

## Dependencies

- **pdfkit**: For PDF generation
- **fs**: File system operations (Node.js built-in)
- **path**: Path utilities (Node.js built-in)

## TypeScript Support

Include the type definitions for full TypeScript support:

```typescript
import { generateSinglePDF, PDFConfig, PDFGenerationResult } from './pdf_generator_module';

const config: PDFConfig = {
  paperSize: "A4",
  qrCodeCount: 4,
  // ... other options
};

const result: PDFGenerationResult = await generateSinglePDF(config);
```

## License

This module is designed for integration into your applications. Modify and use as needed for your projects.
# PDF Generator Module - Installation and Usage Guide

The PDF Generator Module has been successfully integrated into the main application structure.

## 📁 **File Locations**

### **Core Module Files**
```
src/lib/pdf_generator_module.js     # Main JavaScript module
src/lib/pdf_generator_module.d.ts   # TypeScript declarations
src/lib/pdf-generator-qr-module.ts  # TypeScript integration wrapper
```

### **Documentation**
```
docs/pdf_generator_module/
├── pdf_generator_module_README.md                    # Main documentation
├── pdf_generator_module_docs_index.md               # Documentation index
├── pdf_generator_module_documentation_summary.md    # JSDoc summary
├── pdf_generator_module_qr_embedding_summary.md     # QR embedding details
├── pdf_generator_module_pdfoutput_summary.md        # PDF output features
├── pdf_generator_module_qr_separation_summary.md    # Architecture details
└── installation_and_usage.md                        # This file
```

### **Tests and Examples**
```
tests/pdf_generator_module/
├── test_separated_qr_functionality.js    # QR separation tests
├── test_complete_functionality.js        # Complete feature tests
├── example_usage.js                      # Usage examples
├── test_qr_embedding.js                  # QR embedding tests
└── test_new_qr_function.js              # New functionality tests
```

## 🚀 **Usage in Main Application**

### **JavaScript/Node.js Usage**
```javascript
// Import the module
const { 
  generateSinglePDF, 
  generateQRCodeBuffer 
} = require('./src/lib/pdf_generator_module');

// Generate QR codes
const wifiQR = await generateQRCodeBuffer("WIFI:T:WPA;S:HotelGuest;P:password123;;");
const menuQR = await generateQRCodeBuffer("https://hotel.com/menu");

// Generate PDF with QR codes
const result = await generateSinglePDF({
  title: "Hotel Room QR Codes",
  qrCodeCount: 2,
  qrCodesPerRow: 2,
  qrCodes: [
    { id: "wifi", label: "WiFi Access", imageData: wifiQR },
    { id: "menu", label: "Digital Menu", imageData: menuQR }
  ]
}, {
  type: 'file',
  path: 'output',
  name: 'hotel-qr-codes.pdf'
});
```

### **TypeScript Usage**
```typescript
// Import with TypeScript support
import { 
  generateSinglePDF, 
  generateQRCodeBuffer,
  PDFConfig,
  QRCodeData 
} from './src/lib/pdf-generator-qr-module';

// Type-safe configuration
const config: PDFConfig = {
  title: "Hotel Room QR Codes",
  paperSize: "A4",
  qrCodeCount: 2,
  qrCodes: [
    { id: "wifi", label: "WiFi Access", imageData: await generateQRCodeBuffer("WIFI:...") },
    { id: "menu", label: "Digital Menu", imageData: await generateQRCodeBuffer("https://...") }
  ]
};

const result = await generateSinglePDF(config, { type: 'file', path: 'output', name: 'qr-codes.pdf' });
```

### **Express.js API Integration**
```javascript
// In your Express.js routes
const { generateSinglePDF, generateQRCodeBuffer } = require('./src/lib/pdf_generator_module');

app.post('/api/generate-qr-pdf', async (req, res) => {
  try {
    // Generate QR codes from request data
    const qrCodes = await Promise.all(
      req.body.qrData.map(async (qr) => ({
        id: qr.id,
        label: qr.label,
        imageData: await generateQRCodeBuffer(qr.content)
      }))
    );

    // Generate PDF
    const result = await generateSinglePDF({
      title: req.body.title,
      qrCodes: qrCodes
    }, { type: 'blob' });

    if (result.success) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.pdf"');
      res.send(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🧪 **Running Tests**

```bash
# From project root
node tests/pdf_generator_module/test_separated_qr_functionality.js
node tests/pdf_generator_module/test_complete_functionality.js
node tests/pdf_generator_module/example_usage.js
```

## 📦 **Dependencies**

The module requires the following dependencies (should already be installed):

```json
{
  "pdfkit": "^0.x.x",
  "qrcode": "^1.x.x"
}
```

If qrcode is not installed:
```bash
npm install qrcode
```

## 🔧 **Integration Points**

### **Existing PDF System**
The module can work alongside existing PDF generation files in `src/lib/`:
- `pdf-generator.ts` - Original PDF system
- `pdf-cutlines.ts` - Cutline utilities
- `qrcode-utils.ts` - QR code utilities

### **API Integration**
Perfect for integration with existing API routes in:
- `src/app/api/admin/generate-pdf/route.ts` - Admin PDF generation
- Any other API endpoints requiring PDF generation

### **Component Integration**
Can be used by components in:
- `src/components/QRCodePrintManager.tsx`
- `src/components/PDFExportOptions.tsx`
- Any new QR code related components

## 🎯 **Benefits**

1. **Separation of Concerns**: QR generation separate from PDF layout
2. **TypeScript Support**: Full type safety and IntelliSense
3. **Flexible Output**: File or blob output for different use cases
4. **Professional Layout**: Titles, cutlines, debug modes
5. **Easy Integration**: Drop-in replacement for existing PDF generation

## 📚 **Documentation**

For detailed information, see:
- [Main README](./pdf_generator_module_README.md) - Complete feature overview
- [QR Separation Guide](./pdf_generator_module_qr_separation_summary.md) - Architecture details
- [QR Embedding Guide](./pdf_generator_module_qr_embedding_summary.md) - Implementation details

The module is now ready for use in the main application! 🎉
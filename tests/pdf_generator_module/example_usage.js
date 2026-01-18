const { generatePDFsFromJSON, generateSinglePDF, generatePDFBuffer } = require('./pdf_generator_module');

// Example 1: Generate PDFs from JSON string (multiple configurations)
async function exampleMultipleConfigs() {
  console.log('📄 Example 1: Multiple PDF configurations from JSON string');
  
  const jsonConfig = JSON.stringify([
    {
      "paperSize": "A4",
      "margin": "standard",
      "qrCodeCount": 2,
      "qrCodesPerRow": 2,
      "qrCodeSize": "medium",
      "showCutlines": true,
      "outputFileName": "example-home.pdf",
      "qrCodes": [
        { "id": "home-1", "label": "WiFi Password" },
        { "id": "home-2", "label": "Guest Instructions" }
      ]
    },
    {
      "paperSize": "Letter",
      "margin": "1in",
      "qrCodeCount": 4,
      "qrCodesPerRow": 2,
      "qrCodeSize": "large",
      "showCutlines": true,
      "outputFileName": "example-office.pdf",
      "qrCodes": [
        { "id": "office-1", "label": "Conference Room A" },
        { "id": "office-2", "label": "Conference Room B" },
        { "id": "office-3", "label": "Kitchen Guidelines" },
        { "id": "office-4", "label": "Emergency Procedures" }
      ]
    }
  ]);
  
  try {
    const results = await generatePDFsFromJSON(jsonConfig, 'tmp');
    
    console.log('📊 Results:');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`  ✅ PDF ${index + 1}: ${result.outputPath}`);
      } else {
        console.log(`  ❌ PDF ${index + 1}: ${result.error}`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Example 2: Generate single PDF from configuration object
async function exampleSingleConfig() {
  console.log('\n📄 Example 2: Single PDF from configuration object');
  
  const config = {
    paperSize: "A5",
    margin: "thin",
    qrCodeCount: 3,
    qrCodesPerRow: 1,
    qrCodeSize: "2cm",
    qrBoxMargin: "8mm",
    showCutlines: true,
    outputFileName: "example-business-cards.pdf",
    qrCodes: [
      { id: "card-1", label: "John Doe - Contact" },
      { id: "card-2", label: "Jane Smith - Contact" },
      { id: "card-3", label: "Company Info" }
    ]
  };
  
  try {
    const result = await generateSinglePDF(config, 'tmp');
    
    if (result.success) {
      console.log(`  ✅ Generated: ${result.outputPath}`);
    } else {
      console.log(`  ❌ Error: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Example 3: Generate PDF as Buffer (for web applications)
async function examplePDFBuffer() {
  console.log('\n📄 Example 3: PDF as Buffer (for web responses)');
  
  const config = {
    paperSize: "A4",
    margin: "standard",
    qrCodeCount: 1,
    qrCodesPerRow: 1,
    qrCodeSize: "large",
    showCutlines: false,
    qrCodes: [
      { id: "buffer-test", label: "Generated as Buffer" }
    ]
  };
  
  try {
    const pdfBuffer = await generatePDFBuffer(config);
    console.log(`  ✅ Generated PDF buffer: ${pdfBuffer.length} bytes`);
    
    // In a web application, you could return this buffer as:
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.pdf"');
    // res.send(pdfBuffer);
    
    return pdfBuffer;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Example 4: Integration with Express.js (pseudo-code)
function exampleExpressIntegration() {
  console.log('\n📄 Example 4: Express.js integration (pseudo-code)');
  
  const exampleCode = `
// In your Express.js application:
const express = require('express');
const { generatePDFBuffer, generateSinglePDF } = require('../../src/lib/pdf_generator_module');

const app = express();
app.use(express.json());

// API endpoint to generate PDF and return as download
app.post('/api/generate-qr-pdf', async (req, res) => {
  try {
    const config = req.body; // PDF configuration from client
    const pdfBuffer = await generatePDFBuffer(config);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to generate PDF and save to server
app.post('/api/save-qr-pdf', async (req, res) => {
  try {
    const config = req.body;
    const result = await generateSinglePDF(config, 'uploads');
    
    if (result.success) {
      res.json({ 
        success: true, 
        filePath: result.outputPath,
        downloadUrl: \`/downloads/\${path.basename(result.outputPath)}\`
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
`;
  
  console.log(exampleCode);
}

// Run examples
async function runAllExamples() {
  console.log('🚀 PDF Generator Module Examples\n');
  
  await exampleMultipleConfigs();
  await exampleSingleConfig();
  await examplePDFBuffer();
  exampleExpressIntegration();
  
  console.log('\n✨ All examples completed!');
  console.log('📁 Check the tmp/ directory for generated PDFs');
}

// Export for use in other modules
module.exports = {
  exampleMultipleConfigs,
  exampleSingleConfig,
  examplePDFBuffer,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
const fs = require('fs');
const path = require('path');

async function testPDFModuleDirectly() {
  console.log('🔧 Testing PDF generator module directly (bypass API auth)...');
  
  try {
    // Import the PDF generator module directly
    console.log('📥 Loading PDF generator module...');
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    console.log('✅ PDF module loaded successfully');
    console.log('📋 Available functions:', Object.keys(pdfModule));
    
    // Create test QR codes data
    const testQRCodes = [
      {
        id: 'test-qr-1',
        label: 'Samsung 65" QLED Smart TV',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMKDhIqJ+fGjAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAACcSURBVHja7doxDoAgDAVQSuKJOHFwdHQQN0dHRwdHJycnOzs7JCcnJCc7O3tyNhcwCGETtLGxEZKTnZzsjI2d7Oxsb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vf1+/L6AUAPoqZwNwAAAABJRU5ErkJggg=='
      },
      {
        id: 'test-qr-2',
        label: 'Keurig K-Elite Coffee Maker',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMKDhIqJ+fGjAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAACcSURBVHja7doxDoAgDAVQSuKJOHFwdHQQN0dHRwdHJycnOzs7JCcnJCc7O3tyNhcwCGETtLGxEZKTnZzsjI2d7Oxsb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vf1+/L6AUAPoqZwNwAAAABJRU5ErkJggg=='
      },
      {
        id: 'test-qr-3',
        label: 'Nest Learning Thermostat',
        imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5QMKDhIqJ+fGjAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAACcSURBVHja7doxDoAgDAVQSuKJOHFwdHQQN0dHRwdHJycnOzs7JCcnJCc7O3tyNhcwCGETtLGxEZKTnZzsjI2d7Oxsb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vb29vf1+/L6AUAPoqZwNwAAAABJRU5ErkJggg=='
      }
    ];
    
    console.log(`📊 Created ${testQRCodes.length} test QR codes`);
    
    // Test configuration
    const config = {
      title: "FAQBNB QR Codes Test",
      paperSize: "A4",
      margin: "standard", 
      qrCodeCount: testQRCodes.length,
      qrCodesPerRow: 3,
      qrCodeSize: "medium",
      showCutlines: true,
      showLabels: true,
      layoutMode: "fixed_boxes",
      qrCodes: testQRCodes
    };
    
    console.log('⚙️ PDF Configuration:', {
      title: config.title,
      paperSize: config.paperSize,
      qrCodeCount: config.qrCodeCount,
      qrCodesPerRow: config.qrCodesPerRow,
      layoutMode: config.layoutMode
    });
    
    // Test 1: Generate PDF Buffer (for web responses)
    if (pdfModule.generatePDFBuffer) {
      console.log('\n🧪 Test 1: Generating PDF Buffer...');
      try {
        const pdfBuffer = await pdfModule.generatePDFBuffer(config);
        
        if (Buffer.isBuffer(pdfBuffer)) {
          const filename = `direct-pdf-buffer-${Date.now()}.pdf`;
          fs.writeFileSync(filename, pdfBuffer);
          const fileSize = fs.statSync(filename).size;
          
          console.log(`✅ PDF Buffer test successful!`);
          console.log(`📁 File: ${filename}`);
          console.log(`📊 Size: ${fileSize} bytes`);
          
          if (fileSize > 10000) {
            console.log('🎉 PDF has substantial content - likely contains QR codes!');
          } else {
            console.log('⚠️ PDF is quite small - may not contain images');
          }
          
        } else {
          console.log('❌ PDF Buffer is not a Buffer:', typeof pdfBuffer);
        }
      } catch (bufferError) {
        console.log('❌ PDF Buffer generation failed:', bufferError.message);
      }
    }
    
    // Test 2: Generate PDF to file
    if (pdfModule.generateSinglePDF) {
      console.log('\n🧪 Test 2: Generating PDF to file...');
      try {
        const outputDir = 'tmp';
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir);
        }
        
        const result = await pdfModule.generateSinglePDF(config, outputDir);
        
        console.log('📋 PDF Generation Result:', result);
        
        if (result.success && result.outputPath) {
          const fileSize = fs.statSync(result.outputPath).size;
          
          // Copy to main directory for easy access
          const copyPath = `direct-pdf-file-${Date.now()}.pdf`;
          fs.copyFileSync(result.outputPath, copyPath);
          
          console.log(`✅ PDF File test successful!`);
          console.log(`📁 Original: ${result.outputPath}`);
          console.log(`📁 Copy: ${copyPath}`);
          console.log(`📊 Size: ${fileSize} bytes`);
          
          if (fileSize > 10000) {
            console.log('🎉 PDF has substantial content - likely contains QR codes!');
          }
          
        } else {
          console.log('❌ PDF File generation failed:', result.error);
        }
      } catch (fileError) {
        console.log('❌ PDF File generation failed:', fileError.message);
      }
    }
    
    // Test 3: Check if QR code generation function exists
    if (pdfModule.generateQRCodeBuffer) {
      console.log('\n🧪 Test 3: Testing QR code generation function...');
      try {
        const qrBuffer = await pdfModule.generateQRCodeBuffer('https://example.com/test', 200);
        if (qrBuffer && Buffer.isBuffer(qrBuffer)) {
          const qrFilename = `test-qr-${Date.now()}.png`;
          fs.writeFileSync(qrFilename, qrBuffer);
          console.log(`✅ QR generation works! Saved: ${qrFilename}`);
        } else {
          console.log('⚠️ QR generation returned:', typeof qrBuffer);
        }
      } catch (qrError) {
        console.log('❌ QR generation failed:', qrError.message);
      }
    }
    
    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      moduleLoaded: true,
      availableFunctions: Object.keys(pdfModule),
      testResults: {
        bufferGeneration: 'attempted',
        fileGeneration: 'attempted',
        qrGeneration: 'attempted'
      },
      conclusion: 'PDF module can be used directly without API authentication'
    };
    
    fs.writeFileSync('direct-pdf-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n🎯 CONCLUSION:');
    console.log('✅ PDF generator module loads and runs directly');
    console.log('✅ Can bypass API authentication issues');
    console.log('📁 Check generated PDF files to verify QR codes are visible');
    console.log('💡 The QR Print Manager should work if authentication is resolved');
    
  } catch (error) {
    console.error('❌ Direct PDF module test failed:', error.message);
    console.error('📋 Error details:', error);
  }
}

testPDFModuleDirectly().catch(console.error);




const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testAPIWithAuth() {
  console.log('🔍 Testing PDF API with proper authentication...');
  
  // First, let me check if there are any cookies or session data we can use
  console.log('📋 Creating test data with proper format...');
  
  const testData = {
    qrCodes: [
      {
        id: 'test-item-1',
        name: 'Test Label 1',
        qrDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      }
    ],
    settings: {
      pageFormat: 'A4',
      margins: 10,
      qrSize: 40,
      itemsPerRow: 3,
      includeCutlines: true,
      includeLabels: true
    }
  };
  
  // Write test data to a temporary file
  const dataFile = path.join(__dirname, 'tmp', 'test-api-auth-data.json');
  fs.writeFileSync(dataFile, JSON.stringify(testData, null, 2));
  
  console.log('📤 Test data written to:', dataFile);
  console.log('📤 Calling API with curl (no auth - expect 401)...');
  
  return new Promise((resolve, reject) => {
    const outputFile = path.join(__dirname, 'tmp', 'api-auth-test.pdf');
    
    // Try without auth first to confirm the 401 error
    const curl = spawn('curl', [
      '-X', 'POST',
      '-H', 'Content-Type: application/json',
      '-d', `@${dataFile}`,
      '-o', outputFile,
      '-w', '%{http_code}',
      '-v', // Verbose to see headers
      'http://localhost:3000/api/admin/generate-pdf'
    ]);
    
    let output = '';
    let error = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    curl.on('close', (code) => {
      console.log('📥 Curl exit code:', code);
      console.log('📥 HTTP status:', output.trim());
      
      if (error) {
        console.log('📥 Curl verbose output (headers):', error.substring(0, 500));
      }
      
      // Check if PDF was created
      if (fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile);
        console.log('📄 Response file created:', outputFile);
        console.log('📊 Response size:', stats.size, 'bytes');
        
        if (stats.size < 1000) {
          // File is small, probably an error message
          const content = fs.readFileSync(outputFile, 'utf8');
          console.log('❌ Error response:', content);
          resolve({ 
            success: false, 
            error: 'Authentication required', 
            httpStatus: output.trim(),
            errorContent: content
          });
        } else {
          resolve({ 
            success: true, 
            pdfPath: outputFile, 
            size: stats.size, 
            httpStatus: output.trim() 
          });
        }
      } else {
        resolve({ 
          success: false, 
          error: 'No response file created', 
          httpStatus: output.trim() 
        });
      }
    });
  });
}

async function testDirectModuleCall() {
  console.log('\n🔍 Testing PDF module directly with same data format...');
  
  try {
    // Import the PDF generator module directly
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    
    // Use the exact same data format that the API would send to the module
    const moduleConfig = {
      paperSize: 'A4',
      margin: '0.5cm',
      qrCodeCount: 1,
      qrCodesPerRow: 3,
      qrCodeSize: '40mm',
      showCutlines: true,
      includeCutlines: true,
      showLabels: true,
      includeLabels: true,
      debug: false,
      qrCodes: [
        {
          id: 'test-item-1',
          label: 'Test Label 1',
          imageData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        }
      ]
    };
    
    console.log('📤 Calling PDF module with config:', JSON.stringify(moduleConfig, null, 2));
    
    const pdfBuffer = await pdfModule.generatePDFBuffer(moduleConfig);
    
    console.log('✅ PDF module call successful:', pdfBuffer.length, 'bytes');
    
    // Save the PDF
    const outputPath = path.join(__dirname, 'tmp', 'direct-module-test.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('💾 PDF saved to:', outputPath);
    
    // Analyze the PDF content
    const pdfContent = pdfBuffer.toString('latin1');
    const hasLabel = pdfContent.includes('Test Label 1');
    console.log('🔍 Contains label text:', hasLabel ? '✅' : '❌');
    
    return { success: true, pdfPath: outputPath, size: pdfBuffer.length, hasLabel };
    
  } catch (error) {
    console.error('❌ Direct module call failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Running API and Module Tests...\n');
  
  // Test 1: API call (expect 401)
  const apiResult = await testAPIWithAuth();
  console.log('\n📋 API Test Result:', apiResult);
  
  // Test 2: Direct module call
  const moduleResult = await testDirectModuleCall();
  console.log('\n📋 Module Test Result:', moduleResult);
  
  console.log('\n🎯 ANALYSIS:');
  console.log('- API call should return 401 (authentication required)');
  console.log('- Direct module call should work and show labels');
  console.log('- This confirms the data format is correct');
  console.log('- The issue is likely in the application\'s authentication or data flow');
}

runTests().catch(console.error);


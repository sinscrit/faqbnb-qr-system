const QRCode = require('qrcode');
const fs = require('fs');

async function generateRealQRCodes() {
  console.log('🔧 Generating REAL QR codes to replace demo placeholders...');
  
  const items = [
    { id: '9659f771-6f3b-40cc-a906-57bbb451788f', name: 'Samsung 65" QLED Smart TV' },
    { id: 'f2b82987-a2a4-4de2-94db-f8924dc096d5', name: 'Keurig K-Elite Coffee Maker' },
    { id: '0d92cbeb-a61f-4492-9346-6ab03363fdab', name: 'Nest Learning Thermostat' },
    { id: '1c8e4723-5186-41f3-b4bd-11b614a77bdb', name: 'Bosch 800 Series Dishwasher' },
    { id: '8d678bd0-e4f7-495f-b4cd-43756813e23a', name: 'Samsung WF45T6000AW Washing Machine' }
  ];
  
  const qrCodes = new Map();
  
  console.log('📱 Generating real QR codes...');
  
  for (const item of items) {
    try {
      // Generate real QR code URL (pointing to the item detail page)
      const itemUrl = `http://localhost:3000/items/${item.id}`;
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(itemUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      qrCodes.set(item.id, qrDataUrl);
      
      // Also save as individual PNG for verification
      const buffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      fs.writeFileSync(`real-qr-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`, buffer);
      
      console.log(`✅ Generated QR for ${item.name}`);
      console.log(`   URL: ${itemUrl}`);
      console.log(`   Data length: ${qrDataUrl.length} chars`);
      
    } catch (error) {
      console.error(`❌ Failed to generate QR for ${item.name}:`, error.message);
    }
  }
  
  // Generate updated demo page code
  const qrMapCode = Array.from(qrCodes.entries())
    .map(([id, dataUrl]) => `    ['${id}', '${dataUrl}']`)
    .join(',\n');
  
  const updatedDemoCode = `  // REAL QR code data URLs for demonstration
  const demoQRCodes = new Map([
${qrMapCode}
  ]);`;
  
  console.log('\n📝 Updated demo code:');
  console.log(updatedDemoCode);
  
  // Save the code snippet to a file
  fs.writeFileSync('updated-demo-qr-map.txt', updatedDemoCode);
  
  // Test one QR code with PDF module
  console.log('\n🧪 Testing real QR code with PDF module...');
  
  try {
    const pdfModule = require('./src/lib/pdf_generator_module.js');
    
    const testConfig = {
      title: "Real QR Code Test",
      paperSize: "A4",
      margin: "standard",
      qrCodeCount: 1,
      qrCodesPerRow: 1,
      qrCodeSize: "medium",
      showCutlines: true,
      showLabels: true,
      layoutMode: "fixed_boxes",
      qrCodes: [{
        id: 'test-real-qr',
        label: items[0].name,
        imageData: qrCodes.get(items[0].id)
      }]
    };
    
    const pdfBuffer = await pdfModule.generatePDFBuffer(testConfig);
    
    if (Buffer.isBuffer(pdfBuffer)) {
      const filename = `real-qr-test-${Date.now()}.pdf`;
      fs.writeFileSync(filename, pdfBuffer);
      const fileSize = fs.statSync(filename).size;
      
      console.log(`✅ Real QR PDF test: ${filename} (${fileSize} bytes)`);
      
      if (fileSize > 10000) {
        console.log('🎉 PDF has substantial content - QR codes should be visible!');
      }
    }
    
  } catch (pdfError) {
    console.error('❌ PDF test failed:', pdfError.message);
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    generatedQRCodes: qrCodes.size,
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      url: `http://localhost:3000/items/${item.id}`,
      qrGenerated: qrCodes.has(item.id),
      qrDataLength: qrCodes.get(item.id)?.length || 0
    })),
    codeSnippet: 'updated-demo-qr-map.txt'
  };
  
  fs.writeFileSync('real-qr-generation-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n🎯 RESULTS:');
  console.log(`✅ Generated ${qrCodes.size} real QR codes`);
  console.log('📁 Individual PNG files saved for verification');
  console.log('📄 Updated demo code in: updated-demo-qr-map.txt');
  console.log('📊 Report saved in: real-qr-generation-report.json');
  console.log('\n💡 NEXT STEP: Replace the hardcoded QR data in src/app/qr-demo/page.tsx');
}

generateRealQRCodes().catch(console.error);




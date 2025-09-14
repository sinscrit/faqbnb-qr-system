// Quick PDF test - run this manually if needed
const fs = require('fs');

console.log('Starting quick PDF test...');

// Test 1: Check if PDF module exists
try {
    const modulePath = './src/lib/pdf_generator_module.js';
    if (fs.existsSync(modulePath)) {
        console.log('✅ PDF module exists');
        
        // Test 2: Try to require it
        const pdfModule = require(modulePath);
        console.log('✅ PDF module loaded');
        console.log('Available functions:', Object.keys(pdfModule));
        
        // Test 3: Check QR code library
        const QRCode = require('qrcode');
        console.log('✅ QRCode library available');
        
        // Test 4: Generate a simple QR code
        QRCode.toDataURL('https://example.com')
            .then(dataUrl => {
                console.log('✅ QR code generated, length:', dataUrl.length);
                
                // Test 5: Try PDF generation
                const config = {
                    paperSize: "A4",
                    qrCodeCount: 1,
                    qrCodesPerRow: 1,
                    qrCodes: [{
                        id: 'test',
                        label: 'Test QR',
                        imageData: dataUrl
                    }]
                };
                
                return pdfModule.generateSinglePDF(config, {
                    type: 'file',
                    path: './tmp',
                    name: 'quick-test.pdf'
                });
            })
            .then(result => {
                if (result.success) {
                    console.log('✅ PDF generated:', result.outputPath);
                    const stats = fs.statSync(result.outputPath);
                    console.log('✅ PDF size:', stats.size, 'bytes');
                    console.log('🎉 ALL TESTS PASSED!');
                } else {
                    console.log('❌ PDF generation failed:', result.error);
                }
            })
            .catch(error => {
                console.log('❌ Test failed:', error.message);
            });
            
    } else {
        console.log('❌ PDF module not found');
    }
} catch (error) {
    console.log('❌ Error:', error.message);
}



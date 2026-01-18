/**
 * Standalone test for the PDF Generator Module
 * This will create a simple app that demonstrates QR code PDF generation
 * using the dedicated module with proper JSON configuration
 */

const { generateSinglePDF, generateQRCodeBuffer } = require('./src/lib/pdf_generator_module.js');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

async function createStandalonePDFTest() {
    console.log('🧪 Creating standalone PDF module test...');
    
    try {
        // Step 1: Generate real QR code data URLs
        console.log('📱 Generating real QR codes...');
        
        const testItems = [
            {
                id: 'item-1',
                label: 'Coffee Machine',
                url: 'http://localhost:3000/item/abc123'
            },
            {
                id: 'item-2', 
                label: 'Smart TV',
                url: 'http://localhost:3000/item/def456'
            },
            {
                id: 'item-3',
                label: 'WiFi Router',
                url: 'http://localhost:3000/item/ghi789'
            },
            {
                id: 'item-4',
                label: 'Office Printer',
                url: 'http://localhost:3000/item/jkl012'
            }
        ];

        // Generate QR code buffers for each item
        const qrCodesWithData = [];
        for (const item of testItems) {
            console.log(`🔍 Generating QR for: ${item.label}`);
            
            // Generate QR code as Buffer using the module's helper function
            const qrBuffer = await generateQRCodeBuffer(item.url, 200);
            
            if (qrBuffer) {
                console.log(`✅ QR generated for ${item.label}: ${qrBuffer.length} bytes`);
                qrCodesWithData.push({
                    id: item.id,
                    label: item.label,
                    imageData: qrBuffer  // Pass Buffer directly
                });
            } else {
                console.log(`❌ Failed to generate QR for ${item.label}`);
                // Use fallback with data URL
                try {
                    const dataUrl = await QRCode.toDataURL(item.url, {
                        width: 200,
                        margin: 1,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                    console.log(`✅ QR data URL generated for ${item.label}: ${dataUrl.length} chars`);
                    qrCodesWithData.push({
                        id: item.id,
                        label: item.label,
                        imageData: dataUrl  // Pass data URL as fallback
                    });
                } catch (dataUrlError) {
                    console.log(`❌ Data URL generation failed for ${item.label}:`, dataUrlError.message);
                    qrCodesWithData.push({
                        id: item.id,
                        label: item.label,
                        imageData: null  // Will render as placeholder
                    });
                }
            }
        }

        // Step 2: Create PDF configuration
        console.log('📄 Creating PDF configuration...');
        
        const pdfConfig = {
            paperSize: "A4",
            margin: "standard",
            qrCodeCount: 4,
            qrCodesPerRow: 2,
            qrCodeSize: "medium",
            showCutlines: true,
            showLabels: true,
            debug: false,
            qrCodes: qrCodesWithData
        };

        console.log('📋 PDF Configuration:', JSON.stringify(pdfConfig, (key, value) => {
            if (key === 'imageData' && value) {
                return `[${typeof value} - ${value.length || 'unknown'} length]`;
            }
            return value;
        }, 2));

        // Step 3: Generate PDF using the module
        console.log('🏭 Generating PDF using the dedicated module...');
        
        const outputPath = path.join(__dirname, 'tmp');
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        const result = await generateSinglePDF(pdfConfig, {
            type: 'file',
            path: outputPath,
            name: 'standalone-test-qr-codes.pdf'
        });

        if (result.success) {
            console.log('🎉 PDF generation SUCCESS!');
            console.log(`✅ PDF saved to: ${result.outputPath}`);
            
            // Check file size
            const stats = fs.statSync(result.outputPath);
            console.log(`📊 PDF file size: ${stats.size} bytes`);
            
            if (stats.size < 1000) {
                console.log('⚠️ PDF file is suspiciously small - might be empty');
                return { error: 'PDF file too small', size: stats.size };
            }

            // Also test buffer generation
            console.log('🧪 Testing buffer generation...');
            const { generatePDFBuffer } = require('./src/lib/pdf_generator_module.js');
            const buffer = await generatePDFBuffer(pdfConfig);
            console.log(`📊 PDF buffer size: ${buffer.length} bytes`);
            
            // Save buffer as comparison
            const bufferPath = path.join(outputPath, 'standalone-test-qr-codes-buffer.pdf');
            fs.writeFileSync(bufferPath, buffer);
            console.log(`✅ Buffer PDF saved to: ${bufferPath}`);

            return {
                success: true,
                filePdfPath: result.outputPath,
                bufferPdfPath: bufferPath,
                fileSize: stats.size,
                bufferSize: buffer.length,
                qrCodesGenerated: qrCodesWithData.length
            };

        } else {
            console.log('❌ PDF generation FAILED!');
            console.log(`Error: ${result.error}`);
            return { error: result.error };
        }

    } catch (error) {
        console.error('❌ Standalone test failed:', error.message);
        console.error('Stack:', error.stack);
        return { error: error.message };
    }
}

// Also create a simple JSON-based test
async function testJSONConfiguration() {
    console.log('\n🧪 Testing JSON configuration approach...');
    
    try {
        // Create simple QR codes for JSON test
        const jsonQRCodes = [];
        for (let i = 1; i <= 3; i++) {
            const url = `http://localhost:3000/item/json-test-${i}`;
            const dataUrl = await QRCode.toDataURL(url, {
                width: 200,
                margin: 1
            });
            
            jsonQRCodes.push({
                id: `json-qr-${i}`,
                label: `JSON Test Item ${i}`,
                imageData: dataUrl
            });
        }

        const jsonConfig = JSON.stringify([
            {
                paperSize: "A4",
                qrCodeCount: 3,
                qrCodesPerRow: 3,
                qrCodeSize: "large",
                showCutlines: true,
                showLabels: true,
                outputFileName: "json-test-qr-codes.pdf",
                qrCodes: jsonQRCodes
            }
        ]);

        console.log('📋 JSON Config created with', jsonQRCodes.length, 'QR codes');
        
        const { generatePDFsFromJSON } = require('./src/lib/pdf_generator_module.js');
        const results = await generatePDFsFromJSON(jsonConfig, {
            type: 'file',
            path: 'tmp',
            name: 'json-config-test-*.pdf'
        });

        console.log('📄 JSON generation results:', results);
        
        return results;

    } catch (error) {
        console.error('❌ JSON test failed:', error.message);
        return { error: error.message };
    }
}

// Run both tests
async function runAllTests() {
    console.log('🚀 Starting standalone PDF module tests...\n');
    
    const standaloneResult = await createStandalonePDFTest();
    const jsonResult = await testJSONConfiguration();
    
    console.log('\n📋 FINAL TEST SUMMARY:');
    console.log('====================');
    
    if (standaloneResult.success) {
        console.log('✅ Standalone test: SUCCESS');
        console.log(`   File PDF: ${standaloneResult.filePdfPath} (${standaloneResult.fileSize} bytes)`);
        console.log(`   Buffer PDF: ${standaloneResult.bufferPdfPath} (${standaloneResult.bufferSize} bytes)`);
        console.log(`   QR codes: ${standaloneResult.qrCodesGenerated}`);
    } else {
        console.log('❌ Standalone test: FAILED');
        console.log(`   Error: ${standaloneResult.error}`);
    }
    
    if (jsonResult && !jsonResult.error) {
        console.log('✅ JSON test: SUCCESS');
        console.log(`   Results: ${jsonResult.length} PDFs generated`);
    } else {
        console.log('❌ JSON test: FAILED');
        console.log(`   Error: ${jsonResult?.error || 'Unknown error'}`);
    }
    
    console.log('\n🔍 Check the generated PDFs in the tmp/ directory');
    console.log('📱 Manually verify QR codes are visible and scannable');
}

// Execute the tests
runAllTests().catch(console.error);



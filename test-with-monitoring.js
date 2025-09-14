/**
 * Monitoring script that launches PDF tests with timeouts and progress tracking
 * This will prevent hanging and provide clear feedback on what's happening
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestMonitor {
    constructor() {
        this.timeoutMs = 30000; // 30 second timeout
        this.checkIntervalMs = 1000; // Check every second
        this.tests = [];
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }

    async runCommandWithTimeout(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            this.log(`🚀 Starting: ${command} ${args.join(' ')}`);
            
            const startTime = Date.now();
            let isResolved = false;
            let outputBuffer = '';
            let errorBuffer = '';
            
            // Set up timeout
            const timeout = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    this.log(`⏰ TIMEOUT: Command "${command}" exceeded ${this.timeoutMs}ms`);
                    if (child && !child.killed) {
                        child.kill('SIGKILL');
                    }
                    reject(new Error(`Command timeout after ${this.timeoutMs}ms`));
                }
            }, this.timeoutMs);
            
            // Spawn the process
            const child = spawn(command, args, {
                stdio: ['inherit', 'pipe', 'pipe'],
                ...options
            });
            
            // Track output
            child.stdout.on('data', (data) => {
                const text = data.toString();
                outputBuffer += text;
                this.log(`📤 STDOUT: ${text.trim()}`);
            });
            
            child.stderr.on('data', (data) => {
                const text = data.toString();
                errorBuffer += text;
                this.log(`📤 STDERR: ${text.trim()}`);
            });
            
            // Handle completion
            child.on('close', (code) => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeout);
                    const duration = Date.now() - startTime;
                    this.log(`✅ Command completed in ${duration}ms with code: ${code}`);
                    resolve({
                        code,
                        stdout: outputBuffer,
                        stderr: errorBuffer,
                        duration
                    });
                }
            });
            
            child.on('error', (error) => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeout);
                    this.log(`❌ Command error: ${error.message}`);
                    reject(error);
                }
            });
            
            // Monitor progress
            const progressInterval = setInterval(() => {
                if (!isResolved) {
                    const elapsed = Date.now() - startTime;
                    this.log(`⏳ Still running... ${elapsed}ms elapsed`);
                }
            }, this.checkIntervalMs);
            
            // Clean up interval when done
            const originalResolve = resolve;
            const originalReject = reject;
            resolve = (...args) => {
                clearInterval(progressInterval);
                originalResolve(...args);
            };
            reject = (...args) => {
                clearInterval(progressInterval);
                originalReject(...args);
            };
        });
    }
    
    async testBasicNode() {
        this.log('🧪 Testing basic Node.js functionality...');
        try {
            const result = await this.runCommandWithTimeout('node', ['-e', 'console.log("Node.js is working"); process.exit(0);']);
            this.log(`✅ Basic Node test passed: ${result.stdout.trim()}`);
            return true;
        } catch (error) {
            this.log(`❌ Basic Node test failed: ${error.message}`);
            return false;
        }
    }
    
    async testModuleExists() {
        this.log('🧪 Testing if PDF module exists...');
        try {
            const modulePath = './src/lib/pdf_generator_module.js';
            if (fs.existsSync(modulePath)) {
                this.log(`✅ PDF module exists at: ${modulePath}`);
                
                // Test if it can be required
                const result = await this.runCommandWithTimeout('node', ['-e', `
                    try {
                        const module = require('${modulePath}');
                        console.log('Module functions:', Object.keys(module));
                        process.exit(0);
                    } catch (error) {
                        console.error('Module require failed:', error.message);
                        process.exit(1);
                    }
                `]);
                
                if (result.code === 0) {
                    this.log(`✅ PDF module can be required: ${result.stdout.trim()}`);
                    return true;
                } else {
                    this.log(`❌ PDF module require failed: ${result.stderr}`);
                    return false;
                }
            } else {
                this.log(`❌ PDF module not found at: ${modulePath}`);
                return false;
            }
        } catch (error) {
            this.log(`❌ Module test failed: ${error.message}`);
            return false;
        }
    }
    
    async testQRCodeGeneration() {
        this.log('🧪 Testing QR code generation...');
        try {
            const result = await this.runCommandWithTimeout('node', ['-e', `
                const QRCode = require('qrcode');
                
                async function test() {
                    try {
                        console.log('Testing QR code generation...');
                        const dataUrl = await QRCode.toDataURL('https://example.com', { width: 100 });
                        console.log('QR code generated, length:', dataUrl.length);
                        console.log('QR code starts with:', dataUrl.substring(0, 50));
                        process.exit(0);
                    } catch (error) {
                        console.error('QR generation failed:', error.message);
                        process.exit(1);
                    }
                }
                
                test();
            `]);
            
            if (result.code === 0) {
                this.log(`✅ QR code generation works: ${result.stdout.trim()}`);
                return true;
            } else {
                this.log(`❌ QR code generation failed: ${result.stderr}`);
                return false;
            }
        } catch (error) {
            this.log(`❌ QR code test failed: ${error.message}`);
            return false;
        }
    }
    
    async createSimplePDFTest() {
        this.log('🧪 Creating simple PDF test...');
        
        const testScript = `
const { generateSinglePDF } = require('./src/lib/pdf_generator_module.js');
const QRCode = require('qrcode');

async function simplePDFTest() {
    try {
        console.log('Starting simple PDF test...');
        
        // Generate one QR code
        console.log('Generating QR code...');
        const qrDataUrl = await QRCode.toDataURL('https://example.com/test', {
            width: 200,
            margin: 1
        });
        console.log('QR code generated, length:', qrDataUrl.length);
        
        // Create simple config
        const config = {
            paperSize: "A4",
            qrCodeCount: 1,
            qrCodesPerRow: 1,
            qrCodeSize: "medium",
            showCutlines: false,
            showLabels: true,
            debug: false,
            qrCodes: [{
                id: 'test-1',
                label: 'Test QR Code',
                imageData: qrDataUrl
            }]
        };
        
        console.log('Generating PDF...');
        const result = await generateSinglePDF(config, {
            type: 'file',
            path: './tmp',
            name: 'simple-test.pdf'
        });
        
        if (result.success) {
            console.log('PDF generated successfully:', result.outputPath);
            
            // Check file size
            const fs = require('fs');
            const stats = fs.statSync(result.outputPath);
            console.log('PDF file size:', stats.size, 'bytes');
            
            if (stats.size > 1000) {
                console.log('SUCCESS: PDF file looks good');
                process.exit(0);
            } else {
                console.log('WARNING: PDF file is very small, might be empty');
                process.exit(1);
            }
        } else {
            console.log('PDF generation failed:', result.error);
            process.exit(1);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

simplePDFTest();
        `;
        
        // Write the test script
        const testFile = 'simple-pdf-test.js';
        fs.writeFileSync(testFile, testScript.trim());
        this.log(`📝 Created test script: ${testFile}`);
        
        // Run the test
        try {
            const result = await this.runCommandWithTimeout('node', [testFile]);
            
            if (result.code === 0) {
                this.log(`✅ Simple PDF test passed: ${result.stdout.trim()}`);
                return true;
            } else {
                this.log(`❌ Simple PDF test failed (code ${result.code}): ${result.stderr}`);
                return false;
            }
        } catch (error) {
            this.log(`❌ Simple PDF test failed: ${error.message}`);
            return false;
        }
    }
    
    async runAllTests() {
        this.log('🎯 Starting comprehensive PDF module testing with monitoring...');
        
        const tests = [
            { name: 'Basic Node.js', fn: () => this.testBasicNode() },
            { name: 'Module Exists', fn: () => this.testModuleExists() },
            { name: 'QR Generation', fn: () => this.testQRCodeGeneration() },
            { name: 'Simple PDF', fn: () => this.createSimplePDFTest() }
        ];
        
        let passed = 0;
        let failed = 0;
        
        for (const test of tests) {
            this.log(`\n📋 Running test: ${test.name}`);
            this.log('='.repeat(50));
            
            try {
                const success = await test.fn();
                if (success) {
                    passed++;
                    this.log(`✅ ${test.name}: PASSED`);
                } else {
                    failed++;
                    this.log(`❌ ${test.name}: FAILED`);
                }
            } catch (error) {
                failed++;
                this.log(`❌ ${test.name}: ERROR - ${error.message}`);
            }
        }
        
        this.log('\n📊 FINAL RESULTS:');
        this.log('='.repeat(50));
        this.log(`✅ Passed: ${passed}`);
        this.log(`❌ Failed: ${failed}`);
        this.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
        
        if (passed === tests.length) {
            this.log('🎉 ALL TESTS PASSED! PDF module is working correctly.');
        } else {
            this.log('⚠️ Some tests failed. Check the logs above for details.');
        }
        
        return { passed, failed, total: tests.length };
    }
}

// Run the monitoring tests
const monitor = new TestMonitor();
monitor.runAllTests().catch(error => {
    console.error('❌ Monitor failed:', error.message);
    process.exit(1);
});



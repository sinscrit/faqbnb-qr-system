import QRCode from 'qrcode';

export interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
}

const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  width: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

/**
 * Generate QR code as data URL string
 * @param url - The URL to encode in the QR code
 * @param options - Optional QR code generation options
 * @returns Promise resolving to data URL string
 */
export async function generateQRCode(
  url: string,
  options?: Partial<QRCodeOptions>
): Promise<string> {
  try {
    if (!url || typeof url !== 'string') {
      throw new Error('Invalid URL provided for QR code generation');
    }

    const qrOptions = { ...DEFAULT_QR_OPTIONS, ...options };
    
    const dataUrl = await QRCode.toDataURL(url, {
      width: qrOptions.width,
      margin: qrOptions.margin,
      color: qrOptions.color,
      errorCorrectionLevel: 'M', // Medium error correction
    });

    return dataUrl;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code with predefined size settings
 * @param url - The URL to encode in the QR code
 * @param size - Predefined size option
 * @returns Promise resolving to data URL string
 */
export async function getQRCodeDataURL(
  url: string,
  size: 'small' | 'medium' | 'large' = 'medium'
): Promise<string> {
  const sizeMap = {
    small: 144,   // 1 inch at 144 DPI
    medium: 216,  // 1.5 inches at 144 DPI
    large: 288,   // 2 inches at 144 DPI
  };

  const options: Partial<QRCodeOptions> = {
    width: sizeMap[size],
    margin: 2,
  };

  return generateQRCode(url, options);
}

// Test QR code generation with a sample URL (to be removed after verification)
async function testQRGeneration() {
  try {
    const testUrl = 'https://faqbnb.com/item/test-uuid';
    const dataUrl = await generateQRCode(testUrl);
    
    if (dataUrl.startsWith('data:image/png;base64,')) {
      console.log('✅ QR code generation test successful');
      console.log('Data URL length:', dataUrl.length);
      return true;
    } else {
      console.error('❌ QR code generation test failed - invalid data URL format');
      return false;
    }
  } catch (error) {
    console.error('❌ QR code generation test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  testQRGeneration();
} 
const fs = require('fs');
const path = require('path');

async function implementFontFixStrategy() {
  console.log('🔧 Implementing comprehensive font fix strategy...');
  
  try {
    // Strategy 1: Fix API route environment (HIGHEST LIKELIHOOD)
    console.log('\n📋 STRATEGY 1: API Route Environment Fix');
    
    const apiRoutePath = path.join(__dirname, 'src', 'app', 'api', 'admin', 'generate-pdf', 'route.ts');
    let apiContent = fs.readFileSync(apiRoutePath, 'utf8');
    
    // Find the imports section and add font setup before any PDFKit usage
    const importsEnd = apiContent.indexOf('export async function POST(request: NextRequest)');
    
    if (importsEnd !== -1) {
      const beforeFunction = apiContent.substring(0, importsEnd);
      const afterFunction = apiContent.substring(importsEnd);
      
      // Add comprehensive font debugging and setup
      const fontSetupCode = `
// 🔤 FONT_FIX_STRATEGY: Comprehensive font setup for API route
const setupFontsForAPI = () => {
  console.log('🔤 FONT_API_DEBUG: === API FONT SETUP START ===');
  console.log('🔤 FONT_API_DEBUG: API route starting, cwd:', process.cwd());
  console.log('🔤 FONT_API_DEBUG: __dirname:', __dirname);
  
  // Strategy 1A: Set font path using absolute path from project root
  const projectRoot = process.cwd();
  const fontDataPath = path.join(projectRoot, 'node_modules', 'pdfkit', 'js', 'data');
  
  console.log('🔤 FONT_PATH_DEBUG: Calculated font path:', fontDataPath);
  console.log('🔤 FONT_PATH_DEBUG: Font directory exists:', fs.existsSync(fontDataPath));
  
  if (fs.existsSync(fontDataPath)) {
    // Strategy 1B: Check font file permissions in API context
    const helveticaPath = path.join(fontDataPath, 'Helvetica.afm');
    console.log('🔤 FONT_PERM_DEBUG: Helvetica path:', helveticaPath);
    console.log('🔤 FONT_PERM_DEBUG: Helvetica exists:', fs.existsSync(helveticaPath));
    
    if (fs.existsSync(helveticaPath)) {
      try {
        const stats = fs.statSync(helveticaPath);
        console.log('🔤 FONT_PERM_DEBUG: Font file stats:', {
          size: stats.size,
          mode: stats.mode.toString(8),
          uid: stats.uid,
          gid: stats.gid
        });
        
        // Test read access
        fs.accessSync(helveticaPath, fs.constants.R_OK);
        console.log('🔤 FONT_PERM_DEBUG: Font file is readable ✅');
      } catch (permError) {
        console.error('🔤 FONT_PERM_DEBUG: Font permission error:', permError.message);
      }
    }
    
    // Strategy 1C: Set environment variable BEFORE any PDFKit imports
    console.log('🔤 FONT_ENV_DEBUG: PDFKIT_DATA_PATH before:', process.env.PDFKIT_DATA_PATH);
    process.env.PDFKIT_DATA_PATH = fontDataPath;
    console.log('🔤 FONT_ENV_DEBUG: PDFKIT_DATA_PATH after:', process.env.PDFKIT_DATA_PATH);
    
    // Strategy 1D: Clear PDFKit from require cache to force reinitialization
    const pdfkitCacheKeys = Object.keys(require.cache).filter(key => 
      key.includes('pdfkit') || key.includes('PDFDocument')
    );
    console.log('🔤 FONT_CACHE_DEBUG: PDFKit cache keys found:', pdfkitCacheKeys.length);
    
    pdfkitCacheKeys.forEach(key => {
      console.log('🔤 FONT_CACHE_DEBUG: Clearing cache for:', key);
      delete require.cache[key];
    });
    
    console.log('🔤 FONT_API_DEBUG: === API FONT SETUP COMPLETE ===');
    return true;
  } else {
    console.error('🔤 FONT_API_DEBUG: Font directory not found!');
    return false;
  }
};

// Execute font setup immediately when API route loads
setupFontsForAPI();

`;
      
      apiContent = beforeFunction + fontSetupCode + afterFunction;
      
      console.log('✅ Added comprehensive font setup to API route');
    } else {
      console.log('❌ Could not find API route function');
      return { success: false, error: 'API route function not found' };
    }
    
    // Strategy 2: Enhance PDF module with better debugging
    console.log('\n📋 STRATEGY 2: Enhanced PDF Module Debugging');
    
    const pdfModulePath = path.join(__dirname, 'src', 'lib', 'pdf_generator_module.js');
    let moduleContent = fs.readFileSync(pdfModulePath, 'utf8');
    
    // Find the current font fix section and enhance it
    const fontFixStart = moduleContent.indexOf('// Fix font loading issue - explicit font path setup');
    
    if (fontFixStart !== -1) {
      const fontFixEnd = moduleContent.indexOf('console.log(\'🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete\');', fontFixStart);
      
      if (fontFixEnd !== -1) {
        const beforeFix = moduleContent.substring(0, fontFixStart);
        const afterFix = moduleContent.substring(fontFixEnd);
        
        const enhancedFontFix = `      // 🔤 ENHANCED FONT FIX: Comprehensive font debugging and setup
      console.log('🔤 FONT_MODULE_DEBUG: === PDF MODULE FONT SETUP START ===');
      console.log('🔤 FONT_MODULE_DEBUG: Module execution context:', {
        cwd: process.cwd(),
        dirname: __dirname,
        env_pdfkit_path: process.env.PDFKIT_DATA_PATH
      });
      
      // Strategy 2A: Multiple font path resolution attempts
      const fontPaths = [
        process.env.PDFKIT_DATA_PATH,
        path.join(process.cwd(), 'node_modules', 'pdfkit', 'js', 'data'),
        path.join(__dirname, '..', '..', 'node_modules', 'pdfkit', 'js', 'data'),
        path.join(process.cwd(), 'public', 'fonts')
      ].filter(Boolean);
      
      let workingFontPath = null;
      
      for (const fontPath of fontPaths) {
        console.log('🔤 FONT_PATH_DEBUG: Testing font path:', fontPath);
        const helveticaPath = path.join(fontPath, 'Helvetica.afm');
        
        if (fs.existsSync(helveticaPath)) {
          try {
            fs.accessSync(helveticaPath, fs.constants.R_OK);
            workingFontPath = fontPath;
            console.log('🔤 FONT_PATH_DEBUG: ✅ Working font path found:', fontPath);
            break;
          } catch (accessError) {
            console.log('🔤 FONT_PATH_DEBUG: ❌ Font path not accessible:', accessError.message);
          }
        } else {
          console.log('🔤 FONT_PATH_DEBUG: ❌ Font path does not exist:', fontPath);
        }
      }
      
      if (workingFontPath) {
        process.env.PDFKIT_DATA_PATH = workingFontPath;
        console.log('🔤 FONT_MODULE_DEBUG: Set working font path:', workingFontPath);
      } else {
        console.error('🔤 FONT_MODULE_DEBUG: ❌ No working font path found!');
      }
      
      // Strategy 2B: Enhanced font loading with detailed error reporting
      try {
        console.log('🔤 FONT_LOAD_DEBUG: Attempting to load Helvetica font...');
        doc.font('Helvetica');
        doc.fontSize(12);
        
        // Test actual text rendering capability
        const testText = 'FONT_TEST_' + Date.now();
        console.log('🔤 FONT_TEST_DEBUG: Testing text rendering with:', testText);
        
        // Create a temporary text object to test rendering
        const originalX = doc.x;
        const originalY = doc.y;
        doc.text(testText, -1000, -1000); // Render off-page for testing
        doc.x = originalX;
        doc.y = originalY;
        
        console.log('🔤 FONT_LOAD_DEBUG: ✅ Font loading and text rendering successful');
      } catch (fontError) {
        console.error('🔤 FONT_LOAD_DEBUG: ❌ Font loading failed:', fontError.message);
        console.error('🔤 FONT_LOAD_DEBUG: Font error stack:', fontError.stack);
        
        // Strategy 2C: Fallback font loading attempts
        const fallbackFonts = ['Times-Roman', 'Courier'];
        for (const fallbackFont of fallbackFonts) {
          try {
            console.log('🔤 FONT_FALLBACK_DEBUG: Trying fallback font:', fallbackFont);
            doc.font(fallbackFont);
            console.log('🔤 FONT_FALLBACK_DEBUG: ✅ Fallback font loaded:', fallbackFont);
            break;
          } catch (fallbackError) {
            console.log('🔤 FONT_FALLBACK_DEBUG: ❌ Fallback font failed:', fallbackError.message);
          }
        }
      }
      
      console.log('🔤 FONT_MODULE_DEBUG: === PDF MODULE FONT SETUP COMPLETE ===');
      console.log('🔍 PDF_OVERRIDE_DEBUG: Font method overrides complete');`;
        
        moduleContent = beforeFix + enhancedFontFix + afterFix;
        
        console.log('✅ Enhanced PDF module font debugging');
      }
    }
    
    // Write the updated files
    fs.writeFileSync(apiRoutePath, apiContent);
    fs.writeFileSync(pdfModulePath, moduleContent);
    
    console.log('💾 Updated API route and PDF module with comprehensive font fixes');
    
    return { success: true, strategies: ['API Environment Fix', 'Enhanced Module Debugging'] };
    
  } catch (error) {
    console.error('❌ Font fix strategy implementation failed:', error.message);
    console.error('Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

implementFontFixStrategy().then(result => {
  console.log('\n📋 Font Fix Strategy Result:', result);
  
  if (result.success) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Test the application again to see detailed font debugging');
    console.log('2. Look for 🔤 FONT_*_DEBUG messages in the logs');
    console.log('3. These messages will show exactly where the process breaks down');
    console.log('4. Based on the debug output, we can pinpoint the exact issue');
    
    console.log('\n🔍 DEBUG MESSAGE FILTERS:');
    console.log('- Font API setup: 🔤 FONT_API_DEBUG');
    console.log('- Font paths: 🔤 FONT_PATH_DEBUG');
    console.log('- Font permissions: 🔤 FONT_PERM_DEBUG');
    console.log('- Font environment: 🔤 FONT_ENV_DEBUG');
    console.log('- Font caching: 🔤 FONT_CACHE_DEBUG');
    console.log('- Font module: 🔤 FONT_MODULE_DEBUG');
    console.log('- Font loading: 🔤 FONT_LOAD_DEBUG');
  }
}).catch(console.error);


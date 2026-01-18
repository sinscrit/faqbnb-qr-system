const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING PDF MODULE FOR NEXT.JS COMPATIBILITY');
console.log('==============================================');

// Read the current PDF module
const pdfModulePath = './src/lib/pdf_generator_module.js';
let content = fs.readFileSync(pdfModulePath, 'utf8');

console.log('📄 Original file size:', content.length, 'characters');

// Fix 1: Update the PDFKit import to be more compatible
const oldImport = `const PDFDocument = require('pdfkit');`;
const newImport = `let PDFDocument;
try {
  PDFDocument = require('pdfkit');
} catch (error) {
  console.error('🚨 PDFKit import error:', error.message);
  throw new Error('PDFKit module not available in this environment');
}`;

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  console.log('✅ Fixed PDFKit import');
} else {
  console.log('⚠️  PDFKit import not found or already fixed');
}

// Fix 2: Add better error handling for PDF document creation
const oldCreation = `doc = new PDFDocument({`;
const newCreation = `if (typeof PDFDocument !== 'function') {
        throw new Error('PDFDocument is not a constructor - PDFKit not properly loaded');
      }
      doc = new PDFDocument({`;

// Replace all occurrences
let replacements = 0;
while (content.includes(oldCreation)) {
  content = content.replace(oldCreation, newCreation);
  replacements++;
}

if (replacements > 0) {
  console.log(`✅ Fixed ${replacements} PDF document creation calls`);
} else {
  console.log('⚠️  PDF document creation not found or already fixed');
}

// Write the fixed content back
fs.writeFileSync(pdfModulePath, content);

console.log('📄 Updated file size:', content.length, 'characters');
console.log('✅ PDF module fix completed');
console.log('');
console.log('🔄 Please restart the development server to apply changes');


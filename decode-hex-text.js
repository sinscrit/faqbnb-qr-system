// Quick hex decoder to verify the text
const hexStrings = [
  '53696d706c6520',  // Should be "Simple "
  '54',              // Should be "T"
  '65',              // Should be "e"
  '787420',          // Should be "xt "
  '54',              // Should be "T"
  '657374'           // Should be "est"
];

console.log('🔍 Decoding hex strings from PDF:');

hexStrings.forEach((hex, index) => {
  const decoded = Buffer.from(hex, 'hex').toString('utf8');
  console.log(`${index + 1}. "${hex}" -> "${decoded}"`);
});

const fullHex = hexStrings.join('');
const fullDecoded = Buffer.from(fullHex, 'hex').toString('utf8');
console.log('\n✅ Full decoded text:', `"${fullDecoded}"`);


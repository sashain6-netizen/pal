const fs = require('fs');

// Read the frontend accessories file
const frontendContent = fs.readFileSync('public/profile/accessories.js', 'utf8');
const match = frontendContent.match(/const ACCESSORY_LIBRARY = ({[\s\S]*?});/);
if (!match) {
  console.error('Could not parse ACCESSORY_LIBRARY from frontend file');
  process.exit(1);
}

// Extract the ACCESSORY_LIBRARY object
const frontendAccessories = eval('(' + match[1] + ')');

// Import backend accessories
const { ACCESSORY_CATALOG } = require('./functions/api/_accessories.js');

console.log('Checking for missing accessories...\n');

const categories = ['hats', 'glasses', 'mouths', 'face_accessories', 'backgrounds'];
let missing = [];

categories.forEach(cat => {
  const frontendKeys = Object.keys(frontendAccessories[cat] || {});
  const backendKeys = Object.keys(ACCESSORY_CATALOG[cat] || {});
  
  const missingInBackend = frontendKeys.filter(key => !backendKeys.includes(key));
  if (missingInBackend.length > 0) {
    console.log(`Missing in backend ${cat}:`, missingInBackend);
    missing.push(...missingInBackend.map(key => `${cat}.${key}`));
  }
});

if (missing.length === 0) {
  console.log('All accessories found in backend catalog');
} else {
  console.log(`\nTotal missing: ${missing.length}`);
  console.log('Missing items:', missing);
}

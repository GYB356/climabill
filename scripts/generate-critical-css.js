/**
 * Critical CSS Generation Script
 * Run this script as part of the build process to generate critical CSS
 */

const { generateCriticalCSS } = require('../src/lib/critical-css');
const fs = require('fs');
const path = require('path');

// Ensure the critical directory exists
const criticalDir = path.join(__dirname, '../public/critical');
if (!fs.existsSync(criticalDir)) {
  fs.mkdirSync(criticalDir, { recursive: true });
}

// Generate critical CSS
console.log('Generating critical CSS...');
generateCriticalCSS()
  .then(() => {
    console.log('Critical CSS generation complete!');
  })
  .catch(error => {
    console.error('Error generating critical CSS:', error);
    process.exit(1);
  });

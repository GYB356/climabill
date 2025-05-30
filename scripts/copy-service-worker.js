/**
 * Service Worker Copy Script
 * Copies the service worker to the public directory for proper serving
 */

const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourcePath = path.join(__dirname, '../src/lib/service-worker.js');
const destPath = path.join(__dirname, '../public/sw.js');

// Copy the service worker file
console.log('Copying service worker to public directory...');
try {
  fs.copyFileSync(sourcePath, destPath);
  console.log('Service worker copied successfully!');
} catch (error) {
  console.error('Error copying service worker:', error);
  process.exit(1);
}

/**
 * Critical CSS extraction utility
 * Extracts critical CSS for above-the-fold content to improve page load times
 */

// Configuration for critical CSS extraction
const criticalConfig = {
  // Base paths for file references
  base: 'c:/climabill/climabill',
  
  // Entry points to analyze for critical CSS
  entryPoints: [
    { url: '/', template: 'src/app/page.tsx', output: 'public/critical/home.css' },
    { url: '/login', template: 'src/app/login/page.tsx', output: 'public/critical/login.css' },
    { url: '/signup', template: 'src/app/signup/page.tsx', output: 'public/critical/signup.css' },
    { url: '/billing', template: 'src/app/billing/page.tsx', output: 'public/critical/billing.css' },
    { url: '/analytics', template: 'src/app/analytics/page.tsx', output: 'public/critical/analytics.css' },
    { url: '/blockchain', template: 'src/app/blockchain/page.tsx', output: 'public/critical/blockchain.css' },
  ],
  
  // Critical CSS options
  options: {
    // Extract CSS for viewport sizes
    dimensions: [
      {
        width: 375,
        height: 667 // Mobile portrait
      },
      {
        width: 1440,
        height: 900 // Desktop
      }
    ],
    
    // How many DOM elements to analyze
    maxElementsToAnalyze: 2000,
    
    // Which CSS properties to include
    propertiesToInclude: [
      'display',
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'width',
      'height',
      'margin',
      'padding',
      'font',
      'color',
      'background',
      'border',
      'z-index',
      'opacity',
      'transform',
      'transition',
      'animation',
      'flex',
      'grid',
      'align-items',
      'justify-content'
    ],
    
    // Inline critical CSS directly in HTML
    inlineCSS: true,
    
    // Remove unused CSS
    pruneCSS: true,
    
    // Level of detail for logging
    verbosity: 1
  }
};

// Use with critical library (needs to be installed):
// npm install --save-dev critical

// Example integration with build process:
const critical = require('critical');
const fs = require('fs');

async function generateCriticalCSS() {
  try {
    // Create directory for critical CSS files
    await fs.promises.mkdir('public/critical', { recursive: true });
    
    // Process each entry point
    for (const entry of criticalConfig.entryPoints) {
      await critical.generate({
        src: entry.url,
        target: entry.output,
        inline: false,
        base: criticalConfig.base,
        ...criticalConfig.options
      });
      
      console.log(`Generated critical CSS for ${entry.url}`);
    }
    
    console.log('All critical CSS files generated successfully');
  } catch (error) {
    console.error('Error generating critical CSS:', error);
  }
}

// Export the config and function
module.exports = {
  criticalConfig,
  generateCriticalCSS
};

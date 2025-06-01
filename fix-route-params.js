const fs = require('fs');
const path = require('path');

// Pattern to find dynamic route files
const dynamicRoutePattern = /\[.*\]/;

// Function to recursively find all TypeScript files in API routes
function findApiRoutes(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (dynamicRoutePattern.test(file)) {
        // This is a dynamic route directory
        findApiRoutes(filePath, fileList);
      } else if (file !== 'node_modules' && file !== '.next') {
        findApiRoutes(filePath, fileList);
      }
    } else if (file === 'route.ts' && filePath.includes('[')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update route parameter types
function updateRouteParams(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Pattern to match params types in function signatures
  const paramPatterns = [
    /{ params }: { params: { ([^}]+) } }/g,
    /{ params }: { params: Promise<{ ([^}]+) }> }/g
  ];
  
  let updatedContent = content;
  
  // Update params type declarations
  updatedContent = updatedContent.replace(
    /{ params }: { params: { ([^}]+) } }/g, 
    '{ params }: { params: Promise<{ $1 }> }'
  );
  
  // Update params destructuring
  updatedContent = updatedContent.replace(
    /const { ([^}]+) } = params;/g,
    'const { $1 } = await params;'
  );
  
  // Update direct params.id access
  updatedContent = updatedContent.replace(
    /params\.([a-zA-Z0-9_]+)/g,
    '(await params).$1'
  );
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const apiDir = './src/app/api';
const routeFiles = findApiRoutes(apiDir);

console.log(`Found ${routeFiles.length} dynamic route files:`);
routeFiles.forEach(file => console.log(`  ${file}`));

let updatedCount = 0;
routeFiles.forEach(file => {
  if (updateRouteParams(file)) {
    updatedCount++;
  }
});

console.log(`\nUpdated ${updatedCount} files.`);

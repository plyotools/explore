const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'projects');
const INDEX_FILE = path.join(process.cwd(), 'public', 'instances.json');

function generateIndex() {
  const instances = [];
  
  if (!fs.existsSync(PROJECTS_DIR)) {
    fs.writeFileSync(INDEX_FILE, JSON.stringify([], null, 2));
    console.log('No projects directory found, created empty index');
    return;
  }
  
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const metadataPath = path.join(PROJECTS_DIR, entry.name, 'metadata.json');
      
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          
          // Check for screenshot
          const screenshotPath = path.join(PROJECTS_DIR, entry.name, 'screenshot');
          const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
          let screenshot;
          
          for (const ext of extensions) {
            const fullPath = screenshotPath + ext;
            if (fs.existsSync(fullPath)) {
              // Use relative path that will work with basePath
              screenshot = `./projects/${entry.name}/screenshot${ext}`;
              break;
            }
          }
          
          instances.push({
            ...metadata,
            id: entry.name,
            screenshot,
          });
        } catch (error) {
          console.error(`Error reading metadata for ${entry.name}:`, error);
        }
      }
    }
  }
  
  fs.writeFileSync(INDEX_FILE, JSON.stringify(instances, null, 2));
  console.log(`Generated index with ${instances.length} instances`);
}

generateIndex();


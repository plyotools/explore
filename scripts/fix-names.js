const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'projects');
const INDEX_FILE = path.join(process.cwd(), 'public', 'instances.json');

// Mapping of IDs to better names based on their URLs
const nameFixes = {
  'til-salgs': 'Sandsli Stasjon',
  'prospekt': 'Fagerblom',
  'prospekt-1': 'Kobberkvartalet',
  'til-salgs-1': 'Slippen Drammen',
  'til-salgs-2': 'Trollsetutsikten',
  'til-salgs-3': 'Kystbyen Slemmestad Trinn 2',
  'til-salgs-4': 'Stovner Torg',
  'til-salgs-5': 'Strandhagen Horten',
  'til-salgs-6': 'Dyrhaugen',
  'prosjektside': 'Steindansen',
  'finn-din-bolig': 'Linderudlokka',
  'forhandssalg-t2': 'Slippen Drammen T2'
};

function fixNames() {
  console.log('Fixing instance names...\n');
  
  let fixed = 0;
  
  for (const [id, newName] of Object.entries(nameFixes)) {
    const metadataPath = path.join(PROJECTS_DIR, id, 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        metadata.name = newName;
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
        console.log(`✅ Fixed: ${id} -> ${newName}`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fixing ${id}:`, error.message);
      }
    } else {
      console.log(`⚠️  Not found: ${id}`);
    }
  }
  
  // Regenerate index
  console.log('\nRegenerating index...');
  const instances = [];
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const metadataPath = path.join(PROJECTS_DIR, entry.name, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          instances.push({
            ...metadata,
            screenshot: metadata.screenshot 
              ? metadata.screenshot.replace(/^\/projects\//, './projects/')
              : undefined,
          });
        } catch (error) {
          console.error(`Error reading metadata for ${entry.name}:`, error);
        }
      }
    }
  }
  
  fs.writeFileSync(INDEX_FILE, JSON.stringify(instances, null, 2));
  
  console.log(`\n✅ Complete! Fixed ${fixed} instance names.`);
}

fixNames();





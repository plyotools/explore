const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'projects');
const INDEX_FILE = path.join(process.cwd(), 'public', 'instances.json');

// List of URLs to add
const urls = [
  'https://naabo.no/prosjekter/boliger-til-salgs/sandsli-stasjon/til-salgs/boligvelger',
  'https://fagerblom.no/prospekt/til-salgs',
  'http://kambenstryn.no/',
  'https://grilstad-marina.plyo.cloud/?y=55&p=16',
  'https://scandinavianpropertygroup.com/no/vare-prosjekter/slippen-drammen/til-salgs/boligvelger',
  'https://mariakvartalet.plyo.cloud/?y=330&p=19',
  'https://einerhagen.no',
  'https://mistel-park.plyo.cloud/standalone-aptcho',
  'https://kanalparkenbolig.no/',
  'https://bakke-as.no/boliger-til-salgs/steindansen/prosjektside/boligvelger',
  'https://lebakken.no/no/kommer-snart',
  'https://kobberkvartalet.no/prospekt/til-salgs',
  'https://soeiendom.no/prosjekter/timbre/til-salgs',
  'https://kystbyen-slemmestad.no/nybygg/forhandssalg',
  'https://madlalia.plyo.cloud/',
  'https://nesfjellet-alpinlandsby.no/no/vare-prosjekter/trollsetutsikten/til-salgs/tomtevelger',
  'https://heggedalhage.plyo.cloud/',
  'https://kystbyen-slemmestad.no/nybygg/til-salg/trinn-2/til-salgs/boligvelger?y=68&p=17',
  'https://soeiendom.no/prosjekter/linderudlokka/til-salgs',
  'https://soeiendom.no/prosjekter/fryd-stabekk/til-salgs',
  'https://grilstad-marina.plyo.cloud/?y=55&p=16',
  'https://scandinavianpropertygroup.com/no/vare-prosjekter/slippen-drammen/til-salgs/forhandssalg-t2',
  'https://byfjordparken.plyo.cloud/',
  'https://scandinavianpropertygroup.com/no/vare-prosjekter/slippen-drammen/til-salgs/forhandssalg-t2',
  'https://kolonialen.plyo.cloud/standalone-aptcho?y=267&p=20',
  'https://bolig.scandinavianpropertygroup.no/no/vare-prosjekter/hotvetalleen/kommer-snart',
  'https://leangenbukta.plyo.cloud/standalone-aptcho?y=86&p=26',
  'https://ankerhagen.plyo.cloud/',
  'https://soeiendom.no/prosjekter/linderudlokka/til-salgs/finn-din-bolig?y=356&p=28',
  'https://ostraadt-havn.plyo.cloud/boligvelger',
  'https://scandinavianpropertygroup.com/no/vare-prosjekter/stovner-torg/til-salgs/boligvelger?y=30&p=26',
  'https://strandhagenhorten.no/no/til-salgs/boligvelger',
  'https://dyrhaugenbolig.no/no/til-salgs/boligvelger?y=55&p=17',
  'https://naabo.no/prosjekter/boliger-til-salgs/sandsli-stasjon/til-salgs/boligvelger',
  'https://scandinavianpropertygroup.com/no/vare-prosjekter/stovner-torg/til-salgs/boligvelger',
  'https://byhagen.plyo.cloud/?y=99&p=23',
  'https://borgundfjorden.no/no/til-salgs/boligvelger',
  'https://www.nordr.com/se/hitta-din-bostad/bromma-canvas/till-salu'
];

// Function to sanitize project ID (for folder name)
function sanitizeProjectId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Function to extract a name from URL
function extractName(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Extract meaningful parts from path
    const pathParts = urlObj.pathname.split('/').filter(p => p && p !== 'no' && p !== 'se');
    
    // Try to get project name from path
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // Skip common words
      if (!['boligvelger', 'til-salgs', 'forhandssalg', 'kommer-snart', 'prospekt', 'standalone-aptcho', 'tomtevelger', 'till-salu'].includes(lastPart)) {
        // Capitalize and format
        return lastPart.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      
      // Try second to last part
      if (pathParts.length > 1) {
        const secondLast = pathParts[pathParts.length - 2];
        if (!['boliger-til-salgs', 'vare-prosjekter', 'prosjekter', 'nybygg', 'til-salg'].includes(secondLast)) {
          return secondLast.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
      }
      
      // Try third to last part
      if (pathParts.length > 2) {
        const thirdLast = pathParts[pathParts.length - 3];
        if (!['boliger-til-salgs', 'vare-prosjekter', 'prosjekter'].includes(thirdLast)) {
          return thirdLast.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
      }
    }
    
    // Fallback to domain name (formatted)
    const domainParts = hostname.split('.');
    const mainDomain = domainParts[0];
    return mainDomain.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  } catch (e) {
    // If URL parsing fails, use the URL itself
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

// Normalize URL for comparison (remove query params and trailing slashes)
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    urlObj.search = ''; // Remove query params
    return urlObj.toString().replace(/\/$/, '');
  } catch (e) {
    return url.replace(/\?.*$/, '').replace(/\/$/, '');
  }
}

// Get existing instances
function getExistingInstances() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }
  
  const instances = [];
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const metadataPath = path.join(PROJECTS_DIR, entry.name, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          instances.push(metadata);
        } catch (error) {
          console.error(`Error reading metadata for ${entry.name}:`, error);
        }
      }
    }
  }
  
  return instances;
}

// Regenerate index
function regenerateIndex() {
  const instances = getExistingInstances();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(instances.map(instance => ({
    ...instance,
    screenshot: instance.screenshot 
      ? instance.screenshot.replace(/^\/projects\//, './projects/')
      : undefined,
  })), null, 2));
}

// Add instance
function addInstance(name, link) {
  const projectId = sanitizeProjectId(name);
  const projectDir = path.join(PROJECTS_DIR, projectId);
  
  // Check if project already exists, add number suffix if needed
  let finalProjectId = projectId;
  let counter = 1;
  while (fs.existsSync(path.join(PROJECTS_DIR, finalProjectId))) {
    finalProjectId = `${projectId}-${counter}`;
    counter++;
  }
  
  const finalProjectDir = path.join(PROJECTS_DIR, finalProjectId);
  const metadataPath = path.join(finalProjectDir, 'metadata.json');
  
  // Create project directory
  fs.mkdirSync(finalProjectDir, { recursive: true });
  
  const instance = {
    id: finalProjectId,
    name,
    link,
    type: 'Apartment Chooser',
    features: [],
    description: '',
    createdAt: new Date().toISOString()
  };
  
  // Save metadata
  fs.writeFileSync(metadataPath, JSON.stringify(instance, null, 2), 'utf-8');
  
  return instance;
}

// Main function
function addApartmentChoosers() {
  console.log('Fetching existing instances...');
  const existingInstances = getExistingInstances();
  const existingLinks = new Set(existingInstances.map(i => normalizeUrl(i.link)));
  
  console.log(`Found ${existingInstances.length} existing instances`);
  console.log(`Processing ${urls.length} URLs...\n`);
  
  let added = 0;
  let skipped = 0;
  let errors = 0;
  
  // Remove duplicates from input URLs
  const uniqueUrls = [...new Set(urls)];
  
  for (const url of uniqueUrls) {
    const normalized = normalizeUrl(url);
    
    // Check if already exists
    if (existingLinks.has(normalized)) {
      console.log(`⏭️  Skipping (already exists): ${url}`);
      skipped++;
      continue;
    }
    
    // Extract name
    const name = extractName(url);
    
    try {
      console.log(`➕ Adding: ${name} - ${url}`);
      addInstance(name, url);
      added++;
      existingLinks.add(normalized); // Track in our set to avoid duplicates in this run
    } catch (error) {
      console.error(`❌ Error adding ${url}:`, error.message);
      errors++;
    }
  }
  
  // Regenerate index
  console.log('\nRegenerating index...');
  regenerateIndex();
  
  console.log(`\n✅ Complete!`);
  console.log(`   Added: ${added}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

// Run the script
addApartmentChoosers();


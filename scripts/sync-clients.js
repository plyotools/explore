const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'projects');
const CLIENTS_FILE = path.join(process.cwd(), 'data', 'clients.json');
const CLIENTS_PUBLIC_FILE = path.join(process.cwd(), 'public', 'data', 'clients.json');

// Ensure directories exist
function ensureDirectories() {
  const dirs = [
    path.dirname(CLIENTS_FILE),
    path.dirname(CLIENTS_PUBLIC_FILE),
  ];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Fetch favicon from URL
async function fetchFavicon(url) {
  if (!url) return null;
  
  try {
    const faviconUrls = [
      `${url}/favicon.ico`,
      `${url}/favicon.png`,
      `${new URL(url).origin}/favicon.ico`,
      `${new URL(url).origin}/favicon.png`,
    ];
    
    for (const faviconUrl of faviconUrls) {
      try {
        const response = await fetch(faviconUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const contentType = response.headers.get('content-type') || 'image/x-icon';
          return `data:${contentType};base64,${base64}`;
        }
      } catch (error) {
        // Try next URL
        continue;
      }
    }
    
    // Try to extract from HTML
    try {
      const htmlResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const html = await htmlResponse.text();
      
      const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i);
      if (faviconMatch) {
        const faviconPath = faviconMatch[1];
        const faviconUrl = faviconPath.startsWith('http') 
          ? faviconPath 
          : new URL(faviconPath, url).href;
        
        const response = await fetch(faviconUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const contentType = response.headers.get('content-type') || 'image/x-icon';
          return `data:${contentType};base64,${base64}`;
        }
      }
    } catch (error) {
      // Ignore HTML parsing errors
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching favicon for ${url}:`, error.message);
    return null;
  }
}

// Save client logo
function saveClientLogo(clientName, logoData) {
  if (!logoData || !logoData.startsWith('data:')) return null;
  
  const clientsDir = path.join(process.cwd(), 'public', 'data', 'clients');
  if (!fs.existsSync(clientsDir)) {
    fs.mkdirSync(clientsDir, { recursive: true });
  }
  
  const base64Data = logoData.split(',')[1];
  const matches = logoData.match(/data:image\/(\w+);base64/);
  const extension = matches ? matches[1] : 'png';
  const sanitizedName = clientName.replace(/[^a-zA-Z0-9]/g, '-');
  const logoPath = path.join(clientsDir, `${sanitizedName}.${extension}`);
  
  fs.writeFileSync(logoPath, base64Data, 'base64');
  return `/data/clients/${sanitizedName}.${extension}`;
}

async function syncClients() {
  ensureDirectories();
  
  // Load existing clients
  let existingClients = {};
  if (fs.existsSync(CLIENTS_FILE)) {
    try {
      existingClients = JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf-8'));
    } catch (error) {
      console.error('Error reading existing clients:', error);
    }
  }
  
  // Get all instances
  const instances = [];
  if (fs.existsSync(PROJECTS_DIR)) {
    const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metadataPath = path.join(PROJECTS_DIR, entry.name, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
            instances.push({
              ...metadata,
              id: entry.name,
            });
          } catch (error) {
            console.error(`Error reading metadata for ${entry.name}:`, error);
          }
        }
      }
    }
  }
  
  // Extract unique clients with their URLs
  const clientMap = new Map();
  
  instances.forEach(instance => {
    if (instance.client) {
      if (!clientMap.has(instance.client)) {
        clientMap.set(instance.client, {
          name: instance.client,
          urls: new Set(),
        });
      }
      if (instance.link) {
        clientMap.get(instance.client).urls.add(instance.link);
      }
    }
  });
  
  console.log(`Found ${clientMap.size} unique clients`);
  
  // Process each client
  const updatedClients = { ...existingClients };
  
  for (const [clientName, clientData] of clientMap.entries()) {
    console.log(`\nProcessing client: ${clientName}`);
    
    // Get the first URL for favicon fetching
    const urls = Array.from(clientData.urls);
    const primaryUrl = urls[0];
    
    // If client doesn't exist or doesn't have a logo, try to fetch favicon
    if (!updatedClients[clientName] || !updatedClients[clientName].logo) {
      if (primaryUrl) {
        console.log(`  Fetching favicon from: ${primaryUrl}`);
        const favicon = await fetchFavicon(primaryUrl);
        
        if (favicon) {
          const logoPath = saveClientLogo(clientName, favicon);
          updatedClients[clientName] = {
            name: clientName,
            website: primaryUrl,
            logo: logoPath || favicon,
            favicon: favicon,
          };
          console.log(`  ✓ Favicon fetched and saved`);
        } else {
          console.log(`  ✗ Could not fetch favicon`);
          // Still add client without logo
          if (!updatedClients[clientName]) {
            updatedClients[clientName] = {
              name: clientName,
              website: primaryUrl,
            };
          }
        }
      } else {
        // Add client without URL
        if (!updatedClients[clientName]) {
          updatedClients[clientName] = {
            name: clientName,
          };
        }
      }
    } else {
      console.log(`  Client already exists with logo, skipping`);
      // Update website if not set
      if (!updatedClients[clientName].website && primaryUrl) {
        updatedClients[clientName].website = primaryUrl;
      }
    }
    
    // Small delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save clients
  fs.writeFileSync(CLIENTS_FILE, JSON.stringify(updatedClients, null, 2), 'utf-8');
  fs.writeFileSync(CLIENTS_PUBLIC_FILE, JSON.stringify(updatedClients, null, 2), 'utf-8');
  
  console.log(`\n✓ Synced ${Object.keys(updatedClients).length} clients to ${CLIENTS_FILE}`);
  console.log(`✓ Synced ${Object.keys(updatedClients).length} clients to ${CLIENTS_PUBLIC_FILE}`);
}

syncClients().catch(console.error);


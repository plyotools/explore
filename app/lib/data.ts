import { ExploreInstance, FeatureConfig } from './types';
import { promises as fs } from 'fs';
import path from 'path';

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'projects');
const FEATURES_FILE = path.join(process.cwd(), 'data', 'features.json');
const FEATURES_PUBLIC_FILE = path.join(process.cwd(), 'public', 'data', 'features.json');
const INDEX_FILE = path.join(process.cwd(), 'public', 'instances.json');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(FEATURES_FILE), { recursive: true });
  await fs.mkdir(path.dirname(FEATURES_PUBLIC_FILE), { recursive: true });
}

// Get project directory path
function getProjectDir(projectId: string): string {
  return path.join(PROJECTS_DIR, projectId);
}

// Get metadata file path for a project
function getMetadataPath(projectId: string): string {
  return path.join(getProjectDir(projectId), 'metadata.json');
}

// Sanitize project ID (for folder name)
function sanitizeProjectId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Read instances from file system
export async function getInstances(): Promise<ExploreInstance[]> {
  try {
    await ensureDirectories();
    
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const instances: ExploreInstance[] = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metadataPath = getMetadataPath(entry.name);
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);
          
          // Check if screenshot exists and update path
          const screenshotPath = path.join(getProjectDir(entry.name), 'screenshot');
          let screenshot: string | undefined;
          
          // Try common image extensions
          const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
          for (const ext of extensions) {
            const fullPath = screenshotPath + ext;
            try {
              await fs.access(fullPath);
              screenshot = `/projects/${entry.name}/screenshot${ext}`;
              break;
            } catch {
              // File doesn't exist, try next extension
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
    
    return instances;
  } catch (error) {
    console.error('Error fetching instances:', error);
    return [];
  }
}

// Add new instance
export async function addInstance(instance: Omit<ExploreInstance, 'id' | 'createdAt'>): Promise<ExploreInstance> {
  await ensureDirectories();
  
  const projectId = sanitizeProjectId(instance.name);
  const projectDir = getProjectDir(projectId);
  const metadataPath = getMetadataPath(projectId);
  
  // Check if project already exists
  let finalProjectId = projectId;
  let counter = 1;
  while (true) {
    try {
      await fs.access(getProjectDir(finalProjectId));
      finalProjectId = `${projectId}-${counter}`;
      counter++;
    } catch {
      break; // Directory doesn't exist, we can use this ID
    }
  }
  
  const finalProjectDir = getProjectDir(finalProjectId);
  const finalMetadataPath = getMetadataPath(finalProjectId);
  
  // Create project directory
  await fs.mkdir(finalProjectDir, { recursive: true });
  
  const newInstance: ExploreInstance = {
    ...instance,
    id: finalProjectId,
    createdAt: new Date().toISOString(),
  };
  
  // Save metadata
  await fs.writeFile(finalMetadataPath, JSON.stringify(newInstance, null, 2), 'utf-8');
  
  // Handle screenshot if provided (base64 data URL)
  if (instance.screenshot && instance.screenshot.startsWith('data:')) {
    const base64Data = instance.screenshot.split(',')[1];
    const matches = instance.screenshot.match(/data:image\/(\w+);base64/);
    const extension = matches ? matches[1] : 'png';
    const screenshotPath = path.join(finalProjectDir, `screenshot.${extension}`);
    await fs.writeFile(screenshotPath, base64Data, 'base64');
    newInstance.screenshot = `/projects/${finalProjectId}/screenshot.${extension}`;
  }
  
  // Regenerate index
  await regenerateIndex();
  
  return newInstance;
}

// Update instance
export async function updateInstance(id: string, updates: Partial<Omit<ExploreInstance, 'id' | 'createdAt'>>): Promise<ExploreInstance | null> {
  await ensureDirectories();
  
  const metadataPath = getMetadataPath(id);
  
  try {
    const existingContent = await fs.readFile(metadataPath, 'utf-8');
    const existing = JSON.parse(existingContent) as ExploreInstance;
    
    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve createdAt
    };
    
    // Handle screenshot update
    if (updates.screenshot && updates.screenshot.startsWith('data:')) {
      const base64Data = updates.screenshot.split(',')[1];
      const matches = updates.screenshot.match(/data:image\/(\w+);base64/);
      const extension = matches ? matches[1] : 'png';
      const screenshotPath = path.join(getProjectDir(id), `screenshot.${extension}`);
      await fs.writeFile(screenshotPath, base64Data, 'base64');
      updated.screenshot = `/projects/${id}/screenshot.${extension}`;
    }
    
    await fs.writeFile(metadataPath, JSON.stringify(updated, null, 2), 'utf-8');
    
    // Regenerate index
    await regenerateIndex();
    
    return updated;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // Project not found
    }
    throw error;
  }
}

// Delete instance
export async function deleteInstance(id: string): Promise<boolean> {
  try {
    const projectDir = getProjectDir(id);
    await fs.rm(projectDir, { recursive: true, force: true });
    
    // Regenerate index
    await regenerateIndex();
    
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false; // Project not found
    }
    throw error;
  }
}

// Get features configuration
export async function getFeatures(): Promise<FeatureConfig> {
  try {
    await ensureDirectories();
    const content = await fs.readFile(FEATURES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, create default
      const defaultFeatures: FeatureConfig = {
        "Virtual Showroom": ["Floor plan", "Styles", "Hotspots"],
        "Apartment Chooser": ["Sun path", "Sun slider", "Street view"]
      };
      // Ensure public/data directory exists
      await fs.mkdir(path.dirname(FEATURES_PUBLIC_FILE), { recursive: true });
      // Write to both locations
      await Promise.all([
        fs.writeFile(FEATURES_FILE, JSON.stringify(defaultFeatures, null, 2), 'utf-8'),
        fs.writeFile(FEATURES_PUBLIC_FILE, JSON.stringify(defaultFeatures, null, 2), 'utf-8'),
      ]);
      return defaultFeatures;
    }
    console.error('Error fetching features:', error);
    // Return default on error
    return {
      "Virtual Showroom": ["Floor plan", "Styles", "Hotspots"],
      "Apartment Chooser": ["Sun path", "Sun slider", "Street view"]
    };
  }
}

// Update features configuration
export async function updateFeatures(features: FeatureConfig): Promise<void> {
  await ensureDirectories();
  // Ensure public/data directory exists
  await fs.mkdir(path.dirname(FEATURES_PUBLIC_FILE), { recursive: true });
  // Write to both locations
  await Promise.all([
    fs.writeFile(FEATURES_FILE, JSON.stringify(features, null, 2), 'utf-8'),
    fs.writeFile(FEATURES_PUBLIC_FILE, JSON.stringify(features, null, 2), 'utf-8'),
  ]);
}

// Regenerate instances.json index file
export async function regenerateIndex(): Promise<void> {
  try {
    const instances = await getInstances();
    console.log(`Regenerating index with ${instances.length} instances`);
    // Fix screenshot paths to use relative paths for static export
    const instancesWithRelativePaths = instances.map(instance => ({
      ...instance,
      screenshot: instance.screenshot 
        ? instance.screenshot.replace(/^\/projects\//, './projects/')
        : undefined,
    }));
    await fs.writeFile(INDEX_FILE, JSON.stringify(instancesWithRelativePaths, null, 2), 'utf-8');
    console.log(`Successfully regenerated index with ${instancesWithRelativePaths.length} instances`);
  } catch (error) {
    console.error('Error regenerating index:', error);
    throw error;
  }
}

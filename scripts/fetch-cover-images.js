const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const PROJECTS_DIR = path.join(process.cwd(), 'public', 'projects');

function hasLocalScreenshot(projectId) {
  const exts = ['.png', '.jpg', '.jpeg', '.webp'];
  for (const ext of exts) {
    const p = path.join(PROJECTS_DIR, projectId, 'screenshot' + ext);
    if (fs.existsSync(p)) return true;
  }
  return false;
}

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow simple redirects
        return resolve(fetchHtml(new URL(res.headers.location, url).toString()));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('Timeout'));
    });
  });
}

function extractOgImage(html) {
  // Try property="og:image"
  const metaRegex = /<meta[^>]+property=["']og:image["'][^>]*>/i;
  const tagMatch = html.match(metaRegex);
  if (!tagMatch) return null;
  const tag = tagMatch[0];
  const contentRegex = /content=["']([^"']+)["']/i;
  const contentMatch = tag.match(contentRegex);
  if (!contentMatch) return null;
  return contentMatch[1];
}

function downloadImage(imgUrl, destPath) {
  return new Promise((resolve, reject) => {
    const client = imgUrl.startsWith('https') ? https : http;
    const req = client.get(imgUrl, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return resolve(downloadImage(new URL(res.headers.location, imgUrl).toString(), destPath));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Image status ${res.statusCode} for ${imgUrl}`));
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', (err) => {
        fs.unlink(destPath, () => reject(err));
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy(new Error('Timeout'));
    });
  });
}

async function main() {
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  let processed = 0;
  let skipped = 0;
  let withError = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const projectId = entry.name;
    const metadataPath = path.join(PROJECTS_DIR, projectId, 'metadata.json');
    if (!fs.existsSync(metadataPath)) continue;

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    if (!metadata.link) {
      console.log(`⏭️  ${projectId}: no link in metadata, skipping`);
      skipped++;
      continue;
    }

    if (hasLocalScreenshot(projectId)) {
      console.log(`⏭️  ${projectId}: screenshot already exists, skipping`);
      skipped++;
      continue;
    }

    const pageUrl = metadata.link;
    console.log(`🔎 ${projectId}: fetching cover from ${pageUrl}`);

    try {
      const html = await fetchHtml(pageUrl);
      const ogImage = extractOgImage(html);
      if (!ogImage) {
        console.log(`   ⚠️  No og:image found`);
        withError++;
        continue;
      }

      const resolvedImgUrl = new URL(ogImage, pageUrl).toString();
      const extMatch = resolvedImgUrl.match(/\.(png|jpe?g|webp)(?:\?|#|$)/i);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
      const finalExt = ext === 'jpeg' ? 'jpg' : ext;
      const destPath = path.join(PROJECTS_DIR, projectId, `screenshot.${finalExt}`);

      console.log(`   ⬇️  Downloading ${resolvedImgUrl} -> screenshot.${finalExt}`);
      await downloadImage(resolvedImgUrl, destPath);
      processed++;
    } catch (err) {
      console.log(`   ❌ Failed to fetch cover: ${err.message}`);
      withError++;
    }
  }

  console.log('\nDone.');
  console.log(`Downloaded: ${processed}`);
  console.log(`Skipped:    ${skipped}`);
  console.log(`Errors:     ${withError}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});


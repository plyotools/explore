import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }
    
    // Try to fetch favicon from common locations
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
          return NextResponse.json({
            success: true,
            favicon: `data:${contentType};base64,${base64}`,
            url: faviconUrl,
          });
        }
      } catch (error) {
        // Try next URL
        continue;
      }
    }
    
    // If no favicon found, try to extract from HTML
    try {
      const htmlResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const html = await htmlResponse.text();
      
      // Look for favicon links in HTML
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
          return NextResponse.json({
            success: true,
            favicon: `data:${contentType};base64,${base64}`,
            url: faviconUrl,
          });
        }
      }
    } catch (error) {
      // Ignore HTML parsing errors
    }
    
    return NextResponse.json({ error: 'Favicon not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching favicon:', error);
    return NextResponse.json({ error: 'Failed to fetch favicon' }, { status: 500 });
  }
}


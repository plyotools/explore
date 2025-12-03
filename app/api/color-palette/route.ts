import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isAuthenticated } from '@/app/lib/auth';

const PALETTE_FILE = path.join(process.cwd(), 'public', 'data', 'color-palette.json');

export async function GET() {
  try {
    const content = await fs.readFile(PALETTE_FILE, 'utf-8');
    const palette = JSON.parse(content);
    return NextResponse.json(palette);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Return empty array if file doesn't exist
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: 'Failed to fetch color palette' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const palette: string[] = body;

    if (!Array.isArray(palette)) {
      return NextResponse.json({ error: 'Palette must be an array' }, { status: 400 });
    }

    // Validate all colors are valid hex
    const validPalette = palette.filter(c => /^#[0-9A-Fa-f]{6}$/.test(c));
    if (validPalette.length !== palette.length) {
      return NextResponse.json({ error: 'Invalid color format. Use hex colors (e.g., #FF0000)' }, { status: 400 });
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(PALETTE_FILE), { recursive: true });
    
    // Save palette
    await fs.writeFile(PALETTE_FILE, JSON.stringify(validPalette, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update color palette' }, { status: 500 });
  }
}


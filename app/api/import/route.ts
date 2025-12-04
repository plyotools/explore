import { NextRequest, NextResponse } from 'next/server';
import { importAllData, ExportData } from '@/app/lib/data';
import { isAuthenticated, getUserRole } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    const userRole = await getUserRole();
    
    // Only allow admins to import
    if (!authenticated || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const importData = body as ExportData;
    
    // Validate import data structure
    if (!importData.projects || !importData.clients || !importData.features || 
        !importData.featuredInstances || !importData.colorPalette) {
      return NextResponse.json({ error: 'Invalid import data format' }, { status: 400 });
    }
    
    await importAllData(importData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}


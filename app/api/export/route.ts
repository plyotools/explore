import { NextResponse } from 'next/server';
import { exportAllData } from '@/app/lib/data';
import { isAuthenticated } from '@/app/lib/auth';

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const exportData = await exportAllData();
    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}


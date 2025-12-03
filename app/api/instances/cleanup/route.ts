import { NextResponse } from 'next/server';
import { cleanupInvalidFeatures } from '@/app/lib/data';
import { isAuthenticated } from '@/app/lib/auth';

export async function POST() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const result = await cleanupInvalidFeatures();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to cleanup invalid features:', error);
    return NextResponse.json({ error: 'Failed to cleanup invalid features' }, { status: 500 });
  }
}




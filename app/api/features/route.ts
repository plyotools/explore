import { NextRequest, NextResponse } from 'next/server';
import { getFeatures, updateFeatures } from '@/app/lib/data';
import { isAuthenticated } from '@/app/lib/auth';
import { FeatureConfig } from '@/app/lib/types';

export async function GET() {
  try {
    const features = await getFeatures();
    return NextResponse.json(features);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch features' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const features: FeatureConfig = body;
    
    await updateFeatures(features);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update features' }, { status: 500 });
  }
}


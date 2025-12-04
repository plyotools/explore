import { NextRequest, NextResponse } from 'next/server';
import { getFeaturedInstances, updateFeaturedInstances } from '@/app/lib/data';
import { isAuthenticated, getUserRole } from '@/app/lib/auth';

export async function GET() {
  try {
    const featured = await getFeaturedInstances();
    return NextResponse.json(featured);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch featured instances' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only admins and viewers can modify featured instances
    const role = await getUserRole();
    if (role === 'partner') {
      return NextResponse.json({ error: 'Partners cannot modify featured instances' }, { status: 403 });
    }
    
    const body = await request.json();
    const instanceIds: string[] = body.instanceIds;
    
    if (!Array.isArray(instanceIds)) {
      return NextResponse.json({ error: 'instanceIds must be an array' }, { status: 400 });
    }
    
    await updateFeaturedInstances(instanceIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update featured instances' }, { status: 500 });
  }
}


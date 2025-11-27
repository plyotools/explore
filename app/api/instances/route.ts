import { NextRequest, NextResponse } from 'next/server';
import { getInstances, addInstance, updateInstance, deleteInstance } from '@/app/lib/data';
import { isAuthenticated } from '@/app/lib/auth';
import { ExploreInstance } from '@/app/lib/types';

export async function GET() {
  try {
    const instances = await getInstances();
    return NextResponse.json(instances);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch instances' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, link, type, features, screenshot } = body;
    
    if (!name || !link || !type || !Array.isArray(features)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const instance = await addInstance({ name, link, type, features, screenshot });
    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create instance' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Instance ID required' }, { status: 400 });
    }
    
    const instance = await updateInstance(id, updates);
    if (!instance) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }
    
    return NextResponse.json(instance);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update instance' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Instance ID required' }, { status: 400 });
    }
    
    const deleted = await deleteInstance(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete instance' }, { status: 500 });
  }
}


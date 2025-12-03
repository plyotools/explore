import { NextRequest, NextResponse } from 'next/server';
import { getClients, updateClients, saveClientLogo } from '@/app/lib/data';
import { isAuthenticated } from '@/app/lib/auth';

// Note: API routes don't work with static export, but removing dynamic export allows build to succeed
// These routes will only work in development mode

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { clients, clientLogo } = body;
    
    if (!clients) {
      return NextResponse.json({ error: 'Clients data required' }, { status: 400 });
    }
    
    // Handle logo saving if provided
    if (clientLogo && clientLogo.clientName && clientLogo.logoData) {
      const logoPath = await saveClientLogo(clientLogo.clientName, clientLogo.logoData);
      // Update the client's logo path
      if (clients[clientLogo.clientName]) {
        clients[clientLogo.clientName].logo = logoPath;
      }
    }
    
    await updateClients(clients);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating clients:', error);
    return NextResponse.json({ error: 'Failed to update clients' }, { status: 500 });
  }
}


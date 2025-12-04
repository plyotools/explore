import { NextResponse } from 'next/server';
import { deleteAllData } from '@/app/lib/data';
import { isAuthenticated, getUserRole } from '@/app/lib/auth';

export async function DELETE() {
  try {
    const authenticated = await isAuthenticated();
    const userRole = await getUserRole();
    
    // Only allow admins to delete everything
    if (!authenticated || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await deleteAllData();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting all data:', error);
    return NextResponse.json({ error: 'Failed to delete all data' }, { status: 500 });
  }
}


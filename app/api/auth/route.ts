import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, setAuthenticated, clearAuthentication, verifyPassword, isAdmin } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }
    
    const result = verifyPassword(password);
    if (result.valid) {
      await setAuthenticated(result.isAdmin);
      return NextResponse.json({ success: true, isAdmin: result.isAdmin });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    const admin = authenticated ? await isAdmin() : false;
    return NextResponse.json({ authenticated, isAdmin: admin });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false, isAdmin: false, error: 'Failed to check authentication' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearAuthentication();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}


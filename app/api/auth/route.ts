import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, setAuthenticated, clearAuthentication, verifyPassword } from '@/app/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }
    
    if (verifyPassword(password)) {
      await setAuthenticated();
      return NextResponse.json({ success: true });
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
    return NextResponse.json({ authenticated });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ authenticated: false, error: 'Failed to check authentication' }, { status: 500 });
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


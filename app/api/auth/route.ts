import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated, setAuthenticated, clearAuthentication, verifyPassword } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function DELETE() {
  await clearAuthentication();
  return NextResponse.json({ success: true });
}


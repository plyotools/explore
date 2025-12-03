import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';
const SESSION_VALUE = 'authenticated';
const ADMIN_COOKIE = 'is_admin';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === SESSION_VALUE;
}

export async function setAuthenticated(isAdmin: boolean = false): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  cookieStore.set(ADMIN_COOKIE, isAdmin ? 'true' : 'false', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE);
  return adminCookie?.value === 'true';
}

export async function clearAuthentication(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ADMIN_COOKIE);
}

export function verifyPassword(password: string): { valid: boolean; isAdmin: boolean } {
  const normalPassword = 'explore';
  const adminPassword = 'exploreadmin';
  
  if (password === normalPassword) {
    return { valid: true, isAdmin: false };
  }
  if (password === adminPassword) {
    return { valid: true, isAdmin: true };
  }
  return { valid: false, isAdmin: false };
}


import { cookies } from 'next/headers';

const SESSION_COOKIE = 'admin_session';
const SESSION_VALUE = 'authenticated';
const ADMIN_COOKIE = 'is_admin';

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === SESSION_VALUE;
}

const ROLE_COOKIE = 'user_role';

export async function setAuthenticated(role: UserRole = 'viewer'): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  cookieStore.set(ROLE_COOKIE, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  // Keep admin cookie for backward compatibility
  cookieStore.set(ADMIN_COOKIE, role === 'admin' ? 'true' : 'false', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getUserRole(): Promise<UserRole> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get(ROLE_COOKIE);
  if (roleCookie?.value) {
    return roleCookie.value as UserRole;
  }
  // Fallback to admin cookie for backward compatibility
  const adminCookie = cookieStore.get(ADMIN_COOKIE);
  return adminCookie?.value === 'true' ? 'admin' : 'viewer';
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
  cookieStore.delete(ROLE_COOKIE);
}

export type UserRole = 'viewer' | 'admin' | 'partner';

export function verifyPassword(password: string): { valid: boolean; role: UserRole } {
  const viewerPassword = 'viewer';
  const adminPassword = 'exploreadmin';
  const partnerPassword = 'partner';
  
  if (password === viewerPassword) {
    return { valid: true, role: 'viewer' };
  }
  if (password === adminPassword) {
    return { valid: true, role: 'admin' };
  }
  if (password === partnerPassword) {
    return { valid: true, role: 'partner' };
  }
  return { valid: false, role: 'viewer' };
}


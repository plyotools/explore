'use client';

import { useState, useEffect } from 'react';
import { Container, Paper, Title, PasswordInput, Button, Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

// Simple client-side password check used when API routes are not available
type UserRole = 'viewer' | 'admin' | 'partner';

function clientVerifyPassword(password: string): { valid: boolean; role: UserRole } {
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

function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  // On GitHub Pages the app runs under /explore
  return window.location.pathname.startsWith('/explore') ? '/explore' : '';
}

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const basePath = getBasePath();
    const currentPath = window.location.pathname;

    // Check if we're already on the login page - if so, show the form and don't redirect
    if (currentPath.includes('/login')) {
      // We're on the login page, show the form
      return;
    }

    // If we already have a client-side session and we're NOT on login page, redirect to home
    const session = window.localStorage.getItem('explore_session');
    if (session === 'authenticated') {
      window.location.replace(basePath || '/');
      return;
    }

    // In development, keep existing server-side auth check
    if (process.env.NODE_ENV !== 'production') {
      const timer = setTimeout(() => {
        fetch(`${basePath}/api/auth/`)
          .then(res => {
            if (res.ok) {
              return res.json();
            }
            return { authenticated: false };
          })
          .then(data => {
            if (data.authenticated) {
              window.location.href = basePath || '/';
            }
          })
          .catch(() => {
            // Ignore errors, just show login form
          });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const basePath = getBasePath();

    try {
      if (process.env.NODE_ENV !== 'production') {
        // Try real API auth when running with a server
        const response = await fetch(`${basePath}/api/auth/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Also set localStorage for consistency
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('explore_session', 'authenticated');
            window.localStorage.setItem('explore_user_role', data.role || 'viewer');
            window.localStorage.setItem('explore_is_admin', (data.isAdmin || false).toString());
          }
          // Use replace to avoid back button issues
          window.location.replace(basePath || '/');
          return;
        } else {
          setError(data.error || 'Invalid password');
          return;
        }
      }

      // Fallback for static export (e.g. GitHub Pages): client-side check only
      const result = clientVerifyPassword(password);
      if (result.valid) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('explore_session', 'authenticated');
          window.localStorage.setItem('explore_user_role', result.role);
          window.localStorage.setItem('explore_is_admin', result.role === 'admin' ? 'true' : 'false');
        }
        // Use replace to avoid back button issues and ensure clean redirect
        window.location.replace(basePath || '/');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#0A082D'
    }}>
      <Container size={420} style={{ width: '100%', maxWidth: '420px' }}>
        <Paper 
          withBorder 
          shadow="md" 
          p={30} 
          radius="md" 
          style={{ 
            width: '100%',
            backgroundColor: '#19191B',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <Title order={2} ta="center" mb="md" style={{ color: '#F0F2F9' }}>
            Login
          </Title>
          <Text size="sm" c="dimmed" ta="center" mb="lg" style={{ color: '#B2BAD3' }}>
            Enter password to access the showcase
          </Text>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              mb="md"
              autoFocus
              styles={{
                label: {
                  color: '#F0F2F9',
                  marginBottom: '8px'
                },
                input: {
                  backgroundColor: '#1F1D4D',
                  color: '#F0F2F9',
                  borderColor: '#403B7D',
                },
                wrapper: {
                  marginBottom: '16px'
                }
              }}
            />
            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
              style={{
                backgroundColor: '#8027F4',
                color: '#FFFFFF'
              }}
            >
              Login
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
}


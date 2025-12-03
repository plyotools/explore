'use client';

import { useState, useEffect } from 'react';
import { Container, Paper, Title, PasswordInput, Button, Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

// Simple client-side password check used when API routes are not available
function clientVerifyPassword(password: string): { valid: boolean; isAdmin: boolean } {
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

    // If we already have a client-side session, skip login
    const session = window.localStorage.getItem('explore_session');
    if (session === 'authenticated') {
      window.location.href = basePath || '/';
      return;
    }

    // In development, keep existing server-side auth check
    if (process.env.NODE_ENV !== 'production') {
      const timer = setTimeout(() => {
        fetch('/api/auth/')
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
        const response = await fetch('/api/auth/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        const data = await response.json();

        if (response.ok) {
          window.location.href = basePath || '/';
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
          window.localStorage.setItem('explore_is_admin', result.isAdmin ? 'true' : 'false');
        }
        window.location.href = basePath || '/';
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
    <Container size={420} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper withBorder shadow="md" p={30} radius="md" style={{ width: '100%' }}>
        <Title order={2} ta="center" mb="md">
          Login
        </Title>
        <Text size="sm" c="dimmed" ta="center" mb="lg">
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
          />
          <Button type="submit" fullWidth loading={loading}>
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );
}


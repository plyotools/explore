'use client';

import { useState, useEffect } from 'react';
import { Container, Paper, Title, PasswordInput, Button, Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Quick check if already authenticated - don't block on this
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
            window.location.href = '/';
          }
        })
        .catch(() => {
          // Ignore errors, just show login form
        });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = '/';
      } else {
        setError(data.error || 'Invalid password');
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


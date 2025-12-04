'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Paper, Title, TextInput, PasswordInput, Button, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname.startsWith('/explore') ? '/explore' : '';
}

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const basePath = getBasePath();

    try {
      const response = await fetch(`${basePath}/api/auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        const redirectPath = basePath || '/';
        window.location.href = redirectPath;
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
    <Box 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '16px',
        margin: 0,
        width: '100vw',
        boxSizing: 'border-box',
      }}
    >
      <Paper 
        withBorder 
        shadow="md" 
        p={30} 
        radius="md" 
        style={{ 
          width: '100%', 
          maxWidth: '420px',
          margin: 0,
        }}
      >
        <Title order={2} ta="center" mb="md">
          Login
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="Password"
            placeholder="Enter password to access the showcase"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            mb="md"
          />
          <Button type="submit" fullWidth loading={loading}>
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
}


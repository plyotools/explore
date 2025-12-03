'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Paper, Title, TextInput, PasswordInput, Button, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        router.push('/');
        router.refresh();
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
          Admin Login
        </Title>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <PasswordInput
            label="Password"
            placeholder="Enter admin password"
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
    </Container>
  );
}


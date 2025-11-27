'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Button,
  Stack,
  Group,
  ActionIcon,
  Alert,
} from '@mantine/core';
import { IconPlus, IconTrash, IconLogout, IconArrowLeft } from '@tabler/icons-react';
import { FeatureConfig, InstanceType } from '@/app/lib/types';

export default function FeaturesPage() {
  const router = useRouter();
  const [features, setFeatures] = useState<FeatureConfig>({
    'Virtual Showroom': [],
    'Apartment Chooser': [],
  });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
    loadFeatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth');
      const data = await response.json();
      if (!data.authenticated) {
        router.push('/admin/login');
      } else {
        setAuthenticated(true);
      }
    } catch {
      router.push('/admin/login');
    }
  };

  const loadFeatures = async () => {
    try {
      const basePath = process.env.NODE_ENV === 'production' ? '/explore' : '';
      const response = await fetch(`${basePath}/data/features.json`);
      const data = await response.json();
      setFeatures(data);
    } catch (error) {
      console.error('Failed to load features:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const addFeature = (type: InstanceType) => {
    setFeatures({
      ...features,
      [type]: [...features[type], ''],
    });
  };

  const updateFeature = (type: InstanceType, index: number, value: string) => {
    const updated = [...features[type]];
    updated[index] = value;
    setFeatures({
      ...features,
      [type]: updated,
    });
  };

  const removeFeature = (type: InstanceType, index: number) => {
    const updated = features[type].filter((_, i) => i !== index);
    setFeatures({
      ...features,
      [type]: updated,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Features saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save features' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  if (!authenticated || loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <ActionIcon variant="light" onClick={() => router.push('/admin/dashboard')}>
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Title order={1}>Manage Features</Title>
        </Group>
        <Button variant="light" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
          Logout
        </Button>
      </Group>

      {message && (
        <Alert
          color={message.type === 'success' ? 'green' : 'red'}
          mb="md"
          onClose={() => setMessage(null)}
          withCloseButton
        >
          {message.text}
        </Alert>
      )}

      <Stack gap="xl">
        {(['Virtual Showroom', 'Apartment Chooser'] as InstanceType[]).map((type) => (
          <Paper key={type} p="md">
            <Group justify="space-between" mb="md">
              <Title order={3}>{type}</Title>
              <Button
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() => addFeature(type)}
              >
                Add Feature
              </Button>
            </Group>
            <Stack gap="sm">
              {features[type].map((feature, index) => (
                <Group key={index} gap="sm">
                  <TextInput
                    placeholder="Feature label"
                    value={feature}
                    onChange={(e) => updateFeature(type, index, e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color="red"
                    onClick={() => removeFeature(type, index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              {features[type].length === 0 && (
                <div style={{ color: '#999', fontStyle: 'italic' }}>
                  No features added yet
                </div>
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Group justify="flex-end" mt="xl">
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </Group>
    </Container>
  );
}


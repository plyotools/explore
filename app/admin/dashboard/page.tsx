'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Select,
  Checkbox,
  Button,
  Table,
  ActionIcon,
  Modal,
  Group,
  Stack,
  Badge,
  Image,
  FileButton,
  Alert,
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconLogout, IconSettings, IconPhoto } from '@tabler/icons-react';
import { ExploreInstance, InstanceType } from '@/app/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<ExploreInstance[]>([]);
  const [features, setFeatures] = useState<Record<InstanceType, string[]>>({
    'Virtual Showroom': [],
    'Apartment Chooser': [],
  });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formType, setFormType] = useState<InstanceType | null>(null);
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [formScreenshot, setFormScreenshot] = useState<string>('');
  const [modalOpened, setModalOpened] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
    loadData();
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

  const loadData = async () => {
    try {
      const [instancesRes, featuresRes] = await Promise.all([
        fetch('/api/instances'),
        fetch('/api/features'),
      ]);
      const instancesData = await instancesRes.json();
      const featuresData = await featuresRes.json();
      setInstances(instancesData);
      setFeatures(featuresData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleFileChange(file);
        }
      }
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormLink('');
    setFormType(null);
    setFormFeatures([]);
    setFormScreenshot('');
    setScreenshotFile(null);
    setEditingId(null);
  };

  const openEditModal = (instance: ExploreInstance) => {
    setEditingId(instance.id);
    setFormName(instance.name);
    setFormLink(instance.link);
    setFormType(instance.type);
    setFormFeatures(instance.features);
    setFormScreenshot(instance.screenshot || '');
    setModalOpened(true);
  };

  const handleSubmit = async () => {
    if (!formName || !formLink || !formType) return;

    try {
      const instanceData = {
        name: formName,
        link: formLink,
        type: formType,
        features: formFeatures,
        screenshot: formScreenshot,
      };

      if (editingId) {
        const response = await fetch('/api/instances', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...instanceData }),
        });
        if (response.ok) {
          await loadData();
          setModalOpened(false);
          resetForm();
        }
      } else {
        const response = await fetch('/api/instances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(instanceData),
        });
        if (response.ok) {
          await loadData();
          setModalOpened(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save instance:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this instance?')) return;

    try {
      const response = await fetch(`/api/instances?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Failed to delete instance:', error);
    }
  };

  const availableFeatures = formType ? features[formType] : [];

  if (!authenticated || loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Admin Dashboard</Title>
        <Group>
          <Button
            variant="light"
            leftSection={<IconSettings size={16} />}
            onClick={() => router.push('/admin/features')}
          >
            Manage Features
          </Button>
          <Button
            variant="light"
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Group>
      </Group>

      <Paper p="md" mb="xl">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            resetForm();
            setModalOpened(true);
          }}
        >
          Add New Instance
        </Button>
      </Paper>

      <Paper p="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Link</Table.Th>
              <Table.Th>Features</Table.Th>
              <Table.Th>Screenshot</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {instances.map((instance) => (
              <Table.Tr key={instance.id}>
                <Table.Td>{instance.name}</Table.Td>
                <Table.Td>
                  <Badge>{instance.type}</Badge>
                </Table.Td>
                <Table.Td>
                  <a href={instance.link} target="_blank" rel="noopener noreferrer">
                    {instance.link}
                  </a>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {instance.features.map((f) => (
                      <Badge key={f} size="sm" variant="light">
                        {f}
                      </Badge>
                    ))}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {instance.screenshot && (
                    <Image src={instance.screenshot} alt="Screenshot" width={50} height={50} fit="cover" />
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon color="blue" onClick={() => openEditModal(instance)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => handleDelete(instance.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          resetForm();
        }}
        title={editingId ? 'Edit Instance' : 'Add New Instance'}
        size="lg"
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Instance name"
            value={formName}
            onChange={(e) => setFormName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Link"
            placeholder="https://..."
            value={formLink}
            onChange={(e) => setFormLink(e.currentTarget.value)}
            required
          />
          <Select
            label="Type"
            placeholder="Select type"
            data={['Virtual Showroom', 'Apartment Chooser']}
            value={formType}
            onChange={(value) => {
              setFormType(value as InstanceType);
              setFormFeatures([]);
            }}
            required
          />
          {formType && (
            <div>
              <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
                Features
              </label>
              <Stack gap="xs">
                {availableFeatures.map((feature) => (
                  <Checkbox
                    key={feature}
                    label={feature}
                    checked={formFeatures.includes(feature)}
                    onChange={(e) => {
                      if (e.currentTarget.checked) {
                        setFormFeatures([...formFeatures, feature]);
                      } else {
                        setFormFeatures(formFeatures.filter((f) => f !== feature));
                      }
                    }}
                  />
                ))}
              </Stack>
            </div>
          )}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
              Screenshot
            </label>
            <Alert mb="sm" icon={<IconPhoto size={16} />}>
              Paste an image or upload a file
            </Alert>
            <Group>
              <FileButton onChange={handleFileChange} accept="image/*">
                {(props) => <Button {...props} leftSection={<IconPhoto size={16} />}>Upload</Button>}
              </FileButton>
              {formScreenshot && (
                <Button variant="light" color="red" onClick={() => {
                  setFormScreenshot('');
                  setScreenshotFile(null);
                }}>
                  Remove
                </Button>
              )}
            </Group>
            {formScreenshot && (
              <Image
                src={formScreenshot}
                alt="Screenshot preview"
                mt="md"
                maw={300}
                mah={200}
                fit="contain"
              />
            )}
            <div
              onPaste={handlePaste}
              style={{
                border: '2px dashed #555',
                borderRadius: '4px',
                padding: '20px',
                textAlign: 'center',
                marginTop: '8px',
                cursor: 'pointer',
              }}
              tabIndex={0}
            >
              Click here and paste (Ctrl+V / Cmd+V)
            </div>
          </div>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => {
              setModalOpened(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formName || !formLink || !formType}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}


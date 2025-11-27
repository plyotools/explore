'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Tabs,
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Image,
  Select,
  Grid,
  Button,
  Box,
  SegmentedControl,
} from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { ExploreInstance, InstanceType } from './lib/types';

export default function HomePage() {
  const router = useRouter();
  const [instances, setInstances] = useState<ExploreInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InstanceType | 'All'>('All');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [viewMode, setViewMode] = useState<'viewer' | 'admin'>('viewer');

  useEffect(() => {
    loadInstances();
    checkAuth();
  }, []);

  useEffect(() => {
    // Refresh instances periodically when in viewer mode
    if (viewMode === 'viewer') {
      const interval = setInterval(() => {
        loadInstances();
      }, 5000); // Refresh every 5 seconds (less aggressive)
      return () => clearInterval(interval);
    }
  }, [viewMode]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/');
      const data = await response.json();
      if (data.authenticated) {
        setAuthenticated(true);
        setViewMode('viewer'); // Set to viewer mode on main page
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
    }
  };

  const loadInstances = async () => {
    try {
      // Use relative path that works with basePath
      const basePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const url = `${basePath}/instances.json${cacheBuster}`;
      console.log('Fetching instances from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch instances: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Loaded instances:', data);
      
      if (!Array.isArray(data)) {
        throw new Error('Instances data is not an array');
      }
      
      // Fix screenshot paths to be absolute
      const instancesWithPaths = data.map((instance: ExploreInstance) => {
        let screenshotPath = instance.screenshot;
        if (screenshotPath) {
          // Convert relative paths (./projects/...) to absolute paths (/projects/...)
          if (screenshotPath.startsWith('./')) {
            screenshotPath = screenshotPath.replace('./', '/');
          } else if (!screenshotPath.startsWith('/')) {
            screenshotPath = '/' + screenshotPath;
          }
          screenshotPath = basePath + screenshotPath;
        }
        return {
          ...instance,
          screenshot: screenshotPath || undefined,
        };
      });
      
      // Always update to ensure we have the latest data
      console.log('Setting instances:', instancesWithPaths.length, 'instances');
      console.log('Instance details:', instancesWithPaths.map(i => ({ id: i.id, name: i.name, type: i.type })));
      setInstances(instancesWithPaths);
    } catch (error) {
      console.error('Failed to load instances:', error);
      setInstances([]); // Set empty array on error so loading state clears
    } finally {
      setLoading(false);
    }
  };

  const filteredInstances = instances.filter((instance) => {
    if (activeTab !== 'All' && instance.type !== activeTab) return false;
    if (selectedFeature && !instance.features.includes(selectedFeature)) return false;
    return true;
  });

  const allFeatures = Array.from(
    new Set(instances.flatMap((i) => i.features))
  ).sort();

  const showroomInstances = instances.filter((i) => i.type === 'Virtual Showroom');
  const apartmentInstances = instances.filter((i) => i.type === 'Apartment Chooser');

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <div>Loading...</div>
      </Container>
    );
  }

  // Removed excessive logging - only log on actual changes

  return (
    <Container size="xl" py="xl">
      <Box pos="relative" mb="xl">
        <Title order={1} mb="xl">
          Explore Showcases
        </Title>
        <Group gap="md" style={{ position: 'absolute', top: 0, right: 0 }}>
          {authenticated && (
            <SegmentedControl
              value={viewMode}
              onChange={(value) => {
                const mode = value as 'viewer' | 'admin';
                setViewMode(mode);
                if (mode === 'admin') {
                  router.push('/admin/dashboard');
                }
              }}
              data={[
                { label: 'Viewer', value: 'viewer' },
                { label: 'Admin', value: 'admin' },
              ]}
              style={{ marginLeft: 'auto' }}
            />
          )}
          {!authenticated && (
            <Button
              component="a"
              href="/admin/login"
              leftSection={<IconLogin size={16} />}
              variant="light"
            >
              Login
            </Button>
          )}
        </Group>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(value) => {
          setActiveTab(value as InstanceType);
          setSelectedFeature(null);
        }}
        mb="xl"
      >
        <Tabs.List justify="center">
          <Tabs.Tab value="All">
            All ({instances.length})
          </Tabs.Tab>
          <Tabs.Tab value="Apartment Chooser">
            Apartment Chooser ({apartmentInstances.length})
          </Tabs.Tab>
          <Tabs.Tab value="Virtual Showroom">
            Virtual Showroom ({showroomInstances.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="All" pt="xl">
          <Stack gap="md">
            <Select
              placeholder="Filter by feature"
              data={allFeatures}
              value={selectedFeature}
              onChange={setSelectedFeature}
              clearable
              style={{ maxWidth: 300 }}
            />
            <Grid>
              {filteredInstances.length > 0 ? (
                filteredInstances.map((instance) => (
                  <Grid.Col key={instance.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card 
                      shadow="sm" 
                      padding={0} 
                      radius="md" 
                      withBorder 
                      h="100%"
                      component="a"
                      href={instance.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
                      }}
                    >
                      <Stack gap="sm">
                        {instance.screenshot && (
                          <Box
                            style={{ 
                              width: '100%', 
                              aspectRatio: '4 / 3', 
                              overflow: 'hidden', 
                              borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0', 
                              position: 'relative'
                            }}
                          >
                            <Image
                              src={instance.screenshot}
                              alt={instance.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </Box>
                        )}
                        <Box px="lg" pb="lg">
                          <Stack gap="sm">
                            <Title order={4}>{instance.name}</Title>
                            <Group gap="xs">
                              {instance.features.map((feature) => (
                                <Badge key={feature} size="sm" variant="light">
                                  {feature}
                                </Badge>
                              ))}
                            </Group>
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))
              ) : (
                <Grid.Col span={12}>
                  <Text c="dimmed" ta="center" py="xl">
                    No instances found. {instances.length > 0 && `Total instances loaded: ${instances.length}`}
                  </Text>
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="Apartment Chooser" pt="xl">
          <Stack gap="md">
            <Select
              placeholder="Filter by feature"
              data={allFeatures}
              value={selectedFeature}
              onChange={setSelectedFeature}
              clearable
              style={{ maxWidth: 300 }}
            />
            <Grid>
              {filteredInstances.length > 0 ? (
                filteredInstances.map((instance) => (
                  <Grid.Col key={instance.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card 
                      shadow="sm" 
                      padding={0} 
                      radius="md" 
                      withBorder 
                      h="100%"
                      component="a"
                      href={instance.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
                      }}
                    >
                      <Stack gap="sm">
                        {instance.screenshot && (
                          <Box
                            style={{ 
                              width: '100%', 
                              aspectRatio: '4 / 3', 
                              overflow: 'hidden', 
                              borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0', 
                              position: 'relative'
                            }}
                          >
                            <Image
                              src={instance.screenshot}
                              alt={instance.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </Box>
                        )}
                        <Box px="lg" pb="lg">
                          <Stack gap="sm">
                            <Title order={4}>{instance.name}</Title>
                            <Group gap="xs">
                              {instance.features.map((feature) => (
                                <Badge key={feature} size="sm" variant="light">
                                  {feature}
                                </Badge>
                              ))}
                            </Group>
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))
              ) : (
                <Grid.Col span={12}>
                  <Text c="dimmed" ta="center" py="xl">
                    No instances found for this category. {instances.length > 0 && `Total instances loaded: ${instances.length}`}
                  </Text>
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="Virtual Showroom" pt="xl">
          <Stack gap="md">
            <Select
              placeholder="Filter by feature"
              data={allFeatures}
              value={selectedFeature}
              onChange={setSelectedFeature}
              clearable
              style={{ maxWidth: 300 }}
            />
            <Grid>
              {filteredInstances.length > 0 ? (
                filteredInstances.map((instance) => (
                  <Grid.Col key={instance.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card 
                      shadow="sm" 
                      padding={0} 
                      radius="md" 
                      withBorder 
                      h="100%"
                      component="a"
                      href={instance.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
                      }}
                    >
                      <Stack gap="sm">
                        {instance.screenshot && (
                          <Box
                            style={{ 
                              width: '100%', 
                              aspectRatio: '4 / 3', 
                              overflow: 'hidden', 
                              borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0', 
                              position: 'relative'
                            }}
                          >
                            <Image
                              src={instance.screenshot}
                              alt={instance.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </Box>
                        )}
                        <Box px="lg" pb="lg">
                          <Stack gap="sm">
                            <Title order={4}>{instance.name}</Title>
                            <Group gap="xs">
                              {instance.features.map((feature) => (
                                <Badge key={feature} size="sm" variant="light">
                                  {feature}
                                </Badge>
                              ))}
                            </Group>
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))
              ) : (
                <Grid.Col span={12}>
                  <Text c="dimmed" ta="center" py="xl">
                    No instances found for this category. {instances.length > 0 && `Total instances loaded: ${instances.length}`}
                  </Text>
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}


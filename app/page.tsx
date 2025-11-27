'use client';

import { useEffect, useState } from 'react';
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
} from '@mantine/core';
import { ExploreInstance, InstanceType } from './lib/types';

export default function HomePage() {
  const [instances, setInstances] = useState<ExploreInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InstanceType>('Virtual Showroom');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      // Use relative path that works with basePath
      const basePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
      const response = await fetch(`${basePath}/instances.json`);
      const data = await response.json();
      // Fix screenshot paths to be absolute
      const instancesWithPaths = data.map((instance: ExploreInstance) => ({
        ...instance,
        screenshot: instance.screenshot ? `${basePath}${instance.screenshot.replace(/^\./, '')}` : undefined,
      }));
      setInstances(instancesWithPaths);
    } catch (error) {
      console.error('Failed to load instances:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstances = instances.filter((instance) => {
    if (instance.type !== activeTab) return false;
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

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl" ta="center">
        Explore Showcases
      </Title>

      <Tabs
        value={activeTab}
        onChange={(value) => {
          setActiveTab(value as InstanceType);
          setSelectedFeature(null);
        }}
        mb="xl"
      >
        <Tabs.List justify="center">
          <Tabs.Tab value="Virtual Showroom">
            Virtual Showroom ({showroomInstances.length})
          </Tabs.Tab>
          <Tabs.Tab value="Apartment Chooser">
            Apartment Chooser ({apartmentInstances.length})
          </Tabs.Tab>
        </Tabs.List>

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
              {filteredInstances.map((instance) => (
                  <Grid.Col key={instance.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                      <Stack gap="sm">
                        {instance.screenshot && (
                          <Image
                            src={instance.screenshot}
                            alt={instance.name}
                            height={200}
                            fit="cover"
                            radius="sm"
                          />
                        )}
                        <Title order={4}>{instance.name}</Title>
                        <Group gap="xs">
                          {instance.features.map((feature) => (
                            <Badge key={feature} size="sm" variant="light">
                              {feature}
                            </Badge>
                          ))}
                        </Group>
                        <Button
                          component="a"
                          href={instance.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                          mt="auto"
                        >
                          Open
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
            </Grid>
            {filteredInstances.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No instances found
              </Text>
            )}
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
              {filteredInstances.map((instance) => (
                  <Grid.Col key={instance.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                      <Stack gap="sm">
                        {instance.screenshot && (
                          <Image
                            src={instance.screenshot}
                            alt={instance.name}
                            height={200}
                            fit="cover"
                            radius="sm"
                          />
                        )}
                        <Title order={4}>{instance.name}</Title>
                        <Group gap="xs">
                          {instance.features.map((feature) => (
                            <Badge key={feature} size="sm" variant="light">
                              {feature}
                            </Badge>
                          ))}
                        </Group>
                        <Button
                          component="a"
                          href={instance.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          fullWidth
                          mt="auto"
                        >
                          Open
                        </Button>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
            </Grid>
            {filteredInstances.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No instances found
              </Text>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}


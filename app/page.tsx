'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as TablerIcons from '@tabler/icons-react';
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
  Modal,
  TextInput,
  Checkbox,
  FileButton,
  ActionIcon,
  Alert,
  Popover,
  ScrollArea,
} from '@mantine/core';

// Add pulsating animation
const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
`;
import { IconLogin, IconLogout, IconEdit, IconPlus, IconPhoto, IconSettings, IconX, IconArrowUp, IconArrowDown, IconGripVertical, IconPalette, IconSearch, IconBuilding, IconStar, IconStarFilled } from '@tabler/icons-react';
import { ExploreInstance, InstanceType, FeatureConfig, FeatureWithColor, ClientConfig, Client } from './lib/types';

// Icon Picker Component
function IconPickerContent({ 
  searchTerm, 
  onSearchChange, 
  selectedIcon, 
  onSelect 
}: { 
  searchTerm: string; 
  onSearchChange: (value: string) => void; 
  selectedIcon?: string; 
  onSelect: (iconName: string) => void;
}) {
  const filteredIcons = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return Object.keys(TablerIcons)
      .filter(name => 
        name.startsWith('Icon') && 
        (searchLower === '' || name.toLowerCase().includes(searchLower))
      )
      .slice(0, 100); // Limit to 100 icons for performance
  }, [searchTerm]);

  return (
    <Stack gap="xs" p="xs">
      <TextInput
        placeholder="Search icons..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        size="sm"
      />
      <ScrollArea h={300}>
        <Box p="xs">
          <Group gap="xs">
            {filteredIcons.map((iconName) => {
              const IconComponent = (TablerIcons as any)[iconName];
              return (
                <ActionIcon
                  key={iconName}
                  variant={selectedIcon === iconName ? 'filled' : 'light'}
                  size="lg"
                  onClick={() => onSelect(iconName)}
                  title={iconName.replace('Icon', '')}
                  style={{ 
                    border: selectedIcon === iconName ? '2px solid var(--mantine-color-purple-6)' : '1px solid transparent'
                  }}
                >
                  <IconComponent size={20} />
                </ActionIcon>
              );
            })}
          </Group>
        </Box>
      </ScrollArea>
    </Stack>
  );
}

// Placeholder image path for projects without screenshots
const PLACEHOLDER_IMAGE = '/placeholder.png';

export default function HomePage() {
  const router = useRouter();
  const [instances, setInstances] = useState<ExploreInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InstanceType | 'All'>('All');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured'>('all');
  const [featuredInstances, setFeaturedInstances] = useState<Set<string>>(new Set());
  const [groupBy1, setGroupBy1] = useState<'none' | 'client' | 'status' | 'feature'>('none');
  const [groupBy2, setGroupBy2] = useState<'none' | 'client' | 'status' | 'feature'>('none');
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<'viewer' | 'admin' | 'partner'>('viewer');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [basePath, setBasePath] = useState<string>('');
  
  // Admin form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formType, setFormType] = useState<InstanceType | null>(null);
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [formScreenshot, setFormScreenshot] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [features, setFeatures] = useState<FeatureConfig>({
    'Virtual Showroom': [],
    'Apartment Chooser': [],
  });
  const [featuresModalOpened, setFeaturesModalOpened] = useState(false);
  const [editingFeatures, setEditingFeatures] = useState<FeatureConfig>({
    'Virtual Showroom': [],
    'Apartment Chooser': [],
  });
  const [featureColors, setFeatureColors] = useState<Record<string, string>>({});
  const [featureIcons, setFeatureIcons] = useState<Record<string, string>>({});
  const [colorPickerOpen, setColorPickerOpen] = useState<Record<string, boolean>>({});
  const [paletteModalOpened, setPaletteModalOpened] = useState(false);
  const [editingPalette, setEditingPalette] = useState<string[]>([]);
  const [iconPickerOpen, setIconPickerOpen] = useState<Record<string, boolean>>({});
  const [iconSearchTerm, setIconSearchTerm] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<ClientConfig>({});
  const [clientsModalOpened, setClientsModalOpened] = useState(false);
  const [editingClients, setEditingClients] = useState<ClientConfig>({});
  const [editingClientName, setEditingClientName] = useState<string>('');
  const [editingClientWebsite, setEditingClientWebsite] = useState<string>('');
  const [editingClientLogo, setEditingClientLogo] = useState<string>('');
  const [fetchingFavicon, setFetchingFavicon] = useState<string | null>(null);

  // Helper function to get icon for a feature name - memoized with useCallback
  const getFeatureIcon = useCallback((featureName: string): string | undefined => {
    // First check the featureIcons state
    if (featureIcons[featureName]) {
      return featureIcons[featureName];
    }
    // Fallback: look up in features config
    for (const typeFeatures of Object.values(features)) {
      const feature = typeFeatures.find((f: string | FeatureWithColor) =>
        (typeof f === 'string' ? f : f.name) === featureName
      );
      if (feature && typeof feature !== 'string' && feature.icon) {
        return feature.icon;
      }
    }
    return undefined;
  }, [featureIcons, features]);

  // Calculate color lightness (0-1, where 0 is black and 1 is white) - memoized
  const getColorLightness = useCallback((color: string): number => {
    // Remove # if present
    const hex = color.replace('#', '');
    if (hex.length !== 6) return 0.5; // Default to medium if invalid
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance using WCAG formula for better accuracy
    const [rs, gs, bs] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    return luminance;
  }, []);

  // Default color palette
  const defaultColorPalette = [
    '#0A082D', // Very dark navy
    '#00628C', // Dark teal
    '#5E19B8', // Darker purple
    '#8027F4', // Purple Rain
    '#A355FF', // Medium purple
    '#5BBBDD', // Medium sky blue
    '#FFCC7F', // Warm yellow/gold
    '#C18CFF', // Light purple
    '#B2BAD3', // Light gray
    '#EBD2FF', // Very light purple
    '#B5F2FF', // Very light sky blue
    '#F0F2F9', // Off-white
    '#FFF5D9', // Very light cream
  ];

  const [colorPalette, setColorPalette] = useState<string[]>(defaultColorPalette.sort((a, b) => getColorLightness(a) - getColorLightness(b)));

  const loadFeatureColors = async () => {
    try {
      const basePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
      const response = await fetch(`${basePath}/data/feature-colors.json`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setFeatureColors(data);
      }
    } catch (error) {
      // File doesn't exist yet, that's okay
    }
  };

  const saveFeatureColors = async (colors: Record<string, string>) => {
    try {
      const response = await fetch('/api/feature-colors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colors),
      });
      if (response.ok) {
        setFeatureColors(colors);
      }
    } catch (error) {
      console.error('Failed to save feature colors:', error);
    }
  };

  // Calculate if a color is dark or light - memoized
  // Using 0.5 threshold - values below are dark (use white text), above are light (use dark text)
  const isColorDark = useCallback((color: string): boolean => {
    if (!color) return false;
    const lightness = getColorLightness(color);
    // Lower threshold to ensure bright colors get dark text
    return lightness < 0.45;
  }, [getColorLightness]);

  // Load featured instances from localStorage
  const loadFeaturedInstances = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('featuredInstances');
        if (stored) {
          setFeaturedInstances(new Set(JSON.parse(stored)));
        }
      } catch (error) {
        console.error('Error loading featured instances:', error);
      }
    }
  };

  // Save featured instances to localStorage
  const saveFeaturedInstances = (featured: Set<string>) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('featuredInstances', JSON.stringify(Array.from(featured)));
        setFeaturedInstances(featured);
      } catch (error) {
        console.error('Error saving featured instances:', error);
      }
    }
  };

  // Toggle featured status for an instance
  const toggleFeatured = (instanceId: string) => {
    const newFeatured = new Set(featuredInstances);
    if (newFeatured.has(instanceId)) {
      newFeatured.delete(instanceId);
    } else {
      newFeatured.add(instanceId);
    }
    saveFeaturedInstances(newFeatured);
  };

  useEffect(() => {
    // Load all data in parallel for better performance
    Promise.all([
      loadInstances(),
      loadFeatures(),
      checkAuth(),
      loadColorPalette(),
      loadClients(),
    ]).catch(console.error);
    loadFeaturedInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadColorPalette = async () => {
    try {
      const basePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
      const response = await fetch(`${basePath}/data/color-palette.json`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Use saved palette (keep user's order, don't auto-sort)
          setColorPalette(data);
        }
      }
    } catch (error) {
      // Use default palette
    }
  };

  const saveColorPalette = async (palette: string[]) => {
    try {
      const response = await fetch('/api/color-palette', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(palette),
      });
      if (response.ok) {
        setColorPalette(palette);
        setPaletteModalOpened(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save color palette');
      }
    } catch (error) {
      console.error('Failed to save color palette:', error);
      alert('Failed to save color palette');
    }
  };

  const loadClients = async (): Promise<ClientConfig | null> => {
    try {
      const basePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
      const response = await fetch(`${basePath}/data/clients.json`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
        return data;
      } else if (response.status === 404) {
        // File doesn't exist yet, return empty object
        const emptyClients: ClientConfig = {};
        setClients(emptyClients);
        return emptyClients;
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
      // Return empty object on error so modal can still open
      const emptyClients: ClientConfig = {};
      setClients(emptyClients);
      return emptyClients;
    }
    // Return empty object instead of null
    const emptyClients: ClientConfig = {};
    setClients(emptyClients);
    return emptyClients;
  };

  const saveClients = async (clientsToSave: ClientConfig, logoData?: { clientName: string; logoData: string }) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients: clientsToSave, clientLogo: logoData }),
      });
      if (response.ok) {
        await loadClients();
        setClientsModalOpened(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save clients');
      }
    } catch (error) {
      console.error('Failed to save clients:', error);
      alert('Failed to save clients');
    }
  };

  const fetchFavicon = async (url: string) => {
    if (!url) return;
    setFetchingFavicon(url);
    try {
      const response = await fetch('/api/clients/favicon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();
      if (response.ok && data.favicon) {
        setEditingClientLogo(data.favicon);
      } else {
        alert('Could not fetch favicon. You can paste an image instead.');
      }
    } catch (error) {
      console.error('Failed to fetch favicon:', error);
      alert('Failed to fetch favicon. You can paste an image instead.');
    } finally {
      setFetchingFavicon(null);
    }
  };

  // Removed periodic refresh - only refresh on user actions for better performance

  const checkAuth = async () => {
    // For static export environments (e.g. GitHub Pages) we can't use API routes.
    // Instead, rely on a simple client-side session stored in localStorage.
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.startsWith('/explore') ? '/explore' : '';

      if (process.env.NODE_ENV === 'production') {
        const session = window.localStorage.getItem('explore_session');
        const role = (window.localStorage.getItem('explore_user_role') || 'viewer') as 'viewer' | 'admin' | 'partner';
        const adminFlag = window.localStorage.getItem('explore_is_admin') === 'true';

        if (session === 'authenticated') {
          setAuthenticated(true);
          setIsAdmin(adminFlag);
          setUserRole(role);
          setCheckingAuth(false);
          return;
        }

        // Not authenticated in production static export – send to login under correct base path
        window.location.replace(`${basePath}/login`);
        return;
      }
    }

    // Development / server mode: use real API auth
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
      
      const response = await fetch('/api/auth/', {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (data.authenticated) {
        setAuthenticated(true);
        setIsAdmin(data.isAdmin || false);
        setUserRole(data.role || 'viewer');
        setCheckingAuth(false);
      } else {
        // Not authenticated, redirect immediately
        window.location.replace('/login');
      }
    } catch (error) {
      // On error or timeout, redirect immediately
      window.location.replace('/login');
    }
  };

  const loadFeatures = async (): Promise<FeatureConfig | null> => {
    try {
      const basePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
      const response = await fetch(`${basePath}/data/features.json`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        
        // Migrate old format (string[]) to new format (FeatureWithColor[])
        const migrated: FeatureConfig = {
          "Virtual Showroom": Array.isArray(data["Virtual Showroom"]) 
            ? data["Virtual Showroom"].map((f: string | FeatureWithColor, index: number) => {
                if (typeof f === 'string') {
                  return { name: f, color: colorPalette[index % colorPalette.length] || '#8027F4' };
                }
                return f;
              })
            : [],
          "Apartment Chooser": Array.isArray(data["Apartment Chooser"])
            ? data["Apartment Chooser"].map((f: string | FeatureWithColor, index: number) => {
                if (typeof f === 'string') {
                  return { name: f, color: colorPalette[index % colorPalette.length] || '#8027F4' };
                }
                return f;
              })
            : [],
        };
        
        setFeatures(migrated);
        
        // Extract colors and icons from features
        const colors: Record<string, string> = {};
        const icons: Record<string, string> = {};
        Object.values(migrated).forEach(typeFeatures => {
          typeFeatures.forEach((feature: FeatureWithColor) => {
            colors[feature.name] = feature.color;
            if (feature.icon) {
              icons[feature.name] = feature.icon;
            }
          });
        });
        setFeatureColors(colors);
        setFeatureIcons(icons);
        
        return migrated;
      }
    } catch (error) {
      console.error('Failed to load features:', error);
      // Set default empty features on error
      setFeatures({
        'Virtual Showroom': [],
        'Apartment Chooser': [],
      });
    }
    return null;
  };

  const handleLogout = async () => {
    await fetch('/api/auth/', { method: 'DELETE' });
    setAuthenticated(false);
    setIsAdmin(false);
    router.push('/login');
  };

  // Removed handleFileChange - only paste is supported now

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormScreenshot(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormClient('');
    setFormLink('');
    setFormType(null);
    setFormFeatures([]);
    setFormScreenshot('');
    setFormDescription('');
    setFormActive(true);
    setEditingId(null);
  };

  const openEditModal = (instance: ExploreInstance) => {
    setEditingId(instance.id);
    setFormName(instance.name);
    setFormClient(instance.client || '');
    setFormLink(instance.link);
    setFormType(instance.type);
    setFormFeatures(instance.features);
    setFormScreenshot(instance.screenshot || '');
    setFormDescription(instance.description || '');
    setFormActive(instance.active !== false);
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
        description: formDescription,
        client: formClient || undefined,
        active: formActive,
      };

      if (editingId) {
        const response = await fetch('/api/instances', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...instanceData }),
        });
        if (response.ok) {
          await loadInstances();
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
          await loadInstances();
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
        await loadInstances();
      }
    } catch (error) {
      console.error('Failed to delete instance:', error);
    }
  };

  const loadInstances = async () => {
    try {
      // Use relative path that works with basePath
      const currentBasePath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
      setBasePath(currentBasePath);
      // Remove cache-busting for better performance - use cache headers instead
      // Ensure we have a leading slash
      const instancesPath = currentBasePath ? `${currentBasePath}/instances.json` : '/instances.json';
      const url = instancesPath;
      
      let response: Response;
      try {
        response = await fetch(url, { cache: 'no-store' });
      } catch (fetchError) {
        // Network error, try alternative path
        if (currentBasePath) {
          try {
            response = await fetch('/instances.json', { cache: 'no-store' });
          } catch {
            throw new Error('Failed to fetch instances: Network error');
          }
        } else {
          throw new Error('Failed to fetch instances: Network error');
        }
      }
      
      if (!response.ok) {
        // Try alternative path without basePath
        if (currentBasePath) {
          const altResponse = await fetch('/instances.json', { cache: 'no-store' });
          if (altResponse.ok) {
            response = altResponse;
          } else {
            throw new Error(`Failed to fetch instances: ${response.status} ${response.statusText}`);
          }
        } else {
          throw new Error(`Failed to fetch instances: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
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
          if (currentBasePath && !screenshotPath.startsWith(currentBasePath)) {
            screenshotPath = currentBasePath + screenshotPath;
          }
        }
        return {
          ...instance,
          screenshot: screenshotPath || undefined,
        };
      });
      
      // Always update to ensure we have the latest data
      setInstances(instancesWithPaths);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load instances:', error);
      // Set empty array on error to show empty state instead of loading forever
      setInstances([]);
      setLoading(false);
    }
  };

  const filteredInstances = useMemo(() => {
    return instances.filter((instance) => {
      // Partner role: only show featured instances
      if (userRole === 'partner' && !featuredInstances.has(instance.id)) return false;
      
      if (activeTab !== 'All' && instance.type !== activeTab) return false;
      if (selectedFeature && !instance.features.includes(selectedFeature)) return false;
      if (statusFilter === 'active' && instance.active === false) return false;
      if (statusFilter === 'inactive' && instance.active !== false) return false;
      if (clientFilter && (instance.client || '').trim() !== clientFilter) return false;
      if (featuredFilter === 'featured' && !featuredInstances.has(instance.id)) return false;
      return true;
    });
  }, [instances, activeTab, selectedFeature, statusFilter, clientFilter, featuredFilter, featuredInstances, userRole]);

  const clientOptions = useMemo(() => {
    const clients = Array.from(
      new Set(
        instances
          .map((i) => (i.client || '').trim())
          .filter((c) => c.length > 0)
      )
    ).sort((a, b) => a.localeCompare(b));
    return clients.map((c) => ({ value: c, label: c }));
  }, [instances]);

  const allFeatures = Array.from(
    new Set(instances.flatMap((i) => i.features))
  ).sort();

  const groupedFeatures = useMemo(() => {
    return [
      {
        group: 'Virtual Showroom',
        items: features['Virtual Showroom']
          .map(f => typeof f === 'string' ? f : f.name)
          .filter(f => instances.some(i => i.type === 'Virtual Showroom' && i.features.includes(f)))
          .map(f => ({ value: f, label: f })),
      },
      {
        group: 'Apartment Chooser',
        items: features['Apartment Chooser']
          .map(f => typeof f === 'string' ? f : f.name)
          .filter(f => instances.some(i => i.type === 'Apartment Chooser' && i.features.includes(f)))
          .map(f => ({ value: f, label: f })),
      },
    ].filter(group => group.items.length > 0);
  }, [features, instances]);

  const showroomInstances = useMemo(() => instances.filter((i) => i.type === 'Virtual Showroom'), [instances]);
  const apartmentInstances = useMemo(() => instances.filter((i) => i.type === 'Apartment Chooser'), [instances]);

  // Grouping logic
  const getGroupKey = (instance: ExploreInstance, groupBy: 'client' | 'status' | 'feature'): string => {
    if (groupBy === 'client') {
      return instance.client || '(No Client)';
    }
    if (groupBy === 'status') {
      return instance.active === false ? 'Inactive' : 'Active';
    }
    if (groupBy === 'feature') {
      // Group by first feature, or "(No Features)" if none
      return instance.features.length > 0 ? instance.features[0] : '(No Features)';
    }
    return '';
  };

  const groupedInstances = useMemo(() => {
    if (groupBy1 === 'none') {
      return { '': filteredInstances };
    }

    const groups: Record<string, ExploreInstance[]> = {};
    
    for (const instance of filteredInstances) {
      const key1 = getGroupKey(instance, groupBy1);
      
      if (groupBy2 === 'none') {
        if (!groups[key1]) groups[key1] = [];
        groups[key1].push(instance);
      } else {
        // Two-level grouping
        const key2 = getGroupKey(instance, groupBy2);
        const combinedKey = `${key1} | ${key2}`;
        if (!groups[combinedKey]) groups[combinedKey] = [];
        groups[combinedKey].push(instance);
      }
    }

    // Sort group keys
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      if (groupBy1 === 'status') {
        // Status: Active first
        if (a.includes('Active') && b.includes('Inactive')) return -1;
        if (a.includes('Inactive') && b.includes('Active')) return 1;
      }
      return a.localeCompare(b);
    });

    const result: Record<string, ExploreInstance[]> = {};
    for (const key of sortedKeys) {
      result[key] = groups[key];
    }
    return result;
  }, [filteredInstances, groupBy1, groupBy2]);

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <Container size="fluid" py="xl" px="md">
        <div>Loading...</div>
      </Container>
    );
  }

  // If not authenticated, redirect immediately (no delay)
  if (!authenticated && !checkingAuth) {
    // Use replace instead of href to avoid adding to history
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
    return null;
  }

  // Show loading state only if we have no instances and are still loading
  if (loading && instances.length === 0) {
    return (
      <Container size="fluid" py="xl" px="md">
        <div>Loading...</div>
      </Container>
    );
  }

  // Removed excessive logging - only log on actual changes

  return (
    <Container size="fluid" py="xl" px="md">
      <Box pos="relative" mb="xl">
        <Group gap="sm" align="center" mb="xl">
          <svg width="18" height="22" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M5.00937 0.242306L7.30305 1.56555C7.8636 1.88894 8.20896 2.48688 8.20896 3.13401V5.77841C8.20896 6.42554 7.8636 7.02348 7.30305 7.34687L1.15079 10.8962C0.639232 11.1913 0 10.8221 0 10.2315V7.73469C0 7.14412 0.639233 6.77493 1.15079 7.07005L3.45101 8.39707C3.661 8.51822 3.9234 8.36667 3.9234 8.12424V5.23758C3.9234 4.8188 3.69991 4.43186 3.33716 4.22259L0.970786 2.8574C0.458945 2.56211 0.458946 1.82341 0.970786 1.52812L3.19958 0.242306C3.75959 -0.0807688 4.44937 -0.0807684 5.00937 0.242306Z" fill="currentColor"/>
          </svg>
          <Title order={1} style={{ fontSize: '1.2rem' }}>
            Explore Showcases
          </Title>
        </Group>
        <Group gap="md" style={{ position: 'absolute', top: 0, right: 0 }}>
          <Text
            component="a"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            style={{ cursor: 'pointer', textDecoration: 'none' }}
            size="sm"
          >
            Log out
          </Text>
        </Group>
      </Box>

      {isAdmin && (
        <Group mb="xl" gap="sm">
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              resetForm();
              setModalOpened(true);
            }}
            size="sm"
            variant="filled"
            color="purple"
          >
            Add New
          </Button>
          <Button
            variant="light"
            color="purple"
            leftSection={<IconSettings size={16} />}
            onClick={async () => {
              const migratedFeatures = await loadFeatures();
              if (migratedFeatures) {
                setEditingFeatures(migratedFeatures);
                // Extract colors and icons from features
                const colors: Record<string, string> = {};
                const icons: Record<string, string> = {};
                Object.values(migratedFeatures).forEach(typeFeatures => {
                  typeFeatures.forEach((feature: FeatureWithColor) => {
                    colors[feature.name] = feature.color;
                    if (feature.icon) {
                      icons[feature.name] = feature.icon;
                    }
                  });
                });
                setFeatureColors(colors);
                setFeatureIcons(icons);
                setFeaturesModalOpened(true);
              }
            }}
            size="sm"
          >
            Features
          </Button>
          <Button
            variant="light"
            color="purple"
            leftSection={<IconPalette size={16} />}
            onClick={() => {
              setEditingPalette([...colorPalette]);
              setPaletteModalOpened(true);
            }}
            size="sm"
          >
            Colors
          </Button>
          <Button
            variant="light"
            color="purple"
            leftSection={<IconBuilding size={16} />}
            onClick={async () => {
              const loadedClients = await loadClients();
              setEditingClients(loadedClients || {});
              setClientsModalOpened(true);
            }}
            size="sm"
          >
            Clients
          </Button>
        </Group>
      )}

      <Tabs
        value={activeTab}
        onChange={(value) => {
          setActiveTab(value as InstanceType | 'All');
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
            <Group gap="sm" align="flex-end" wrap="wrap">
              <Select
                placeholder="Filter by client"
                data={clientOptions}
                value={clientFilter}
                onChange={setClientFilter}
                clearable
                style={{ maxWidth: 220 }}
                styles={{
                  input: {
                    color: clientFilter ? 'var(--mantine-color-text) !important' : 'rgba(255, 255, 255, 0.5) !important',
                  },
                }}
              />
              <Select
                placeholder="Filter by feature"
                data={groupedFeatures}
                value={selectedFeature}
                onChange={setSelectedFeature}
                clearable
                style={{ maxWidth: 260 }}
                styles={{
                  input: {
                    color: selectedFeature ? 'var(--mantine-color-text) !important' : 'rgba(255, 255, 255, 0.5) !important',
                  },
                }}
              />
              <Select
                placeholder="All statuses"
                data={[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter((value as 'all' | 'active' | 'inactive') || 'all')
                }
                style={{ maxWidth: 160 }}
                styles={{
                  input: {
                    color: 'var(--mantine-color-text) !important',
                  },
                }}
              />
              {userRole !== 'partner' && (
                <Select
                  placeholder="Featured"
                  data={[
                    { value: 'all', label: 'All' },
                    { value: 'featured', label: 'Featured' },
                  ]}
                  value={featuredFilter}
                  onChange={(value) => {
                    setFeaturedFilter((value as 'all' | 'featured') || 'all');
                  }}
                  style={{ maxWidth: 160 }}
                  styles={{
                    input: {
                      color: 'var(--mantine-color-text) !important',
                    },
                  }}
                />
              )}
              <Select
                placeholder="Group by..."
                data={[
                  { value: 'none', label: 'No grouping' },
                  { value: 'client', label: 'Client' },
                  { value: 'status', label: 'Status' },
                  { value: 'feature', label: 'Feature' },
                ]}
                value={groupBy1}
                onChange={(value) => {
                  setGroupBy1((value as 'none' | 'client' | 'status' | 'feature') || 'none');
                  if (value === groupBy2) setGroupBy2('none');
                }}
                style={{ maxWidth: 160 }}
                styles={{
                  input: {
                    color: 'var(--mantine-color-text) !important',
                  },
                }}
              />
              {groupBy1 !== 'none' && (
                <Select
                  placeholder="Then by..."
                  data={[
                    { value: 'none', label: 'None' },
                    ...(groupBy1 !== 'client' ? [{ value: 'client', label: 'Client' }] : []),
                    ...(groupBy1 !== 'status' ? [{ value: 'status', label: 'Status' }] : []),
                    ...(groupBy1 !== 'feature' ? [{ value: 'feature', label: 'Feature' }] : []),
                  ]}
                  value={groupBy2}
                  onChange={(value) =>
                    setGroupBy2((value as 'none' | 'client' | 'status' | 'feature') || 'none')
                  }
                  style={{ maxWidth: 160 }}
                  styles={{
                    input: {
                      color: 'var(--mantine-color-text) !important',
                    },
                  }}
                />
              )}
            </Group>
            {Object.keys(groupedInstances).length > 0 ? (
              Object.entries(groupedInstances).map(([groupKey, groupInstances]) => (
                <Box key={groupKey}>
                  {groupKey && (
                    <Title order={3} mb="md" mt={groupKey === Object.keys(groupedInstances)[0] ? 0 : 'xl'}>
                      {groupKey.includes(' | ') ? (
                        <>
                          {groupKey.split(' | ')[0]} <Text component="span" c="dimmed" size="md" fw={400}>→ {groupKey.split(' | ')[1]}</Text>
                        </>
                      ) : (
                        groupKey
                      )}
                      <Badge ml="sm" size="sm" variant="light">{groupInstances.length}</Badge>
                    </Title>
                  )}
                  <Grid gutter="md">
                    {groupInstances.map((instance, index) => (
                      <Grid.Col key={instance.id} span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                        <Card 
                      shadow="sm"
                      style={{ 
                        maxWidth: 480, 
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        textDecoration: 'none',
                      }} 
                      padding={0} 
                      radius="md" 
                      withBorder 
                      h="100%"
                      component="a"
                      href={instance.link}
                      target="_blank"
                      rel="noopener noreferrer"
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
                            src={(instance.screenshot && instance.screenshot.trim()) ? (basePath && !instance.screenshot.startsWith(basePath) ? `${basePath}${instance.screenshot}` : instance.screenshot) : (basePath ? `${basePath}${PLACEHOLDER_IMAGE}` : PLACEHOLDER_IMAGE)}
                            alt={instance.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: 'var(--mantine-color-gray-1)' }}
                            loading={index < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchPriority={index < 3 ? 'high' : 'auto'}
                            onError={(e) => {
                              // Fallback to placeholder if screenshot fails to load
                              const target = e.target as HTMLImageElement;
                              const placeholderSrc = basePath ? `${basePath}${PLACEHOLDER_IMAGE}` : PLACEHOLDER_IMAGE;
                              // Only retry once to avoid infinite loop
                              if (!target.dataset.retried && target.src !== placeholderSrc) {
                                target.dataset.retried = 'true';
                                target.src = placeholderSrc;
                              }
                            }}
                          />
                          {userRole !== 'partner' && (
                            <ActionIcon
                              variant="filled"
                              color={featuredInstances.has(instance.id) ? 'yellow' : 'gray'}
                              size="sm"
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 10,
                                backgroundColor: featuredInstances.has(instance.id) ? 'var(--mantine-color-yellow-6)' : 'rgba(0, 0, 0, 0.5)',
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFeatured(instance.id);
                              }}
                            >
                              {featuredInstances.has(instance.id) ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                            </ActionIcon>
                          )}
                          {instance.features.length > 0 && (
                            <Box
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
                                padding: '1rem',
                              }}
                            >
                              <Group gap="xs">
                                {instance.features.map((feature) => {
                                  const featureColor = featureColors[feature];
                                  const featureIcon = getFeatureIcon(feature);
                                  const isDark = featureColor ? isColorDark(featureColor) : false;
                                  let IconComponent = null;
                                  if (featureIcon) {
                                    try {
                                      IconComponent = (TablerIcons as any)[featureIcon];
                                    } catch (e) {
                                      // Icon not found, silently continue
                                    }
                                  }
                                  return (
                                    <Badge 
                                      key={feature} 
                                      size="sm" 
                                      variant="light" 
                                      styles={{
                                        root: {
                                          backgroundColor: featureColor || 'rgba(255, 255, 255, 0.2)',
                                          color: featureColor ? (isDark ? 'white' : '#0A082D') : 'white',
                                        },
                                      }}
                                      leftSection={IconComponent ? <IconComponent size={14} /> : undefined}
                                    >
                                      {feature}
                                    </Badge>
                                  );
                                })}
                              </Group>
                            </Box>
                          )}
                        </Box>
                        <Box px="lg" pb="lg">
                          <Stack gap="sm">
                            <Group justify="space-between" align="center">
                              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                <Group gap={6} align="center" wrap="nowrap">
                                  <Title order={4} style={{ flex: 1, minWidth: 0 }}>
                                    {instance.name}
                                  </Title>
                                  <Badge
                                    size="sm"
                                    variant="light"
                                    color={instance.active === false ? 'gray' : 'green'}
                                    style={{
                                      animation: 'pulse 2s ease-in-out infinite',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {instance.active === false ? 'Inactive' : 'Active'}
                                  </Badge>
                                </Group>
                                {instance.client && (
                                  <Group gap={8} align="center">
                                    {clients[instance.client]?.logo && (() => {
                                      const logoPath = clients[instance.client]!.logo!;
                                      return (
                                        <Image
                                          src={basePath && !logoPath.startsWith(basePath) ? `${basePath}${logoPath}` : logoPath}
                                          alt={instance.client}
                                          width={16}
                                          height={16}
                                          style={{ borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                      );
                                    })()}
                                    <Text size="xs" c="dimmed">
                                      {instance.client}
                                    </Text>
                                  </Group>
                                )}
                              </Stack>
                              {isAdmin && (
                                <ActionIcon
                                  variant="subtle"
                                  color="purple"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openEditModal(instance);
                                  }}
                                  size="sm"
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                              )}
                            </Group>
                            {instance.description && (
                              <Text
                                size="sm"
                                c="dimmed"
                                lineClamp={2}
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {instance.description}
                              </Text>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Box>
              ))
            ) : (
              <Grid>
                <Grid.Col span={12}>
                  <Text c="dimmed" ta="center" py="xl">
                    No instances found. {instances.length > 0 && `Total instances loaded: ${instances.length}`}
                  </Text>
                </Grid.Col>
              </Grid>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="Apartment Chooser" pt="xl">
          <Stack gap="md">
            <Group gap="sm" align="flex-end" wrap="wrap">
              <Select
                placeholder="Filter by client"
                data={clientOptions}
                value={clientFilter}
                onChange={setClientFilter}
                clearable
                style={{ maxWidth: 220 }}
                styles={{
                  input: {
                    color: clientFilter ? 'var(--mantine-color-text) !important' : 'rgba(255, 255, 255, 0.5) !important',
                  },
                }}
              />
              <Select
                placeholder="Filter by feature"
                data={groupedFeatures}
                value={selectedFeature}
                onChange={setSelectedFeature}
                clearable
                style={{ maxWidth: 260 }}
                styles={{
                  input: {
                    color: selectedFeature ? 'var(--mantine-color-text) !important' : 'rgba(255, 255, 255, 0.5) !important',
                  },
                }}
              />
              <Select
                placeholder="All statuses"
                data={[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter((value as 'all' | 'active' | 'inactive') || 'all')
                }
                style={{ maxWidth: 160 }}
                styles={{
                  input: {
                    color: 'var(--mantine-color-text) !important',
                  },
                }}
              />
              {userRole !== 'partner' && (
                <Select
                  placeholder="Featured"
                  data={[
                    { value: 'all', label: 'All' },
                    { value: 'featured', label: 'Featured' },
                  ]}
                  value={featuredFilter}
                  onChange={(value) => {
                    setFeaturedFilter((value as 'all' | 'featured') || 'all');
                  }}
                  style={{ maxWidth: 160 }}
                  styles={{
                    input: {
                      color: 'var(--mantine-color-text) !important',
                    },
                  }}
                />
              )}
              <Select
                placeholder="Group by..."
                data={[
                  { value: 'none', label: 'No grouping' },
                  { value: 'client', label: 'Client' },
                  { value: 'status', label: 'Status' },
                  { value: 'feature', label: 'Feature' },
                ]}
                value={groupBy1}
                onChange={(value) => {
                  setGroupBy1((value as 'none' | 'client' | 'status' | 'feature') || 'none');
                  if (value === groupBy2) setGroupBy2('none');
                }}
                style={{ maxWidth: 160 }}
                styles={{
                  input: {
                    color: 'var(--mantine-color-text) !important',
                  },
                }}
              />
              {groupBy1 !== 'none' && (
                <Select
                  placeholder="Then by..."
                  data={[
                    { value: 'none', label: 'None' },
                    ...(groupBy1 !== 'client' ? [{ value: 'client', label: 'Client' }] : []),
                    ...(groupBy1 !== 'status' ? [{ value: 'status', label: 'Status' }] : []),
                    ...(groupBy1 !== 'feature' ? [{ value: 'feature', label: 'Feature' }] : []),
                  ]}
                  value={groupBy2}
                  onChange={(value) =>
                    setGroupBy2((value as 'none' | 'client' | 'status' | 'feature') || 'none')
                  }
                  style={{ maxWidth: 160 }}
                  styles={{
                    input: {
                      color: 'var(--mantine-color-text) !important',
                    },
                  }}
                />
              )}
            </Group>
            {Object.keys(groupedInstances).length > 0 ? (
              Object.entries(groupedInstances).map(([groupKey, groupInstances]) => (
                <Box key={groupKey}>
                  {groupKey && (
                    <Title order={3} mb="md" mt={groupKey === Object.keys(groupedInstances)[0] ? 0 : 'xl'}>
                      {groupKey.includes(' | ') ? (
                        <>
                          {groupKey.split(' | ')[0]} <Text component="span" c="dimmed" size="md" fw={400}>→ {groupKey.split(' | ')[1]}</Text>
                        </>
                      ) : (
                        groupKey
                      )}
                      <Badge ml="sm" size="sm" variant="light">{groupInstances.length}</Badge>
                    </Title>
                  )}
                  <Grid gutter="md">
                    {groupInstances.map((instance, index) => (
                      <Grid.Col key={instance.id} span="content">
                        <Card 
                      shadow="sm"
                      style={{ 
                        maxWidth: 480, 
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        textDecoration: 'none',
                      }} 
                      padding={0} 
                      radius="md" 
                      withBorder 
                      h="100%"
                      component="a"
                      href={instance.link}
                      target="_blank"
                      rel="noopener noreferrer"
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
                            src={(instance.screenshot && instance.screenshot.trim()) ? (basePath && !instance.screenshot.startsWith(basePath) ? `${basePath}${instance.screenshot}` : instance.screenshot) : (basePath ? `${basePath}${PLACEHOLDER_IMAGE}` : PLACEHOLDER_IMAGE)}
                            alt={instance.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: 'var(--mantine-color-gray-1)' }}
                            loading={index < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchPriority={index < 3 ? 'high' : 'auto'}
                            onError={(e) => {
                              // Fallback to placeholder if screenshot fails to load
                              const target = e.target as HTMLImageElement;
                              const placeholderSrc = basePath ? `${basePath}${PLACEHOLDER_IMAGE}` : PLACEHOLDER_IMAGE;
                              // Only retry once to avoid infinite loop
                              if (!target.dataset.retried && target.src !== placeholderSrc) {
                                target.dataset.retried = 'true';
                                target.src = placeholderSrc;
                              }
                            }}
                          />
                          {userRole !== 'partner' && (
                            <ActionIcon
                              variant="filled"
                              color={featuredInstances.has(instance.id) ? 'yellow' : 'gray'}
                              size="sm"
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 10,
                                backgroundColor: featuredInstances.has(instance.id) ? 'var(--mantine-color-yellow-6)' : 'rgba(0, 0, 0, 0.5)',
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFeatured(instance.id);
                              }}
                            >
                              {featuredInstances.has(instance.id) ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                            </ActionIcon>
                          )}
                          {instance.features.length > 0 && (
                            <Box
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
                                padding: '1rem',
                              }}
                            >
                              <Group gap="xs">
                                {instance.features.map((feature) => {
                                  const featureColor = featureColors[feature];
                                  const featureIcon = getFeatureIcon(feature);
                                  const isDark = featureColor ? isColorDark(featureColor) : false;
                                  let IconComponent = null;
                                  if (featureIcon) {
                                    try {
                                      IconComponent = (TablerIcons as any)[featureIcon];
                                    } catch (e) {
                                      // Icon not found, silently continue
                                    }
                                  }
                                  return (
                                    <Badge 
                                      key={feature} 
                                      size="sm" 
                                      variant="light" 
                                      styles={{
                                        root: {
                                          backgroundColor: featureColor || 'rgba(255, 255, 255, 0.2)',
                                          color: featureColor ? (isDark ? 'white' : '#0A082D') : 'white',
                                        },
                                      }}
                                      leftSection={IconComponent ? <IconComponent size={14} /> : undefined}
                                    >
                                      {feature}
                                    </Badge>
                                  );
                                })}
                              </Group>
                            </Box>
                          )}
                        </Box>
                        <Box px="lg" pb="lg">
                          <Stack gap="sm">
                            <Group justify="space-between" align="center">
                              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                <Group gap={6} align="center" wrap="nowrap">
                                  <Title order={4} style={{ flex: 1, minWidth: 0 }}>
                                    {instance.name}
                                  </Title>
                                  <Badge
                                    size="sm"
                                    variant="light"
                                    color={instance.active === false ? 'gray' : 'green'}
                                    style={{
                                      animation: 'pulse 2s ease-in-out infinite',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {instance.active === false ? 'Inactive' : 'Active'}
                                  </Badge>
                                </Group>
                                {instance.client && (
                                  <Group gap={8} align="center">
                                    {clients[instance.client]?.logo && (() => {
                                      const logoPath = clients[instance.client]!.logo!;
                                      return (
                                        <Image
                                          src={basePath && !logoPath.startsWith(basePath) ? `${basePath}${logoPath}` : logoPath}
                                          alt={instance.client}
                                          width={16}
                                          height={16}
                                          style={{ borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                      );
                                    })()}
                                    <Text size="xs" c="dimmed">
                                      {instance.client}
                                    </Text>
                                  </Group>
                                )}
                              </Stack>
                              {isAdmin && (
                                <ActionIcon
                                  variant="subtle"
                                  color="purple"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openEditModal(instance);
                                  }}
                                  size="sm"
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                              )}
                            </Group>
                            {instance.description && (
                              <Text
                                size="sm"
                                c="dimmed"
                                lineClamp={2}
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {instance.description}
                              </Text>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid.Col>
                    ))}
                  </Grid>
                </Box>
              ))
            ) : (
              <Grid>
                <Grid.Col span={12}>
                  <Text c="dimmed" ta="center" py="xl">
                    No instances found. {instances.length > 0 && `Total instances loaded: ${instances.length}`}
                  </Text>
                </Grid.Col>
              </Grid>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="Virtual Showroom" pt="xl">
          <Stack gap="md">
            <Group gap="sm" align="flex-end" wrap="wrap">
              <Select
                placeholder="Filter by client"
                data={clientOptions}
                value={clientFilter}
                onChange={setClientFilter}
                clearable
                style={{ maxWidth: 220 }}
                styles={{
                  input: {
                    color: clientFilter ? 'var(--mantine-color-text) !important' : 'rgba(255, 255, 255, 0.5) !important',
                  },
                }}
              />
              <Select
                placeholder="Filter by feature"
                data={groupedFeatures}
                value={selectedFeature}
                onChange={setSelectedFeature}
                clearable
                style={{ maxWidth: 260 }}
                styles={{
                  input: {
                    color: selectedFeature ? 'var(--mantine-color-text) !important' : 'rgba(255, 255, 255, 0.5) !important',
                  },
                }}
              />
              <Select
                placeholder="All statuses"
                data={[
                  { value: 'all', label: 'All' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter((value as 'all' | 'active' | 'inactive') || 'all')
                }
                style={{ maxWidth: 160 }}
                styles={{
                  input: {
                    color: 'var(--mantine-color-text) !important',
                  },
                }}
              />
              {userRole !== 'partner' && (
                <Select
                  placeholder="Featured"
                  data={[
                    { value: 'all', label: 'All' },
                    { value: 'featured', label: 'Featured' },
                  ]}
                  value={featuredFilter}
                  onChange={(value) => {
                    setFeaturedFilter((value as 'all' | 'featured') || 'all');
                  }}
                  style={{ maxWidth: 160 }}
                  styles={{
                    input: {
                      color: 'var(--mantine-color-text) !important',
                    },
                  }}
                />
              )}
              <Select
                placeholder="Group by..."
                data={[
                  { value: 'none', label: 'No grouping' },
                  { value: 'client', label: 'Client' },
                  { value: 'status', label: 'Status' },
                  { value: 'feature', label: 'Feature' },
                ]}
                value={groupBy1}
                onChange={(value) => {
                  setGroupBy1((value as 'none' | 'client' | 'status' | 'feature') || 'none');
                  if (value === groupBy2) setGroupBy2('none');
                }}
                style={{ maxWidth: 160 }}
                styles={{
                  input: {
                    color: 'var(--mantine-color-text) !important',
                  },
                }}
              />
              {groupBy1 !== 'none' && (
                <Select
                  placeholder="Then by..."
                  data={[
                    { value: 'none', label: 'None' },
                    ...(groupBy1 !== 'client' ? [{ value: 'client', label: 'Client' }] : []),
                    ...(groupBy1 !== 'status' ? [{ value: 'status', label: 'Status' }] : []),
                    ...(groupBy1 !== 'feature' ? [{ value: 'feature', label: 'Feature' }] : []),
                  ]}
                  value={groupBy2}
                  onChange={(value) =>
                    setGroupBy2((value as 'none' | 'client' | 'status' | 'feature') || 'none')
                  }
                  style={{ maxWidth: 160 }}
                  styles={{
                    input: {
                      color: 'var(--mantine-color-text) !important',
                    },
                  }}
                />
              )}
            </Group>
            {Object.keys(groupedInstances).length > 0 ? (
              Object.entries(groupedInstances).map(([groupKey, groupInstances]) => (
                <Box key={groupKey}>
                  {groupKey && (
                    <Title order={3} mb="md" mt={groupKey === Object.keys(groupedInstances)[0] ? 0 : 'xl'}>
                      {groupKey.includes(' | ') ? (
                        <>
                          {groupKey.split(' | ')[0]} <Text component="span" c="dimmed" size="md" fw={400}>→ {groupKey.split(' | ')[1]}</Text>
                        </>
                      ) : (
                        groupKey
                      )}
                      <Badge ml="sm" size="sm" variant="light">{groupInstances.length}</Badge>
                    </Title>
                  )}
                  <Grid gutter="md">
                    {groupInstances.map((instance, index) => (
                      <Grid.Col key={instance.id} span="content">
                        <Card 
                      shadow="sm"
                      style={{ 
                        maxWidth: 480, 
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        textDecoration: 'none',
                      }} 
                      padding={0} 
                      radius="md" 
                      withBorder 
                      h="100%"
                      component="a"
                      href={instance.link}
                      target="_blank"
                      rel="noopener noreferrer"
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
                            src={(instance.screenshot && instance.screenshot.trim()) ? (basePath && !instance.screenshot.startsWith(basePath) ? `${basePath}${instance.screenshot}` : instance.screenshot) : (basePath ? `${basePath}${PLACEHOLDER_IMAGE}` : PLACEHOLDER_IMAGE)}
                            alt={instance.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', backgroundColor: 'var(--mantine-color-gray-1)' }}
                            loading={index < 6 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchPriority={index < 3 ? 'high' : 'auto'}
                            onError={(e) => {
                              // Fallback to placeholder if screenshot fails to load
                              const target = e.target as HTMLImageElement;
                              const placeholderSrc = basePath ? `${basePath}${PLACEHOLDER_IMAGE}` : PLACEHOLDER_IMAGE;
                              // Only retry once to avoid infinite loop
                              if (!target.dataset.retried && target.src !== placeholderSrc) {
                                target.dataset.retried = 'true';
                                target.src = placeholderSrc;
                              }
                            }}
                          />
                          {userRole !== 'partner' && (
                            <ActionIcon
                              variant="filled"
                              color={featuredInstances.has(instance.id) ? 'yellow' : 'gray'}
                              size="sm"
                              style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 10,
                                backgroundColor: featuredInstances.has(instance.id) ? 'var(--mantine-color-yellow-6)' : 'rgba(0, 0, 0, 0.5)',
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFeatured(instance.id);
                              }}
                            >
                              {featuredInstances.has(instance.id) ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                            </ActionIcon>
                          )}
                          {instance.features.length > 0 && (
                            <Box
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)',
                                padding: '1rem',
                              }}
                            >
                              <Group gap="xs">
                                {instance.features.map((feature) => {
                                  const featureColor = featureColors[feature];
                                  const featureIcon = getFeatureIcon(feature);
                                  const isDark = featureColor ? isColorDark(featureColor) : false;
                                  let IconComponent = null;
                                  if (featureIcon) {
                                    try {
                                      IconComponent = (TablerIcons as any)[featureIcon];
                                    } catch (e) {
                                      // Icon not found, silently continue
                                    }
                                  }
                                  return (
                                    <Badge 
                                      key={feature} 
                                      size="sm" 
                                      variant="light" 
                                      styles={{
                                        root: {
                                          backgroundColor: featureColor || 'rgba(255, 255, 255, 0.2)',
                                          color: featureColor ? (isDark ? 'white' : '#0A082D') : 'white',
                                        },
                                      }}
                                      leftSection={IconComponent ? <IconComponent size={14} /> : undefined}
                                    >
                                      {feature}
                                    </Badge>
                                  );
                                })}
                              </Group>
                            </Box>
                          )}
                        </Box>
                        <Box px="lg" pb="lg">
                          <Stack gap="sm">
                            <Group justify="space-between" align="center">
                              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                                <Group gap={6} align="center" wrap="nowrap">
                                  <Title order={4} style={{ flex: 1, minWidth: 0 }}>
                                    {instance.name}
                                  </Title>
                                  <Badge
                                    size="sm"
                                    variant="light"
                                    color={instance.active === false ? 'gray' : 'green'}
                                    style={{
                                      animation: 'pulse 2s ease-in-out infinite',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {instance.active === false ? 'Inactive' : 'Active'}
                                  </Badge>
                                </Group>
                                {instance.client && (
                                  <Group gap={8} align="center">
                                    {clients[instance.client]?.logo && (() => {
                                      const logoPath = clients[instance.client]!.logo!;
                                      return (
                                        <Image
                                          src={basePath && !logoPath.startsWith(basePath) ? `${basePath}${logoPath}` : logoPath}
                                          alt={instance.client}
                                          width={16}
                                          height={16}
                                          style={{ borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                      );
                                    })()}
                                    <Text size="xs" c="dimmed">
                                      {instance.client}
                                    </Text>
                                  </Group>
                                )}
                              </Stack>
                              {isAdmin && (
                                <ActionIcon
                                  variant="subtle"
                                  color="purple"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openEditModal(instance);
                                  }}
                                  size="sm"
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                              )}
                            </Group>
                            {instance.description && (
                              <Text
                                size="sm"
                                c="dimmed"
                                lineClamp={2}
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {instance.description}
                              </Text>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid.Col>
                    ))}
                  </Grid>
                </Box>
              ))
            ) : (
              <Grid>
                <Grid.Col span={12}>
                  <Text c="dimmed" ta="center" py="xl">
                    No instances found. {instances.length > 0 && `Total instances loaded: ${instances.length}`}
                  </Text>
                </Grid.Col>
              </Grid>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

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
            label="Client"
            placeholder="Client / owner (optional)"
            value={formClient}
            onChange={(e) => setFormClient(e.currentTarget.value)}
          />
          <TextInput
            label="Link"
            placeholder="https://..."
            value={formLink}
            onChange={(e) => setFormLink(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Description"
            placeholder="Brief description (optional)"
            value={formDescription}
            onChange={(e) => setFormDescription(e.currentTarget.value)}
            maxLength={200}
          />
          <Checkbox
            label="Active"
            checked={formActive}
            onChange={(e) => setFormActive(e.currentTarget.checked)}
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
                {(features[formType] || []).map((feature) => {
                  const featureName = typeof feature === 'string' ? feature : feature.name;
                  return (
                    <Checkbox
                      key={featureName}
                      label={featureName}
                      checked={formFeatures.includes(featureName)}
                      onChange={(e) => {
                        if (e.currentTarget.checked) {
                          setFormFeatures([...formFeatures, featureName]);
                        } else {
                          setFormFeatures(formFeatures.filter((f) => f !== featureName));
                        }
                      }}
                    />
                  );
                })}
              </Stack>
            </div>
          )}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
              Screenshot
            </label>
            <Alert mb="sm" icon={<IconPhoto size={16} />}>
              Paste an image from clipboard (Ctrl+V / Cmd+V)
            </Alert>
            {formScreenshot && (
              <Group mb="sm">
                <Button variant="light" color="red" onClick={() => {
                  setFormScreenshot('');
                }}>
                  Remove
                </Button>
              </Group>
            )}
            {formScreenshot && (
              <Image
                src={formScreenshot}
                alt="Screenshot preview"
                mb="md"
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
                cursor: 'pointer',
                backgroundColor: formScreenshot ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
              }}
              tabIndex={0}
            >
              {formScreenshot ? 'Paste a new image to replace' : 'Click here and paste image (Ctrl+V / Cmd+V)'}
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

      <Modal
        opened={featuresModalOpened}
        onClose={() => {
          setFeaturesModalOpened(false);
        }}
        title="Manage Features"
        size="lg"
      >
        <Stack gap="xl">
          {(['Virtual Showroom', 'Apartment Chooser'] as InstanceType[]).map((type) => (
            <Box key={type}>
              <Title order={4} mb="md">{type}</Title>
              <Stack gap="xs">
                {editingFeatures[type].map((feature, index) => {
                  const featureName = typeof feature === 'string' ? feature : feature.name;
                  const isInUse = instances.some(instance => 
                    instance.type === type && instance.features.includes(featureName)
                  );
                  
                  return (
                    <Group key={index} gap="xs" align="center">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          if (index > 0) {
                            const newFeatures = { ...editingFeatures };
                            const temp = newFeatures[type][index];
                            newFeatures[type][index] = newFeatures[type][index - 1];
                            newFeatures[type][index - 1] = temp;
                            setEditingFeatures(newFeatures);
                          }
                        }}
                        disabled={index === 0}
                        style={{ cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                      >
                        <IconArrowUp size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => {
                          if (index < editingFeatures[type].length - 1) {
                            const newFeatures = { ...editingFeatures };
                            const temp = newFeatures[type][index];
                            newFeatures[type][index] = newFeatures[type][index + 1];
                            newFeatures[type][index + 1] = temp;
                            setEditingFeatures(newFeatures);
                          }
                        }}
                        disabled={index === editingFeatures[type].length - 1}
                        style={{ cursor: index === editingFeatures[type].length - 1 ? 'not-allowed' : 'pointer' }}
                      >
                        <IconArrowDown size={16} />
                      </ActionIcon>
                      <TextInput
                        value={typeof feature === 'string' ? feature : feature.name}
                        onChange={(e) => {
                          const newFeatures = { ...editingFeatures };
                          const oldFeature = newFeatures[type][index];
                          const oldName = typeof oldFeature === 'string' ? oldFeature : oldFeature.name;
                          const oldColor = typeof oldFeature === 'string' ? (featureColors[oldName] || colorPalette[index % colorPalette.length]) : oldFeature.color;
                          const oldIcon = typeof oldFeature === 'string' ? undefined : oldFeature.icon;
                          newFeatures[type][index] = { name: e.currentTarget.value, color: oldColor, icon: oldIcon };
                          setEditingFeatures(newFeatures);
                          // Update color mapping if feature name changed
                          if (oldName !== e.currentTarget.value && featureColors[oldName]) {
                            const newColors = { ...featureColors };
                            newColors[e.currentTarget.value] = featureColors[oldName];
                            delete newColors[oldName];
                            setFeatureColors(newColors);
                          }
                        }}
                        placeholder={`Feature ${index + 1}`}
                        style={{ flex: 1 }}
                      />
                      <Group gap="xs">
                        <Popover
                          opened={colorPickerOpen[`${type}-${index}`] || false}
                          onChange={(opened) => {
                            setColorPickerOpen({ ...colorPickerOpen, [`${type}-${index}`]: opened });
                          }}
                          position="bottom"
                          withArrow
                        >
                          <Popover.Target>
                            <Button
                              variant="light"
                              size="xs"
                              onClick={() => {
                                setColorPickerOpen({ ...colorPickerOpen, [`${type}-${index}`]: true });
                              }}
                              style={{
                                backgroundColor: (typeof feature === 'string' ? featureColors[feature] : feature.color) || 'transparent',
                                border: (typeof feature === 'string' ? featureColors[feature] : feature.color) ? `2px solid ${(typeof feature === 'string' ? featureColors[feature] : feature.color)}` : '1px solid rgba(255, 255, 255, 0.3)',
                                color: (typeof feature === 'string' ? featureColors[feature] : feature.color) ? (isColorDark((typeof feature === 'string' ? featureColors[feature] : feature.color) || '') ? 'white' : '#0A082D') : undefined,
                                minWidth: '60px',
                              }}
                            >
                              {(typeof feature === 'string' ? featureColors[feature] : feature.color) ? 'Color' : 'Pick'}
                            </Button>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <Stack gap="xs" p="xs">
                              <Text size="xs" fw={500} mb="xs">Select Color</Text>
                              <Group gap="xs">
                                {colorPalette.map((color) => (
                                  <Box
                                    key={color}
                                    onClick={() => {
                                      const featureName = typeof feature === 'string' ? feature : feature.name;
                                      const newFeatures = { ...editingFeatures };
                                      const newColors = { ...featureColors };
                                      if (newColors[featureName] === color) {
                                        delete newColors[featureName];
                                        newFeatures[type][index] = { name: featureName, color: colorPalette[index % colorPalette.length] };
                                      } else {
                                        newColors[featureName] = color;
                                        newFeatures[type][index] = { name: featureName, color };
                                      }
                                      setFeatureColors(newColors);
                                      setEditingFeatures(newFeatures);
                                      setColorPickerOpen({ ...colorPickerOpen, [`${type}-${index}`]: false });
                                    }}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      backgroundColor: color,
                                      cursor: 'pointer',
                                      border: ((typeof feature === 'string' ? featureColors[feature] : feature.color) === color) ? '3px solid white' : '2px solid rgba(0, 0, 0, 0.2)',
                                      boxShadow: ((typeof feature === 'string' ? featureColors[feature] : feature.color) === color) ? '0 0 0 2px rgba(0, 0, 0, 0.3)' : 'none',
                                      transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      const currentColor = typeof feature === 'string' ? featureColors[feature] : feature.color;
                                      if (currentColor !== color) {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      const currentColor = typeof feature === 'string' ? featureColors[feature] : feature.color;
                                      if (currentColor !== color) {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                      }
                                    }}
                                  />
                                ))}
                              </Group>
                              {(typeof feature === 'string' ? featureColors[feature] : feature.color) && (
                                <Button
                                  variant="light"
                                  size="xs"
                                  color="red"
                                  fullWidth
                                  onClick={() => {
                                    const featureName = typeof feature === 'string' ? feature : feature.name;
                                    const newFeatures = { ...editingFeatures };
                                    const newColors = { ...featureColors };
                                    delete newColors[featureName];
                                    const oldIcon = typeof feature === 'string' ? undefined : feature.icon;
                                    newFeatures[type][index] = { name: featureName, color: colorPalette[index % colorPalette.length], icon: oldIcon };
                                    setFeatureColors(newColors);
                                    setEditingFeatures(newFeatures);
                                    setColorPickerOpen({ ...colorPickerOpen, [`${type}-${index}`]: false });
                                  }}
                                  mt="xs"
                                >
                                  Remove Color
                                </Button>
                              )}
                            </Stack>
                          </Popover.Dropdown>
                        </Popover>
                        <Popover
                          opened={iconPickerOpen[`${type}-${index}`] || false}
                          onChange={(opened) => {
                            setIconPickerOpen({ ...iconPickerOpen, [`${type}-${index}`]: opened });
                            if (!opened) {
                              setIconSearchTerm({ ...iconSearchTerm, [`${type}-${index}`]: '' });
                            }
                          }}
                          position="bottom"
                          withArrow
                        >
                          <Popover.Target>
                            <Button
                              variant="light"
                              size="xs"
                              onClick={() => {
                                setIconPickerOpen({ ...iconPickerOpen, [`${type}-${index}`]: true });
                              }}
                              style={{ minWidth: '60px' }}
                            >
                              {(() => {
                                const currentIcon = typeof feature === 'string' ? undefined : feature.icon;
                                if (currentIcon && (TablerIcons as any)[currentIcon]) {
                                  const IconComponent = (TablerIcons as any)[currentIcon];
                                  return <IconComponent size={16} />;
                                }
                                return 'Icon';
                              })()}
                            </Button>
                          </Popover.Target>
                          <Popover.Dropdown style={{ width: '320px', maxHeight: '400px', padding: 0 }}>
                            <IconPickerContent
                              searchTerm={iconSearchTerm[`${type}-${index}`] || ''}
                              onSearchChange={(value) => {
                                setIconSearchTerm({ ...iconSearchTerm, [`${type}-${index}`]: value });
                              }}
                              selectedIcon={typeof feature === 'string' ? undefined : feature.icon}
                              onSelect={(iconName) => {
                                const newFeatures = { ...editingFeatures };
                                const featureName = typeof feature === 'string' ? feature : feature.name;
                                const featureColor = typeof feature === 'string' ? (featureColors[featureName] || colorPalette[index % colorPalette.length]) : feature.color;
                                const currentIcon = typeof feature === 'string' ? undefined : feature.icon;
                                newFeatures[type][index] = { 
                                  name: featureName, 
                                  color: featureColor,
                                  icon: currentIcon === iconName ? undefined : iconName
                                };
                                setEditingFeatures(newFeatures);
                                setIconPickerOpen({ ...iconPickerOpen, [`${type}-${index}`]: false });
                                setIconSearchTerm({ ...iconSearchTerm, [`${type}-${index}`]: '' });
                              }}
                            />
                          </Popover.Dropdown>
                        </Popover>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          disabled={isInUse}
                          onClick={() => {
                            if (!isInUse) {
                              const featureName = typeof feature === 'string' ? feature : feature.name;
                              const newFeatures = { ...editingFeatures };
                              const newColors = { ...featureColors };
                              delete newColors[featureName];
                              setFeatureColors(newColors);
                              newFeatures[type] = newFeatures[type].filter((_, i) => i !== index);
                              setEditingFeatures(newFeatures);
                            }
                          }}
                          title={isInUse ? 'Cannot delete: feature is in use' : 'Delete feature'}
                          style={{ cursor: isInUse ? 'not-allowed' : 'pointer', opacity: isInUse ? 0.5 : 1 }}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  );
                })}
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    const newFeatures = { ...editingFeatures };
                    newFeatures[type] = [...newFeatures[type], { name: '', color: colorPalette[newFeatures[type].length % colorPalette.length] }];
                    setEditingFeatures(newFeatures);
                  }}
                  mt="xs"
                >
                  Add Feature
                </Button>
              </Stack>
            </Box>
          ))}
          <Group justify="space-between" mt="md">
            <Button
              variant="subtle"
              color="orange"
              onClick={async () => {
                if (!confirm('This will remove all features from projects that are not in the features list. Continue?')) {
                  return;
                }
                try {
                  const response = await fetch('/api/instances/cleanup', {
                    method: 'POST',
                  });
                  if (response.ok) {
                    const result = await response.json();
                    alert(`Cleanup complete! Updated ${result.cleaned} project(s) and removed ${result.removed} invalid feature(s).`);
                    await loadInstances();
                  } else {
                    const error = await response.json();
                    alert(error.error || 'Failed to cleanup invalid features');
                  }
                } catch (error) {
                  console.error('Failed to cleanup invalid features:', error);
                  alert('Failed to cleanup invalid features');
                }
              }}
            >
              Cleanup Invalid Features
            </Button>
            <Group>
              <Button
                variant="light"
                onClick={() => {
                  setFeaturesModalOpened(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                try {
                  // Remove empty features and ensure all have colors
                  const cleanedFeatures: FeatureConfig = {
                    'Virtual Showroom': editingFeatures['Virtual Showroom']
                      .filter(f => (typeof f === 'string' ? f : f.name).trim() !== '')
                      .map((f, index) => {
                        if (typeof f === 'string') {
                          return { name: f, color: featureColors[f] || colorPalette[index % colorPalette.length] };
                        }
                        return f;
                      }),
                    'Apartment Chooser': editingFeatures['Apartment Chooser']
                      .filter(f => (typeof f === 'string' ? f : f.name).trim() !== '')
                      .map((f, index) => {
                        if (typeof f === 'string') {
                          return { name: f, color: featureColors[f] || colorPalette[index % colorPalette.length] };
                        }
                        return f;
                      }),
                  };
                  
                  // Extract colors and icons from cleaned features
                  const cleanedColors: Record<string, string> = {};
                  const cleanedIcons: Record<string, string> = {};
                  Object.values(cleanedFeatures).forEach(typeFeatures => {
                    typeFeatures.forEach((feature: FeatureWithColor) => {
                      cleanedColors[feature.name] = feature.color;
                      if (feature.icon) {
                        cleanedIcons[feature.name] = feature.icon;
                      }
                    });
                  });
                  
                  const featuresResponse = await fetch('/api/features', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cleanedFeatures),
                  });
                  
                  if (featuresResponse.ok) {
                    setFeatureColors(cleanedColors);
                    setFeatureIcons(cleanedIcons);
                    await loadFeatures();
                    // Automatically cleanup invalid features from instances
                    try {
                      const cleanupResponse = await fetch('/api/instances/cleanup', {
                        method: 'POST',
                      });
                      if (cleanupResponse.ok) {
                        const cleanupResult = await cleanupResponse.json();
                        // Cleanup completed silently
                        await loadInstances();
                      }
                    } catch (error) {
                      console.error('Failed to cleanup invalid features:', error);
                      // Don't block the save if cleanup fails
                    }
                    setFeaturesModalOpened(false);
                  }
                } catch (error) {
                  console.error('Failed to update features:', error);
                }
              }}
            >
              Save
            </Button>
            </Group>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={paletteModalOpened}
        onClose={() => {
          setPaletteModalOpened(false);
        }}
        title="Manage Color Palette"
        size="lg"
      >
        <Stack gap="xl">
          <Text size="sm" c="dimmed">
            Reorder colors by using the up/down arrows. Add new colors using the color picker below.
          </Text>
          <Stack gap="xs">
            {editingPalette.map((color, index) => (
              <Group key={index} gap="xs" align="center">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    if (index > 0) {
                      const newPalette = [...editingPalette];
                      const temp = newPalette[index];
                      newPalette[index] = newPalette[index - 1];
                      newPalette[index - 1] = temp;
                      setEditingPalette(newPalette);
                    }
                  }}
                  disabled={index === 0}
                  style={{ cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <IconArrowUp size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    if (index < editingPalette.length - 1) {
                      const newPalette = [...editingPalette];
                      const temp = newPalette[index];
                      newPalette[index] = newPalette[index + 1];
                      newPalette[index + 1] = temp;
                      setEditingPalette(newPalette);
                    }
                  }}
                  disabled={index === editingPalette.length - 1}
                  style={{ cursor: index === editingPalette.length - 1 ? 'not-allowed' : 'pointer' }}
                >
                  <IconArrowDown size={16} />
                </ActionIcon>
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    backgroundColor: color,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    flexShrink: 0,
                  }}
                />
                <TextInput
                  value={color}
                  onChange={(e) => {
                    const newPalette = [...editingPalette];
                    newPalette[index] = e.currentTarget.value;
                    setEditingPalette(newPalette);
                  }}
                  placeholder="#000000"
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => {
                    const newPalette = editingPalette.filter((_, i) => i !== index);
                    setEditingPalette(newPalette);
                  }}
                  title="Remove color"
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
          <Group>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setEditingPalette([...editingPalette, '#000000']);
              }}
            >
              Add Color
            </Button>
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => {
              setPaletteModalOpened(false);
            }}>
              Cancel
            </Button>
            <Button onClick={async () => {
              // Validate all colors are valid hex
              const validPalette = editingPalette.filter(c => /^#[0-9A-Fa-f]{6}$/.test(c));
              if (validPalette.length !== editingPalette.length) {
                alert('Some colors are invalid. Please use valid hex colors (e.g., #FF0000)');
                return;
              }
              await saveColorPalette(validPalette);
            }}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={paletteModalOpened}
        onClose={() => {
          setPaletteModalOpened(false);
        }}
        title="Manage Color Palette"
        size="lg"
      >
        <Stack gap="xl">
          <Text size="sm" c="dimmed">
            Reorder colors by using the up/down arrows. Add new colors using the color picker below.
          </Text>
          <Stack gap="xs">
            {editingPalette.map((color, index) => (
              <Group key={index} gap="xs" align="center">
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    if (index > 0) {
                      const newPalette = [...editingPalette];
                      const temp = newPalette[index];
                      newPalette[index] = newPalette[index - 1];
                      newPalette[index - 1] = temp;
                      setEditingPalette(newPalette);
                    }
                  }}
                  disabled={index === 0}
                  style={{ cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <IconArrowUp size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    if (index < editingPalette.length - 1) {
                      const newPalette = [...editingPalette];
                      const temp = newPalette[index];
                      newPalette[index] = newPalette[index + 1];
                      newPalette[index + 1] = temp;
                      setEditingPalette(newPalette);
                    }
                  }}
                  disabled={index === editingPalette.length - 1}
                  style={{ cursor: index === editingPalette.length - 1 ? 'not-allowed' : 'pointer' }}
                >
                  <IconArrowDown size={16} />
                </ActionIcon>
                <Box
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    backgroundColor: color,
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    flexShrink: 0,
                  }}
                />
                <TextInput
                  value={color}
                  onChange={(e) => {
                    const newPalette = [...editingPalette];
                    newPalette[index] = e.currentTarget.value;
                    setEditingPalette(newPalette);
                  }}
                  placeholder="#000000"
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => {
                    const newPalette = editingPalette.filter((_, i) => i !== index);
                    setEditingPalette(newPalette);
                  }}
                  title="Remove color"
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
          <Group>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setEditingPalette([...editingPalette, '#000000']);
              }}
            >
              Add Color
            </Button>
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => {
              setPaletteModalOpened(false);
            }}>
              Cancel
            </Button>
            <Button onClick={async () => {
              // Validate all colors are valid hex
              const validPalette = editingPalette.filter(c => /^#[0-9A-Fa-f]{6}$/.test(c));
              if (validPalette.length !== editingPalette.length) {
                alert('Some colors are invalid. Please use valid hex colors (e.g., #FF0000)');
                return;
              }
              await saveColorPalette(validPalette);
            }}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={clientsModalOpened}
        onClose={() => {
          setClientsModalOpened(false);
          setEditingClientName('');
          setEditingClientWebsite('');
          setEditingClientLogo('');
        }}
        title="Manage Clients"
        size="lg"
      >
        <Stack gap="xl">
          <Box>
            <Title order={4} mb="md">Clients</Title>
            <Stack gap="xs">
              {Object.entries(editingClients).map(([clientName, client]) => {
                const projectCount = instances.filter(i => i.client === clientName).length;
                return (
                  <Group key={clientName} gap="sm" align="center" p="sm" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                    {client.logo && (
                      <Image
                        src={basePath && !client.logo.startsWith(basePath) ? `${basePath}${client.logo}` : client.logo}
                        alt={clientName}
                        width={32}
                        height={32}
                        style={{ borderRadius: '4px', objectFit: 'cover' }}
                      />
                    )}
                    <Box style={{ flex: 1 }}>
                      <Text fw={500}>{clientName}</Text>
                      <Text size="xs" c="dimmed">{projectCount} project{projectCount !== 1 ? 's' : ''}</Text>
                    </Box>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        setClientFilter(clientName);
                        setClientsModalOpened(false);
                      }}
                    >
                      View
                    </Button>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        const newClients = { ...editingClients };
                        delete newClients[clientName];
                        setEditingClients(newClients);
                      }}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                );
              })}
              {Object.keys(editingClients).length === 0 && (
                <Text c="dimmed" ta="center" py="md">No clients yet. Add one below.</Text>
              )}
            </Stack>
          </Box>

          <Box>
            <Title order={4} mb="md">Add/Edit Client</Title>
            <Stack gap="md">
              <TextInput
                label="Client Name"
                placeholder="Enter client name"
                value={editingClientName}
                onChange={(e) => setEditingClientName(e.currentTarget.value)}
              />
              <TextInput
                label="Website URL (for favicon)"
                placeholder="https://example.com"
                value={editingClientWebsite}
                onChange={(e) => setEditingClientWebsite(e.currentTarget.value)}
              />
              <Group>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => fetchFavicon(editingClientWebsite)}
                  disabled={!editingClientWebsite || fetchingFavicon === editingClientWebsite}
                  loading={fetchingFavicon === editingClientWebsite}
                >
                  Fetch Favicon
                </Button>
                <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                  Or paste an image (PNG) below
                </Text>
              </Group>
              <Box
                onPaste={(e) => {
                  const items = e.clipboardData.items;
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                      const blob = items[i].getAsFile();
                      if (blob) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setEditingClientLogo(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(blob);
                      }
                      break;
                    }
                  }
                }}
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'text',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {editingClientLogo ? (
                  <Image
                    src={editingClientLogo}
                    alt="Client logo"
                    width={100}
                    height={100}
                    style={{ borderRadius: '4px', objectFit: 'contain' }}
                  />
                ) : (
                  <Text size="sm" c="dimmed">Paste image here (Ctrl/Cmd + V)</Text>
                )}
              </Box>
              <Group justify="flex-end">
                <Button
                  variant="light"
                  onClick={() => {
                    setEditingClientName('');
                    setEditingClientWebsite('');
                    setEditingClientLogo('');
                  }}
                >
                  Clear
                </Button>
                <Button
                  onClick={() => {
                    if (!editingClientName) {
                      alert('Please enter a client name');
                      return;
                    }
                    const newClients = { ...editingClients };
                    newClients[editingClientName] = {
                      name: editingClientName,
                      logo: editingClientLogo || undefined,
                      website: editingClientWebsite || undefined,
                    };
                    setEditingClients(newClients);
                    setEditingClientName('');
                    setEditingClientWebsite('');
                    setEditingClientLogo('');
                  }}
                  disabled={!editingClientName}
                >
                  Add Client
                </Button>
              </Group>
            </Stack>
          </Box>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => {
              setClientsModalOpened(false);
            }}>
              Cancel
            </Button>
            <Button onClick={async () => {
              await saveClients(editingClients, editingClientLogo && editingClientName ? {
                clientName: editingClientName,
                logoData: editingClientLogo,
              } : undefined);
            }}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}


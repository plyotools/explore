export type InstanceType = "Virtual Showroom" | "Apartment Chooser";

export interface ExploreInstance {
  id: string;
  name: string;
  link: string;
  type: InstanceType;
  features: string[];
  screenshot?: string; // base64 or file path
  description?: string;
  // Optional client/owner for the project (for filtering)
  client?: string;
  // Active status - true = Active, false = Inactive
  // Older entries without this field should be treated as active by default
  active?: boolean;
  createdAt: string;
}

export interface FeatureWithColor {
  name: string;
  color: string;
  icon?: string; // Icon name from Tabler icons (e.g., "IconHome", "IconSettings")
}

export interface FeatureConfig {
  "Virtual Showroom": FeatureWithColor[];
  "Apartment Chooser": FeatureWithColor[];
}

export interface FeatureColorMap {
  [featureName: string]: string;
}

export interface Client {
  name: string;
  logo?: string; // base64 or file path
  favicon?: string; // URL or file path
  website?: string; // URL to fetch favicon from
}

export interface ClientConfig {
  [clientName: string]: Client;
}


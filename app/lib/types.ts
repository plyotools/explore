export type InstanceType = "Virtual Showroom" | "Apartment Chooser";

export interface ExploreInstance {
  id: string;
  name: string;
  link: string;
  type: InstanceType;
  features: string[];
  screenshot?: string; // base64 or file path
  createdAt: string;
}

export interface FeatureConfig {
  "Virtual Showroom": string[];
  "Apartment Chooser": string[];
}


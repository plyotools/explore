# Explore Showcases - Complete Feature Specification

This document provides a comprehensive specification of all features, their locations, and behavior in the Explore Showcases application. This specification is intended for recreating the entire scope in a new project.

## Table of Contents
1. [Application Overview](#application-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Models](#data-models)
4. [User Interface Features](#user-interface-features)
5. [Instance Management](#instance-management)
6. [Filtering & Grouping](#filtering--grouping)
7. [Feature Management](#feature-management)
8. [Client Management](#client-management)
9. [Color Palette Management](#color-palette-management)
10. [Data Import/Export](#data-importexport)
11. [API Endpoints](#api-endpoints)
12. [File Structure](#file-structure)
13. [Styling & Theming](#styling--theming)

---

## Application Overview

**Technology Stack:**
- Next.js 14.2.5 (App Router)
- React 18.3.1
- TypeScript 5.5.4
- Mantine UI 7.14.0
- Tabler Icons 3.11.0

**Deployment:**
- Static export for production (GitHub Pages)
- Base path: `/explore` in production, empty in development
- File-based storage system (no database)

**Main Purpose:**
Manage and display a collection of Explore instances (Virtual Showrooms and Apartment Choosers) with filtering, grouping, and administrative features.

---

## Authentication & Authorization

### Location
- **Auth Logic:** `app/lib/auth.ts`
- **Login Pages:** 
  - `app/login/page.tsx` (viewer/admin/partner login)
  - `app/admin/login/page.tsx` (admin-only login)

### Features

#### 1. Password-Based Authentication
- **Passwords:**
  - Viewer: `viewer`
  - Admin: `exploreadmin`
  - Partner: `partner`
- **Location:** `app/lib/auth.ts` - `verifyPassword()` function
- **Behavior:**
  - Returns role: `'viewer' | 'admin' | 'partner'`
  - Validates password and returns role on success

#### 2. Session Management
- **Server-side (Development):**
  - Uses HTTP-only cookies
  - Cookie names: `admin_session`, `user_role`, `is_admin`
  - Session duration: 7 days
  - Location: `app/lib/auth.ts`
  - Functions:
    - `isAuthenticated()` - Check if user is authenticated
    - `setAuthenticated(role)` - Set authentication cookies
    - `getUserRole()` - Get user role from cookies
    - `isAdmin()` - Check if user is admin
    - `clearAuthentication()` - Clear all auth cookies

- **Client-side (Static Export):**
  - Uses localStorage
  - Keys: `explore_session`, `explore_user_role`, `explore_is_admin`
  - Location: `app/login/page.tsx` - `clientVerifyPassword()` function
  - Fallback when API routes unavailable

#### 3. Role-Based Access Control
- **Roles:**
  - **Viewer:** Can view instances, toggle featured status
  - **Admin:** Full access (CRUD operations, settings, import/export, delete all)
  - **Partner:** Can only view featured/starred instances
- **Location:** `app/page.tsx` - Role checks throughout component
- **Behavior:**
  - Partner role filters instances to show only featured ones
  - Admin-only features hidden for non-admin users
  - API routes check authentication and roles

#### 4. Login Flow
- **Location:** `app/login/page.tsx`
- **Behavior:**
  - Redirects authenticated users to home
  - Shows login form for unauthenticated users
  - Supports both API and client-side authentication
  - Handles base path for GitHub Pages deployment
  - Auto-redirects after successful login

#### 5. Logout
- **Location:** `app/page.tsx` - `handleLogout()` function
- **Behavior:**
  - Clears server-side cookies (if API available)
  - Clears localStorage
  - Redirects to login page

---

## Data Models

### Location
- **Type Definitions:** `app/lib/types.ts`

### Models

#### 1. ExploreInstance
```typescript
interface ExploreInstance {
  id: string;                    // Auto-generated from name (sanitized)
  name: string;                   // Required
  link: string;                   // Required, URL to instance
  type: InstanceType;             // "Virtual Showroom" | "Apartment Chooser"
  features: string[];             // Array of feature names
  screenshot?: string;            // Path to screenshot image
  description?: string;           // Optional description
  client?: string;                // Optional client name
  active?: boolean;               // Active status (default: true)
  featured?: boolean;             // Featured flag (can be toggled by viewers)
  createdAt: string;              // ISO timestamp
}
```

#### 2. FeatureWithColor
```typescript
interface FeatureWithColor {
  name: string;                   // Feature name
  color: string;                  // Hex color code
  icon?: string;                  // Tabler icon name (e.g., "IconHome")
}
```

#### 3. FeatureConfig
```typescript
interface FeatureConfig {
  "Virtual Showroom": FeatureWithColor[];
  "Apartment Chooser": FeatureWithColor[];
}
```

#### 4. Client
```typescript
interface Client {
  name: string;                   // Client name
  logo?: string;                  // Path to logo image
  favicon?: string;               // URL or file path
  website?: string;                // URL to fetch favicon from
}
```

#### 5. ClientConfig
```typescript
interface ClientConfig {
  [clientName: string]: Client;
}
```

---

## User Interface Features

### Location
- **Main Page:** `app/page.tsx`
- **Layout:** `app/layout.tsx`
- **Theme:** `app/theme.ts`

### Features

#### 1. Header
- **Location:** `app/page.tsx` (lines ~1544-1740)
- **Components:**
  - Logo/Title: "Explore Showcases" with icon
  - Admin menu (dots icon) - Admin only
  - Logout link
  - "Add New" button - Admin only
- **Behavior:**
  - Responsive layout
  - Right-aligned action buttons
  - Menu dropdown for admin settings

#### 2. Filter System
- **Location:** `app/page.tsx` - FilterDropdown component (lines ~112-518)
- **Filter Types:**
  1. **Type Filter** - Virtual Showroom / Apartment Chooser
  2. **Client Filter** - Filter by client (with logos)
  3. **Project Filter** - Filter by project name
  4. **Feature Filter** - Filter by features (grouped by type)
  5. **Status Filter** - Active / Inactive
  6. **Featured Filter** - Featured / Not Featured (hidden for partners)
- **Behavior:**
  - Multi-select dropdowns with search
  - Keyboard navigation (Arrow keys, Space, Enter, Escape)
  - Visual indicators for selected items
  - Client logos displayed in filter dropdown
  - Filter tags shown below filters
  - Clear individual filters or all filters
  - Cross-filter navigation (Arrow Left/Right between filters)

#### 3. Grouping
- **Location:** `app/page.tsx` (lines ~1454-1511)
- **Status:** ⚠️ **UI COMMENTED OUT** - Grouping logic exists but UI controls are commented out (lines ~1814-1852), so grouping is effectively disabled (always defaults to 'none')
- **Group By Options (if enabled):**
  - None (default)
  - Client
  - Status
  - Feature
- **Behavior (if enabled):**
  - Two-level grouping support (groupBy1, groupBy2)
  - Accordion UI for grouped items
  - Sorted groups (Active before Inactive, "No Client" first)
  - Empty groups hidden
- **Note:** The grouping rendering code is still present but inactive since groupBy1/groupBy2 always remain 'none'

#### 4. Instance Cards
- **Location:** `app/page.tsx` (lines ~1979-2503)
- **Card Display:**
  - Screenshot image (if available)
  - Instance name (clickable, opens link)
  - Type badge
  - Status badge (Active/Inactive)
  - Feature badges (with colors and icons)
  - Client name (if assigned)
  - Star icon (toggle featured status)
  - Edit button (Admin only)
  - Delete button (Admin only)
- **Card Behavior:**
  - Click card to open instance link in new tab
  - Hover effects
  - Responsive grid layout (1-8 columns based on screen size)
  - Empty state when no instances match filters

#### 5. Featured/Starred Instances
- **Location:** `app/page.tsx` - `toggleFeatured()` function (lines ~779-800)
- **Storage:**
  - Client-side: localStorage key `featuredInstances` (array of IDs)
  - Server-side: `data/featured-instances.json` and `public/data/featured-instances.json`
- **Behavior:**
  - Toggle star icon to feature/unfeature instance
  - Available to all authenticated users
  - Partners only see featured instances
  - Star icon changes color when featured
  - Syncs with server on API calls

#### 6. Empty States
- **Location:** `app/page.tsx` (lines ~2506-2529)
- **Behavior:**
  - Shows message when no instances match filters
  - Displays total instance count if instances exist but are filtered out

---

## Instance Management

### Location
- **Data Layer:** `app/lib/data.ts`
- **API:** `app/api/instances/route.ts`
- **UI:** `app/page.tsx`

### Features

#### 1. Create Instance
- **Location:** `app/page.tsx` - `handleSubmit()` function (lines ~1202-1243)
- **Modal:** Add/Edit Instance Modal (lines ~2532-2705)
- **Required Fields:**
  - Name
  - Link (URL)
  - Type (Virtual Showroom or Apartment Chooser)
- **Optional Fields:**
  - Client (select from existing clients)
  - Description (max 200 characters)
  - Active status (checkbox, default: true)
  - Features (checkboxes based on selected type)
  - Screenshot (paste from clipboard)
- **Behavior:**
  - Project ID auto-generated from name (sanitized, lowercase, hyphens)
  - Auto-increments if ID exists (e.g., `project-name-1`)
  - Creates folder: `public/projects/{id}/`
  - Saves metadata: `public/projects/{id}/metadata.json`
  - Saves screenshot: `public/projects/{id}/screenshot.{ext}` (png/jpg/jpeg/webp)
  - Regenerates `public/instances.json` index
  - Admin only

#### 2. Edit Instance
- **Location:** `app/page.tsx` - `openEditModal()` function (lines ~1189-1199)
- **Behavior:**
  - Pre-fills form with existing data
  - Updates metadata file
  - Updates screenshot if changed
  - Regenerates index
  - Admin only

#### 3. Delete Instance
- **Location:** `app/page.tsx` - `handleDelete()` function (lines ~1250-1270)
- **Modal:** Delete Confirmation Modal (lines ~3685-3727)
- **Behavior:**
  - Shows confirmation dialog
  - Deletes project folder and all contents
  - Regenerates index
  - Admin only

#### 4. List Instances
- **Location:** `app/page.tsx` - `loadInstances()` function (lines ~1272-1347)
- **Data Source:**
  - Primary: `public/instances.json` (generated index)
  - Fallback: Reads from `public/projects/` folders
- **Behavior:**
  - Loads on component mount
  - Handles base path for GitHub Pages
  - Fixes relative screenshot paths to absolute
  - Shows loading state
  - Handles errors gracefully

#### 5. Screenshot Management
- **Location:** `app/page.tsx` - `handlePaste()` function (lines ~1161-1177)
- **Behavior:**
  - Paste image from clipboard (Ctrl+V / Cmd+V)
  - Converts to base64 data URL
  - Supports PNG, JPG, JPEG, WEBP
  - Saves as file in project folder
  - Auto-detects extension from MIME type
  - Preview in form before saving

#### 6. Instance Filtering
- **Location:** `app/page.tsx` - `filteredInstances` useMemo (lines ~1349-1376)
- **Filter Logic:**
  - Type filter (exact match)
  - Feature filter (instance must have at least one selected feature)
  - Status filter (active/inactive)
  - Client filter (exact match, handles empty client)
  - Project filter (exact match on name)
  - Featured filter (featured/not-featured)
  - Partner role filter (only shows featured instances)
- **Behavior:**
  - All filters are AND conditions
  - Empty filters show all instances
  - Real-time filtering as filters change

---

## Filtering & Grouping

### FilterDropdown Component
- **Location:** `app/page.tsx` (lines ~112-518)
- **Features:**
  - Searchable dropdown
  - Multi-select with checkboxes
  - Keyboard navigation:
    - Arrow Up/Down: Navigate items
    - Arrow Left/Right: Navigate between filters
    - Space: Toggle selected item
    - Enter: Close dropdown
    - Escape: Close dropdown
    - Typing: Focus search input
  - Visual indicators:
    - Selected items highlighted
    - Client logos in dropdown
    - Selection count display
  - Actions:
    - Clear all selected
    - Close button
  - Ref-based API for programmatic opening

### Filter Tags
- **Location:** `app/page.tsx` - FilterTag component (lines ~520-552)
- **Behavior:**
  - Shows active filters as removable badges
  - Click X to remove filter
  - Displays filter label and value

### Grouping Logic
- **Location:** `app/page.tsx` - `groupedInstances` useMemo (lines ~1469-1511)
- **Group By Options:**
  - None: Flat list
  - Client: Group by client name (empty client first)
  - Status: Group by Active/Inactive (Active first)
  - Feature: Group by first feature
- **Two-Level Grouping:**
  - Supports combining two group-by options
  - Format: `"{group1} | {group2}"`
- **Display:**
  - Accordion component for grouped view
  - Grid layout for ungrouped view
  - Sorted group keys

---

## Feature Management

### Location
- **Data Layer:** `app/lib/data.ts` - `getFeatures()`, `updateFeatures()`
- **API:** `app/api/features/route.ts`
- **UI:** `app/page.tsx` - Features Modal (lines ~2707-3085)

### Features

#### 1. Feature Configuration
- **Storage:**
  - `data/features.json`
  - `public/data/features.json`
- **Structure:**
  - Separate feature lists for "Virtual Showroom" and "Apartment Chooser"
  - Each feature has: name, color, optional icon
- **Default Features:**
  - Virtual Showroom: Floor plan, Styles, Hotspots
  - Apartment Chooser: Sun path, Sun slider, Street view

#### 2. Feature Management UI
- **Modal:** Features Management Modal
- **Features:**
  - Add new feature
  - Edit feature name
  - Delete feature (disabled if in use)
  - Reorder features (up/down arrows)
  - Assign color (from palette)
  - Assign icon (from Tabler icons)
  - Cleanup invalid features button
- **Color Picker:**
  - Shows color palette
  - Click to assign/remove color
  - Visual feedback
- **Icon Picker:**
  - Searchable icon browser
  - Shows Tabler icons
  - Click to assign/remove icon
  - Search functionality

#### 3. Feature Display
- **Location:** `app/page.tsx` - Feature badges on cards
- **Behavior:**
  - Shows feature badges with assigned colors
  - Icons displayed if assigned
  - Text color adjusts based on background lightness
  - Grouped by instance type in filter dropdown

#### 4. Feature Cleanup
- **Location:** `app/api/instances/cleanup/route.ts`
- **Function:** `cleanupInvalidFeatures()` in `app/lib/data.ts` (lines ~334-370)
- **Behavior:**
  - Removes invalid features from all instances
  - Invalid = feature not in current feature config
  - Returns count of cleaned instances and removed features
  - Admin only
  - Auto-runs after feature config save

#### 5. Feature Migration
- **Location:** `app/lib/data.ts` - `getFeatures()` function (lines ~247-318)
- **Behavior:**
  - Migrates old format (string[]) to new format (FeatureWithColor[])
  - Auto-assigns colors from default palette
  - Saves migrated format

---

## Client Management

### Location
- **Data Layer:** `app/lib/data.ts` - `getClients()`, `updateClients()`, `saveClientLogo()`
- **API:** `app/api/clients/route.ts`, `app/api/clients/favicon/route.ts`
- **UI:** `app/page.tsx` - Clients Modal (lines ~3319-3618)

### Features

#### 1. Client Configuration
- **Storage:**
  - `data/clients.json`
  - `public/data/clients.json`
  - Logos: `public/data/clients/{client-name}.{ext}`
- **Structure:**
  - Object with client names as keys
  - Each client has: name, logo (path), website (URL), favicon (URL)

#### 2. Client Management UI
- **Modal:** Clients Management Modal
- **Features:**
  - View all clients with logos
  - Add new client
  - Edit existing client
  - Remove/merge client
  - Upload logo (PNG/SVG)
  - Paste logo from clipboard
  - Fetch favicon from website
  - View projects for each client
- **Logo Management:**
  - Upload PNG/SVG file
  - Paste from clipboard (PNG only for inline paste)
  - Auto-saves to `public/data/clients/` folder
  - Converts data URIs to file paths

#### 3. Favicon Fetching
- **Location:** `app/api/clients/favicon/route.ts`
- **Function:** `fetchFavicon()` in `app/page.tsx` (lines ~953-975)
- **Behavior:**
  - Tries common favicon URLs:
    - `{url}/favicon.ico`
    - `{url}/favicon.png`
    - `{origin}/favicon.ico`
    - `{origin}/favicon.png`
  - Falls back to HTML parsing for favicon link tags
  - Returns base64 data URL
  - Admin only

#### 4. Client Merging
- **Location:** `app/page.tsx` - `mergeClient()` function (lines ~976-1029)
- **Modal:** Merge Client Modal (lines ~3620-3683)
- **Behavior:**
  - Remove client or merge with another
  - Updates all instances with removed client
  - Reassigns to target client or clears client field
  - Removes client from config
  - Admin only

#### 5. Client Display
- **Location:** `app/page.tsx` - Client filter and cards
- **Behavior:**
  - Client logos shown in filter dropdown
  - Client name displayed on instance cards
  - Client logos in client select dropdown

---

## Color Palette Management

### Location
- **Data Layer:** `app/lib/data.ts` - Default palette defined (lines ~27-52)
- **API:** `app/api/color-palette/route.ts`
- **UI:** `app/page.tsx` - Color Palette Modal (lines ~3087-3317)

### Features

#### 1. Color Palette
- **Storage:**
  - `public/data/color-palette.json`
- **Default Palette:**
  - 24 colors sorted by lightness
  - Dark to light progression
  - Used for feature colors if not assigned

#### 2. Color Palette Management UI
- **Modal:** Color Palette Modal
- **Features:**
  - View all colors
  - Reorder colors (up/down arrows)
  - Edit color hex value
  - Add new color
  - Remove color
  - Validation (hex format: #RRGGBB)
- **Behavior:**
  - Colors sorted by lightness
  - Used in feature color picker
  - Admin only

#### 3. Color Utilities
- **Location:** `app/page.tsx` - Helper functions
- **Functions:**
  - `getColorLightness()` - Calculate color lightness (0-1)
  - `isColorDark()` - Determine if color is dark (for text contrast)
- **Usage:**
  - Feature badge text color
  - Feature color button text color

---

## Data Import/Export

### Location
- **Data Layer:** `app/lib/data.ts` - `exportAllData()`, `importAllData()`, `deleteAllData()`
- **API:** `app/api/export/route.ts`, `app/api/import/route.ts`, `app/api/delete-all/route.ts`
- **UI:** `app/page.tsx` - Export/Import/Delete modals

### Features

#### 1. Export All Data
- **Location:** `app/page.tsx` - Export handler (lines ~1622-1687)
- **API:** `app/api/export/route.ts`
- **Export Format:**
```typescript
{
  version: string;
  exportDate: string;
  projects: Array<{
    metadata: ExploreInstance;
    screenshot?: string; // base64
  }>;
  clients: ClientConfig;
  clientLogos: Record<string, string>; // base64
  features: FeatureConfig;
  featuredInstances: string[];
  colorPalette: string[];
}
```
- **Behavior:**
  - Downloads JSON file
  - Includes all projects with screenshots (base64)
  - Includes all client logos (base64)
  - Includes all configuration
  - Filename: `explore-backup-{date}.json`
  - Admin only

#### 2. Import Data
- **Location:** `app/page.tsx` - Import Modal (lines ~3685+)
- **API:** `app/api/import/route.ts`
- **Function:** `importAllData()` in `app/lib/data.ts` (lines ~624-696)
- **Behavior:**
  - Validates import data structure
  - Deletes all existing projects
  - Imports projects with metadata and screenshots
  - Imports client logos
  - Imports clients config
  - Imports features config
  - Imports featured instances
  - Imports color palette
  - Regenerates index
  - Admin only

#### 3. Delete All Data
- **Location:** `app/page.tsx` - Delete All Modal
- **API:** `app/api/delete-all/route.ts`
- **Function:** `deleteAllData()` in `app/lib/data.ts` (lines ~699-734)
- **Behavior:**
  - Shows confirmation modal
  - Requires typing confirmation
  - Deletes all projects
  - Deletes all client logos
  - Resets all config files to empty
  - Regenerates empty index
  - Admin only

---

## API Endpoints

### Location
- **Base:** `app/api/`

### Endpoints

#### 1. Authentication
- **Path:** `/api/auth/`
- **File:** `app/api/auth/route.ts`
- **Methods:**
  - `GET` - Check authentication status
  - `POST` - Login (password in body)
  - `DELETE` - Logout
- **Response:**
  - `GET`: `{ authenticated: boolean, role: string, isAdmin: boolean }`
  - `POST`: `{ success: true, role: string, isAdmin: boolean }` or `{ error: string }`
  - `DELETE`: `{ success: true }`

#### 2. Instances
- **Path:** `/api/instances`
- **File:** `app/api/instances/route.ts`
- **Methods:**
  - `GET` - Get all instances
  - `POST` - Create instance (requires auth)
  - `PUT` - Update instance (requires auth)
  - `DELETE` - Delete instance (requires auth, ?id=)
- **Request Body (POST/PUT):**
  - `name`, `link`, `type`, `features[]`, `screenshot?`, `client?`, `active?`, `description?`

#### 3. Features
- **Path:** `/api/features`
- **File:** `app/api/features/route.ts`
- **Methods:**
  - `GET` - Get features config
  - `PUT` - Update features config (requires auth)
- **Request Body (PUT):** `FeatureConfig`

#### 4. Clients
- **Path:** `/api/clients`
- **File:** `app/api/clients/route.ts`
- **Methods:**
  - `GET` - Get clients config (requires auth)
  - `PUT` - Update clients config (requires auth)
- **Request Body (PUT):**
  - `clients: ClientConfig`
  - `clientLogo?: { clientName: string, logoData: string }`

#### 5. Featured Instances
- **Path:** `/api/featured-instances`
- **File:** `app/api/featured-instances/route.ts`
- **Methods:**
  - `GET` - Get featured instance IDs
  - `PUT` - Update featured instances (requires auth, not partner)
- **Request Body (PUT):** `{ instanceIds: string[] }`

#### 6. Color Palette
- **Path:** `/api/color-palette`
- **File:** `app/api/color-palette/route.ts`
- **Methods:**
  - `GET` - Get color palette
  - `PUT` - Update color palette (requires auth)
- **Request Body (PUT):** `string[]` (array of hex colors)

#### 7. Export
- **Path:** `/api/export`
- **File:** `app/api/export/route.ts`
- **Methods:**
  - `GET` - Export all data (requires auth)
- **Response:** `ExportData` object

#### 8. Import
- **Path:** `/api/import`
- **File:** `app/api/import/route.ts`
- **Methods:**
  - `POST` - Import all data (requires admin)
- **Request Body:** `ExportData` object

#### 9. Delete All
- **Path:** `/api/delete-all`
- **File:** `app/api/delete-all/route.ts`
- **Methods:**
  - `DELETE` - Delete all data (requires admin)

#### 10. Client Favicon
- **Path:** `/api/clients/favicon`
- **File:** `app/api/clients/favicon/route.ts`
- **Methods:**
  - `POST` - Fetch favicon from URL (requires auth)
- **Request Body:** `{ url: string }`
- **Response:** `{ success: true, favicon: string (base64), url: string }`

#### 11. Instance Cleanup
- **Path:** `/api/instances/cleanup`
- **File:** `app/api/instances/cleanup/route.ts`
- **Methods:**
  - `POST` - Cleanup invalid features (requires auth)
- **Response:** `{ cleaned: number, removed: number }`

---

## File Structure

### Project Structure
```
/
├── app/
│   ├── admin/
│   │   └── login/
│   │       └── page.tsx          # Admin login page
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── color-palette/
│   │   ├── delete-all/
│   │   ├── export/
│   │   ├── featured-instances/
│   │   ├── features/
│   │   ├── import/
│   │   └── instances/
│   ├── lib/
│   │   ├── auth.ts               # Authentication logic
│   │   ├── data.ts               # Data layer functions
│   │   └── types.ts              # TypeScript types
│   ├── login/
│   │   └── page.tsx              # Main login page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main page (3730 lines)
│   └── theme.ts                  # Mantine theme config
├── data/                         # Server-side data files
│   ├── clients.json
│   ├── featured-instances.json
│   └── features.json
├── public/
│   ├── data/                     # Public data files
│   │   ├── clients/
│   │   │   └── *.png             # Client logos
│   │   ├── clients.json
│   │   ├── color-palette.json
│   │   ├── featured-instances.json
│   │   └── features.json
│   ├── projects/                 # Project folders
│   │   └── {project-id}/
│   │       ├── metadata.json
│   │       └── screenshot.{ext}
│   └── instances.json            # Generated index
├── scripts/
│   └── generate-index.js        # Build script
└── package.json
```

### Data Files

#### 1. Project Metadata
- **Location:** `public/projects/{id}/metadata.json`
- **Content:** `ExploreInstance` object
- **Generated:** On create/update

#### 2. Instances Index
- **Location:** `public/instances.json`
- **Content:** Array of `ExploreInstance` objects
- **Generated:** On create/update/delete
- **Script:** `scripts/generate-index.js` (runs on build)

#### 3. Features Config
- **Location:** 
  - `data/features.json` (server-side)
  - `public/data/features.json` (public)
- **Content:** `FeatureConfig` object

#### 4. Clients Config
- **Location:**
  - `data/clients.json` (server-side)
  - `public/data/clients.json` (public)
- **Content:** `ClientConfig` object

#### 5. Featured Instances
- **Location:**
  - `data/featured-instances.json` (server-side)
  - `public/data/featured-instances.json` (public)
- **Content:** `string[]` (array of instance IDs)

#### 6. Color Palette
- **Location:** `public/data/color-palette.json`
- **Content:** `string[]` (array of hex colors)

---

## Build & Deployment

### Build Process
- **Script:** `npm run build`
- **Steps:**
  1. Run `scripts/generate-index.js` to create `public/instances.json`
  2. Next.js build with static export
  3. Output to `out/` directory

### Generate Index Script
- **Location:** `scripts/generate-index.js`
- **Purpose:** Generates `public/instances.json` from project folders
- **Behavior:**
  - Scans `public/projects/` directory
  - Reads `metadata.json` from each project folder
  - Detects screenshot files (png, jpg, jpeg, webp)
  - Creates relative screenshot paths (`./projects/{id}/screenshot.{ext}`)
  - Writes JSON array to `public/instances.json`
  - Handles missing directories gracefully

### Static Export Configuration
- **File:** `next.config.js`
- **Settings:**
  - `output: 'export'` (production only)
  - `basePath: '/explore'` (production)
  - `assetPrefix: '/explore'` (production)
  - `images.unoptimized: true`
  - `trailingSlash: true`

### GitHub Pages Deployment
- **Base Path:** `/explore`
- **Static Files:** Served from `out/` directory
- **API Routes:** Not available in static export (client-side fallbacks used)

---

## Key Behaviors & Edge Cases

### 1. Project ID Generation
- Sanitizes name: lowercase, hyphens, remove special chars
- Auto-increments if exists: `name`, `name-1`, `name-2`, etc.
- Location: `app/lib/data.ts` - `sanitizeProjectId()` and `addInstance()`

### 2. Screenshot Handling
- Supports: PNG, JPG, JPEG, WEBP
- Auto-detects extension from MIME type
- Converts base64 data URLs to files
- Handles relative/absolute paths for static export

### 3. Feature Migration
- Auto-migrates old string[] format to FeatureWithColor[]
- Assigns default colors during migration
- Preserves existing colors if present

### 4. Client Logo Management
- Converts data URIs to file paths on save
- Sanitizes client names for filenames
- Supports PNG and SVG formats

### 5. Featured Instances Sync
- Client-side localStorage for immediate UI updates
- Server-side JSON file for persistence
- Syncs on API calls

### 6. Base Path Handling
- Detects `/explore` base path for GitHub Pages
- Adjusts all URLs and paths accordingly
- Works in both dev and production

### 7. Error Handling
- Graceful degradation when API unavailable
- Client-side fallbacks for static export
- User-friendly error messages
- Loading states

### 8. Filter Persistence
- Filters stored in component state only
- Reset on page reload
- Can be cleared individually or all at once

---

## Dependencies

### Production
- `react`: ^18.3.1
- `react-dom`: ^18.3.1
- `next`: ^14.2.5
- `@mantine/core`: ^7.14.0
- `@mantine/hooks`: ^7.14.0
- `@mantine/form`: ^7.14.0
- `@tabler/icons-react`: ^3.11.0

### Development
- `typescript`: ^5.5.4
- `@types/node`: ^22.5.5
- `@types/react`: ^18.3.5
- `@types/react-dom`: ^18.3.0
- `eslint`: ^8.57.1
- `eslint-config-next`: ^14.2.5

---

## Notes

1. **Commented/Ignored Features:** This spec only includes active features. Any commented code or ignored features are excluded.

2. **Static Export Limitations:** API routes don't work in static export. The app uses client-side fallbacks and localStorage for authentication and data management in production.

3. **File-Based Storage:** No database is used. All data is stored in JSON files and the file system.

4. **Build Script:** `scripts/generate-index.js` runs before build to create the instances index from project folders.

5. **Base Path:** The app is designed to work under `/explore` base path for GitHub Pages deployment.

---

## Summary

This application is a comprehensive showcase management system with:
- **3 user roles** (viewer, admin, partner)
- **2 instance types** (Virtual Showroom, Apartment Chooser)
- **6 filter types** (type, client, project, feature, status, featured)
- **3 grouping options** (client, status, feature)
- **Full CRUD** for instances, features, clients
- **Import/Export** functionality
- **Color and icon** management for features
- **Client logo** management with favicon fetching
- **Featured instances** system
- **Responsive design** with dark theme
- **Keyboard navigation** support
- **File-based storage** system

All features are fully functional and documented above with their exact locations and behaviors.


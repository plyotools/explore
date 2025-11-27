# Explore Showcases

A Next.js application for managing and displaying Explore instances (Virtual Showrooms and Apartment Choosers).

## Project Structure

The application uses a file-based storage system. Each project is stored in its own folder under `public/projects/`:

```
public/
  projects/
    project-name/
      metadata.json      # Project information (name, link, type, features, etc.)
      screenshot.png     # Optional screenshot image
      ...                # Other media files as needed
```

### Project Folder Structure

Each project folder contains:
- **metadata.json**: Required file with project information:
  ```json
  {
    "id": "project-id",
    "name": "Project Name",
    "link": "https://project-url.com",
    "type": "Virtual Showroom" | "Apartment Chooser",
    "features": ["Feature 1", "Feature 2"],
    "screenshot": "/projects/project-id/screenshot.png",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```
- **screenshot.{png|jpg|jpeg|webp}**: Optional screenshot image (automatically detected)

### Features Configuration

Features are stored in `data/features.json`:
```json
{
  "Virtual Showroom": ["Floor plan", "Styles", "Hotspots"],
  "Apartment Chooser": ["Sun path", "Sun slider", "Street view"]
}
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Set admin password in `.env.local`:
   ```
   ADMIN_PASSWORD=your-secure-password
   ```
   Default password is `admin123`.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Panel

Access the admin panel at `/admin/login` to:
- Add, edit, and delete projects
- Manage features configuration
- Upload screenshots (paste or upload)

## Adding Projects

### Via Admin Panel
1. Log in at `/admin/login`
2. Click "Add New Instance"
3. Fill in the form:
   - Name: Project name (used to generate folder name)
   - Link: URL to the project
   - Type: Virtual Showroom or Apartment Chooser
   - Features: Select from available features
   - Screenshot: Upload or paste an image

### Manually
1. Create a folder in `public/projects/` with a sanitized name (lowercase, hyphens)
2. Create `metadata.json` with the project information
3. Optionally add a `screenshot.png` (or .jpg, .jpeg, .webp) file

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- Project folder names are automatically generated from the project name (sanitized, lowercase, hyphens)
- If a folder name already exists, a number suffix is added (e.g., `project-name-1`)
- Screenshots are stored as files in the project folder and referenced in metadata
- The application reads all folders in `public/projects/` and loads their metadata.json files


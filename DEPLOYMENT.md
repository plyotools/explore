# Deployment Guide

## GitHub Pages Deployment

This project is configured to deploy automatically to GitHub Pages at:
**https://plyotools.github.io/explore/**

### Initial Setup

1. **Push code to GitHub:**
   ```bash
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to https://github.com/plyotools/explore/settings/pages
   - Under "Source", select **GitHub Actions**
   - Save the settings

3. **Verify Deployment:**
   - After pushing, GitHub Actions will automatically build and deploy
   - Check the Actions tab: https://github.com/plyotools/explore/actions
   - Once complete, your site will be live at https://plyotools.github.io/explore/

### How It Works

- The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main`
- It builds the static site using `npm run build`
- The build script generates `public/instances.json` from all project folders
- The static site is deployed to GitHub Pages

### Adding Projects

To add new projects:

1. **Via Git:**
   - Create a folder in `public/projects/` with your project name
   - Add `metadata.json` with project information
   - Optionally add screenshot files
   - Commit and push - the site will rebuild automatically

2. **Structure:**
   ```
   public/projects/
     my-project/
       metadata.json
       screenshot.png
   ```

### Local Testing

To test the production build locally:

```bash
npm run build
npx serve out
```

Then visit http://localhost:3000/explore (note the `/explore` base path)

### Troubleshooting

- **404 errors:** Make sure GitHub Pages is set to use "GitHub Actions" as the source
- **Images not loading:** Check that screenshot paths in `metadata.json` use relative paths
- **Build fails:** Check the Actions tab for error details


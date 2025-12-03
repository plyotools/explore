# Placeholder Image Setup

The app is now configured to use a placeholder image for projects without screenshots.

## To complete the setup:

1. Save your architectural rendering image as `placeholder.png` in the `public/` folder
2. The image should be placed at: `public/placeholder.png`
3. Supported formats: `.png`, `.jpg`, `.jpeg`, or `.webp`

## Current Configuration:

The app will automatically use `/placeholder.png` for any project that doesn't have a screenshot.

If you prefer a different filename or format, update the `PLACEHOLDER_IMAGE` constant in `app/page.tsx` (line 91).



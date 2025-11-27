# Push to GitHub - Quick Instructions

## Step 1: Create the Repository (if it doesn't exist)

1. Go to https://github.com/new
2. Repository name: `explore`
3. Owner: `plyotools`
4. Make it **Public** (required for GitHub Pages free tier)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Push Your Code

Run these commands:

```bash
cd "/Users/pre/Documents/Cursor/Explore Instances"
git push -u origin main
```

If you get authentication errors, you may need to:
- Use SSH instead: `git remote set-url origin git@github.com:plyotools/explore.git`
- Or use GitHub CLI: `gh auth login`

## Step 3: Enable GitHub Pages

1. Go to: https://github.com/plyotools/explore/settings/pages
2. Under "Source", select **"GitHub Actions"** (NOT "Deploy from a branch")
3. Click "Save"

## Step 4: Wait for Deployment

1. Go to: https://github.com/plyotools/explore/actions
2. You should see a workflow run starting automatically
3. Wait for it to complete (usually 2-3 minutes)
4. Once it shows a green checkmark, your site will be live at:
   **https://plyotools.github.io/explore/**

## Troubleshooting

- **404 error persists:** Make sure you selected "GitHub Actions" as the source, not a branch
- **Workflow fails:** Check the Actions tab for error details
- **Repository doesn't exist:** Create it first (Step 1)


# Quick Start - Deploy to GitHub Pages

## One-Time Setup (5 minutes)

### Step 1: Create Repository
1. Go to: https://github.com/new
2. Repository name: `explore`
3. Owner: `plyotools` 
4. Make it **Public**
5. **DO NOT** check any boxes (no README, .gitignore, or license)
6. Click "Create repository"

### Step 2: Push Code
```bash
cd "/Users/pre/Documents/Cursor/Explore Instances"
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to: https://github.com/plyotools/explore/settings/pages
2. Under "Source", select **"GitHub Actions"** (NOT "Deploy from a branch")
3. Click "Save"

### Step 4: Wait
- Check: https://github.com/plyotools/explore/actions
- Wait 2-3 minutes for the workflow to complete
- Your site will be live at: **https://plyotools.github.io/explore/**

## That's It!

After these 4 steps, your site will automatically deploy on every push to `main`.


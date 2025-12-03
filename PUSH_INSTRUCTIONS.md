# Push Instructions

To push your code to GitHub and deploy:

## Option 1: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
gh auth login
git push origin main
```

## Option 2: Using Personal Access Token

1. Create a Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control of private repositories)
   - Copy the token

2. Push using the token:
   ```bash
   git push https://YOUR_TOKEN@github.com/plyotools/explore.git main
   ```

   Or configure Git credential helper:
   ```bash
   git config --global credential.helper osxkeychain  # macOS
   git push origin main
   # When prompted, use your GitHub username and the token as password
   ```

## Option 3: Using SSH (if you have SSH keys set up)

```bash
git remote set-url origin git@github.com:plyotools/explore.git
git push origin main
```

## After Pushing

1. **Enable GitHub Pages:**
   - Go to: https://github.com/plyotools/explore/settings/pages
   - Under "Source", select **GitHub Actions**
   - Click "Save"

2. **Check Deployment:**
   - Go to: https://github.com/plyotools/explore/actions
   - Wait for the "Deploy to GitHub Pages" workflow to complete
   - Your site will be live at: https://plyotools.github.io/explore/

## Current Status

- ✅ Remote configured: `https://github.com/plyotools/explore.git`
- ✅ README updated with live demo link
- ✅ GitHub Actions workflow configured (`.github/workflows/deploy.yml`)
- ✅ Build script configured (`scripts/generate-index.js`)
- ⏳ Waiting for push to GitHub

# Quick Deploy Setup

## ✅ What's Ready

- ✅ Build errors fixed
- ✅ Deployment script created (`scripts/deploy.sh`)
- ✅ npm script added (`npm run deploy:plyotools`)
- ✅ All changes committed
- ⏳ **Waiting for: GitHub authentication**

## 🚀 One-Time Setup (Do This Once)

### Option 1: HTTPS with Personal Access Token (Recommended)

1. **Create a GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name it: "Explore Deploy"
   - Select scope: **`repo`** (full control)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Configure Git to remember your credentials:**
   ```bash
   cd "/Users/pre/Documents/Cursor/Explore Instances"
   git config --global credential.helper osxkeychain
   ```

3. **First push (you'll be prompted once):**
   ```bash
   git push origin main
   ```
   - **Username**: your GitHub username
   - **Password**: paste the **token** (not your GitHub password)

After this, macOS will remember your token and future pushes will be automatic!

### Option 2: SSH Key

If you prefer SSH:

1. **Generate SSH key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add to GitHub:**
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste and save

3. **Update remote:**
   ```bash
   cd "/Users/pre/Documents/Cursor/Explore Instances"
   git remote set-url origin git@github.com:plyotools/explore.git
   ```

## 🎯 Future Deployments

After the one-time setup above, you can deploy in **3 ways**:

### Method 1: Simple Command (Recommended)
```bash
npm run deploy:plyotools
```

### Method 2: Script
```bash
./scripts/deploy.sh
```

### Method 3: Direct Git
```bash
git push origin main
```

All three will:
1. Build the project (to catch errors early)
2. Push to GitHub
3. Trigger automatic deployment to https://plyotools.github.io/explore/

## 📋 Current Status

- **Local commits ready**: 5 commits ahead of origin/main
- **Build status**: ✅ Builds successfully
- **Remote**: `https://github.com/plyotools/explore.git`
- **Blocking**: Authentication required for first push

## 🔍 Verify Deployment

After pushing, check:
- **Actions**: https://github.com/plyotools/explore/actions
- **Live site**: https://plyotools.github.io/explore/ (after workflow completes)

## ⚙️ Enable GitHub Pages (One-Time)

If not already enabled:
1. Go to: https://github.com/plyotools/explore/settings/pages
2. Under "Source", select **GitHub Actions**
3. Click "Save"



# Quick Authentication Setup

## Step 1: Create GitHub Personal Access Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note**: "Explore Deploy"
   - **Expiration**: Choose your preference (90 days, 1 year, or no expiration)
   - **Scopes**: Check **`repo`** (this gives full repository access)
4. Click **"Generate token"**
5. **IMPORTANT**: Copy the token immediately (it looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - You won't be able to see it again!

## Step 2: Use the Token

You have two options:

### Option A: Use Token in URL (One-time, for this push)
```bash
cd "/Users/pre/Documents/Cursor/Explore Instances"
git push https://YOUR_TOKEN@github.com/plyotools/explore.git main
```
Replace `YOUR_TOKEN` with the token you copied.

### Option B: Save Token in Keychain (Recommended - works forever)
```bash
cd "/Users/pre/Documents/Cursor/Explore Instances"
git push origin main
```
When prompted:
- **Username**: your GitHub username
- **Password**: paste the **token** (not your GitHub password)

macOS will save it in Keychain, so you won't need to enter it again!

## Alternative: Use SSH Instead

If you prefer SSH:

1. **Add your SSH key to GitHub:**
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: **https://github.com/settings/keys**
   - Click **"New SSH key"**
   - Paste the key and save

2. **Switch remote to SSH:**
   ```bash
   cd "/Users/pre/Documents/Cursor/Explore Instances"
   git remote set-url origin git@github.com:plyotools/explore.git
   git push origin main
   ```





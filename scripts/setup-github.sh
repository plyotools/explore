#!/bin/bash
# Complete setup script for GitHub Pages deployment

set -e

REPO_NAME="explore"
ORG="plyotools"
REMOTE_URL="git@github.com:${ORG}/${REPO_NAME}.git"

echo "🚀 Setting up GitHub repository and deployment..."
echo ""

# Check if repo exists
echo "Checking if repository exists..."
if git ls-remote "$REMOTE_URL" &>/dev/null 2>&1; then
    echo "✅ Repository already exists!"
    REPO_EXISTS=true
else
    echo "❌ Repository does not exist yet."
    REPO_EXISTS=false
fi

# If repo doesn't exist, try to create it
if [ "$REPO_EXISTS" = false ]; then
    echo ""
    echo "Attempting to create repository..."
    
    # Try with GitHub CLI first
    if command -v gh &> /dev/null; then
        echo "Using GitHub CLI..."
        if gh repo create "${ORG}/${REPO_NAME}" --public --source=. --remote=origin --push 2>&1; then
            echo "✅ Repository created and code pushed!"
            REPO_EXISTS=true
        else
            echo "GitHub CLI creation failed, will try manual method..."
        fi
    fi
    
    # If still doesn't exist, provide manual instructions
    if [ "$REPO_EXISTS" = false ]; then
        echo ""
        echo "⚠️  Please create the repository manually:"
        echo ""
        echo "1. Open: https://github.com/new"
        echo "2. Repository name: $REPO_NAME"
        echo "3. Owner: $ORG"
        echo "4. Make it PUBLIC (required for free GitHub Pages)"
        echo "5. DO NOT initialize with README, .gitignore, or license"
        echo "6. Click 'Create repository'"
        echo ""
        read -p "Press Enter after creating the repository..."
        
        # Verify it exists now
        if git ls-remote "$REMOTE_URL" &>/dev/null 2>&1; then
            echo "✅ Repository found!"
            REPO_EXISTS=true
        else
            echo "❌ Repository still not found. Please check the name and try again."
            exit 1
        fi
    fi
fi

# Push code
if [ "$REPO_EXISTS" = true ]; then
    echo ""
    echo "Pushing code to GitHub..."
    if git push -u origin main 2>&1; then
        echo "✅ Code pushed successfully!"
    else
        echo "❌ Push failed. Please check your authentication."
        exit 1
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://github.com/${ORG}/${REPO_NAME}/settings/pages"
echo "2. Under 'Source', select 'GitHub Actions' (NOT 'Deploy from a branch')"
echo "3. Click 'Save'"
echo "4. Check deployment: https://github.com/${ORG}/${REPO_NAME}/actions"
echo "5. Your site will be live at: https://${ORG}.github.io/${REPO_NAME}/"
echo ""


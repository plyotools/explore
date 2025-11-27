#!/bin/bash
# Script to create GitHub repository and push code

set -e

REPO_NAME="explore"
ORG="plyotools"
REMOTE_URL="git@github.com:${ORG}/${REPO_NAME}.git"

echo "Checking if repository exists..."
if git ls-remote "$REMOTE_URL" &>/dev/null; then
    echo "Repository already exists!"
else
    echo "Repository does not exist. You need to create it first."
    echo ""
    echo "Option 1: Create via GitHub website:"
    echo "  1. Go to https://github.com/new"
    echo "  2. Repository name: $REPO_NAME"
    echo "  3. Owner: $ORG"
    echo "  4. Make it Public"
    echo "  5. DO NOT initialize with README"
    echo "  6. Click 'Create repository'"
    echo ""
    echo "Option 2: Create via GitHub CLI (if installed):"
    echo "  gh repo create $ORG/$REPO_NAME --public --source=. --remote=origin --push"
    echo ""
    read -p "Press Enter after you've created the repository, or Ctrl+C to cancel..."
fi

echo ""
echo "Pushing code to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "Next steps:"
echo "1. Go to: https://github.com/${ORG}/${REPO_NAME}/settings/pages"
echo "2. Under 'Source', select 'GitHub Actions'"
echo "3. Click 'Save'"
echo "4. Wait for deployment at: https://${ORG}.github.io/${REPO_NAME}/"


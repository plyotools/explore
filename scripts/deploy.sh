#!/bin/bash
# Deploy script for plyotools/explore
# Usage: ./scripts/deploy.sh or npm run deploy:plyotools

set -e

echo "🚀 Deploying to plyotools/explore..."

# Ensure we're in the right directory
cd "$(dirname "$0")/.."

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Warning: You have uncommitted changes."
  echo "   Consider committing them first with: git add -A && git commit -m 'your message'"
  read -p "   Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Build to ensure everything works
echo "📦 Building..."
npm run build

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated!"
echo "   Check status at: https://github.com/plyotools/explore/actions"
echo "   Live site: https://plyotools.github.io/explore/"


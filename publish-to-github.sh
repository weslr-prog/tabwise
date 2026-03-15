#!/bin/bash
# publish-to-github.sh
# Run this once to push TABWISE to GitHub and enable GitHub Pages.
# Requires: gh CLI (installed via: brew install gh)
# Usage: bash publish-to-github.sh

set -e

echo ""
echo "============================================"
echo "  TABWISE -- Publish to GitHub"
echo "============================================"
echo ""

# Step 1: Auth check
if ! gh auth status &>/dev/null; then
  echo "You need to authenticate with GitHub first."
  echo "Running: gh auth login --web"
  echo ""
  gh auth login --web --git-protocol https
fi

echo ""
echo "Authenticated. Creating GitHub repo..."
echo ""

# Step 2: Create repo and push
gh repo create tabwise \
  --public \
  --description "TABWISE - Smart Tab Optimizer Chrome Extension" \
  --source=. \
  --remote=origin \
  --push

echo ""
echo "Repo created and code pushed!"
echo ""

# Step 3: Get username and show URLs
GH_USER=$(gh api user --jq '.login')
echo "============================================"
echo ""
echo "Your GitHub repo:"
echo "  https://github.com/$GH_USER/tabwise"
echo ""
echo "Enabling GitHub Pages..."
echo ""

# Step 4: Enable GitHub Pages (deploy from main branch root)
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/$GH_USER/tabwise/pages" \
  -f source='{"branch":"main","path":"/"}' 2>/dev/null || \
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$GH_USER/tabwise/pages" \
  -f source='{"branch":"main","path":"/"}' 2>/dev/null || \
echo "(Pages may already be enabled or requires manual activation -- see below)"

echo ""
echo "============================================"
echo "  DONE"
echo "============================================"
echo ""
echo "Privacy policy URL (may take ~1 min to go live):"
echo "  https://$GH_USER.github.io/tabwise/privacy-policy.html"
echo ""
echo "Now update PUBLISH-SUBMISSION-PACK.md:"
echo "  Replace YOUR_GITHUB_USERNAME with: $GH_USER"
echo ""
echo "If GitHub Pages didn't auto-enable, go to:"
echo "  https://github.com/$GH_USER/tabwise/settings/pages"
echo "  Set Source: Deploy from branch > main > / (root) > Save"
echo ""

#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Google Auth NPM Package Publisher${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if logged in to npm
echo -e "${YELLOW}Checking NPM login status...${NC}"
if npm whoami > /dev/null 2>&1; then
    USERNAME=$(npm whoami)
    echo -e "${GREEN}✓ Logged in as: $USERNAME${NC}\n"
else
    echo -e "${RED}✗ Not logged in to NPM${NC}"
    echo -e "${YELLOW}Please run: npm login${NC}\n"
    exit 1
fi

# Run build
echo -e "${YELLOW}Building package...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}\n"
else
    echo -e "${RED}✗ Build failed${NC}\n"
    exit 1
fi

# Check package contents
echo -e "${YELLOW}Checking package contents...${NC}"
npm pack --dry-run
echo ""

# Ask for version bump
echo -e "${BLUE}Select version bump type:${NC}"
echo "1) patch (1.0.0 → 1.0.1) - Bug fixes"
echo "2) minor (1.0.0 → 1.1.0) - New features"
echo "3) major (1.0.0 → 2.0.0) - Breaking changes"
echo "4) Skip version bump"
read -p "Enter choice (1-4): " version_choice

case $version_choice in
    1)
        npm version patch
        ;;
    2)
        npm version minor
        ;;
    3)
        npm version major
        ;;
    4)
        echo -e "${YELLOW}Skipping version bump${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""

# Confirm publish
read -p "$(echo -e ${YELLOW}Do you want to publish to NPM? [y/N]: ${NC})" -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Publishing to NPM...${NC}"
    npm publish --access public
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully published!${NC}\n"
        
        PACKAGE_NAME=$(node -p "require('./package.json').name")
        VERSION=$(node -p "require('./package.json').version")
        
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  Package Published Successfully! 🎉${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo -e "Package: ${BLUE}$PACKAGE_NAME${NC}"
        echo -e "Version: ${BLUE}$VERSION${NC}"
        echo -e "NPM URL: ${BLUE}https://www.npmjs.com/package/$PACKAGE_NAME${NC}"
        echo ""
        echo -e "${YELLOW}Users can now install with:${NC}"
        echo -e "  ${BLUE}npm install $PACKAGE_NAME${NC}"
        echo ""
    else
        echo -e "${RED}✗ Publish failed${NC}\n"
        exit 1
    fi
else
    echo -e "${YELLOW}Publish cancelled${NC}\n"
fi

# Ask about git push
if [[ $version_choice != 4 ]]; then
    read -p "$(echo -e ${YELLOW}Do you want to push to GitHub? [y/N]: ${NC})" -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Pushing to GitHub...${NC}"
        git push origin main --tags
        echo -e "${GREEN}✓ Pushed to GitHub${NC}\n"
    fi
fi

echo -e "${GREEN}Done!${NC}"

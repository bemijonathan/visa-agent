#!/bin/bash
set -e

echo "🚀 Visa Agent Deployment Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for required tools
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is required but not installed.${NC}"
        exit 1
    fi
}

check_tool bun

echo -e "${YELLOW}Step 1: Building Dashboard...${NC}"
cd dashboard
bun install
bun run build
echo -e "${GREEN}✓ Dashboard built${NC}"

echo -e "${YELLOW}Step 2: Building Backend...${NC}"
cd ../backend
bun install
bunx prisma generate
bun run build
echo -e "${GREEN}✓ Backend built${NC}"

echo -e "${YELLOW}Step 3: Building Extension...${NC}"
cd ../extension
bun install
bun run build
echo -e "${GREEN}✓ Extension built → extension/dist/${NC}"

cd ..

echo ""
echo -e "${GREEN}✅ All builds complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Deploy backend:  railway up  OR  flyctl deploy"
echo "  2. Run migration:   railway run bunx prisma db push"
echo "  3. Upload extension to Chrome Web Store (extension/dist/)"
echo ""
echo "See DEPLOY.md for detailed instructions."

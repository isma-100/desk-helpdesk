#!/bin/bash
# DESK IT Helpdesk — One-command setup script
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DESK — IT Helpdesk Setup           ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi
NODE_VER=$(node -v | cut -dv -f2 | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js v18+ required. Current: $(node -v)"
  exit 1
fi
echo -e "✅ Node.js $(node -v)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
  echo -e "${YELLOW}⚠️  MongoDB not found locally.${NC}"
  echo "   Use MongoDB Atlas (free): https://www.mongodb.com/atlas"
  echo "   Or install locally: https://www.mongodb.com/try/download/community"
  echo ""
fi

# Install dependencies
echo -e "\n${BLUE}Installing dependencies...${NC}"
cd backend && npm install --silent
cd ../frontend && npm install --silent
cd ..
echo "✅ Dependencies installed"

# Create .env if it doesn't exist
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo -e "\n${YELLOW}⚠️  backend/.env created from template.${NC}"
  echo "   Edit backend/.env and set:"
  echo "   - MONGO_URI=mongodb://localhost:27017/helpdesk_db"
  echo "   - JWT_SECRET=<a-long-random-string>"
  echo ""
  echo "   Press Enter after editing .env to continue, or Ctrl+C to stop..."
  read -r
fi

# Seed the database
echo -e "${BLUE}Seeding database...${NC}"
cd backend && npm run seed
cd ..
echo -e "✅ Database seeded"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup complete! Ready to start.    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo "  Run:    npm run dev"
echo ""
echo "  URLs:"
echo "    Frontend → http://localhost:3000"
echo "    Backend  → http://localhost:5000/api"
echo ""
echo "  Demo logins:"
echo "    Employee   → sarah@company.com  / password123"
echo "    Technician → alex@company.com   / password123"
echo "    Admin      → david@company.com  / password123"
echo ""

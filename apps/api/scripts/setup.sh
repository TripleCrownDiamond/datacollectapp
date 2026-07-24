#!/bin/bash
# ── TerraCollect API Setup Script ──
# Run from apps/api/ directory:
#   bash scripts/setup.sh
#
# Or from repo root:
#   pnpm --filter @terracollect/api setup
#
# For Windows: use Git Bash, WSL, or run the commands manually.
# ==============================================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   TerraCollect API — Setup                   ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── 1. Environment file ──
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
    echo "   📝 Edit apps/api/.env if needed (defaults match docker-compose)"
  else
    echo "❌ .env.example not found"
    exit 1
  fi
else
  echo "✅ .env already exists"
fi

# ── 2. Infrastructure check ──
echo ""
echo "🔍 Checking infrastructure..."

# We check using docker if available
if command -v docker &> /dev/null; then
  # Check if PostgreSQL is reachable
  PG_UP=false
  if command -v pg_isready &> /dev/null; then
    pg_isready -q 2>/dev/null && PG_UP=true
  fi

  if [ "$PG_UP" = false ]; then
    echo "   ⚠️  PostgreSQL not detected."
    echo "   💡 Start infrastructure:  docker compose -f infra/docker-compose.yml up -d"
    echo "   💡 Or from repo root:      make dev-up"
  else
    echo "   ✅ PostgreSQL is running"
  fi
else
  echo "   ⚠️  Docker not detected. Make sure PostgreSQL is running on localhost:5432"
fi

# ── 3. Install dependencies ──
echo ""
echo "📦 Installing dependencies..."
pnpm install
echo "   ✅ Dependencies installed"

# ── 4. Generate Prisma client ──
echo ""
echo "🔷 Generating Prisma client..."
npx prisma generate --schema=prisma/schema.prisma
echo "   ✅ Prisma client generated"

# ── 5. Run migrations ──
echo ""
echo "🗄️  Running database migrations..."

# Check if migrations directory exists
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  npx prisma migrate deploy --schema=prisma/schema.prisma 2>/dev/null || {
    echo "   ⚠️  Migration deploy failed. Trying migrate dev..."
    npx prisma migrate dev --schema=prisma/schema.prisma || echo "   ⚠️  Migration failed — is the database running?"
  }
else
  echo "   📦 Creating initial migration..."
  npx prisma migrate dev --schema=prisma/schema.prisma --name init 2>/dev/null || {
    echo "   ⚠️  Migration failed — is the database running?"
    echo "   💡 Start PostgreSQL first:  docker compose -f infra/docker-compose.yml up -d"
    echo "   💡 Then run:                 pnpm db:migrate"
  }
fi

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅ Setup complete!                         ║"
echo "╠══════════════════════════════════════════════╣"
echo "║   Start dev servers:                         ║"
echo "║     pnpm dev                                 ║"
echo "║                                              ║"
echo "║   Seed demo data:                            ║"
echo "║     pnpm db:seed                             ║"
echo "║                                              ║"
echo "║   API will be at:                            ║"
echo "║     http://localhost:3001/v1                  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

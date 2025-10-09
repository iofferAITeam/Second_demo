#!/bin/sh

echo "🚀 Starting backend service..."

# 等待数据库准备就绪
echo "⏳ Waiting for database connection..."
npx wait-port postgres:5432 -t 60000

# 运行数据库迁移（不强制重置，保留数据）
echo "📊 Running database migrations..."
npx prisma db push --skip-generate

echo "🔄 Generating Prisma client..."
npx prisma generate

# 运行数据库种子（只在数据库为空时）
echo "🌱 Seeding database with initial data (if needed)..."
npm run db:seed || true

echo "✅ Database initialization completed!"
echo "🎯 Starting application..."
npm run dev
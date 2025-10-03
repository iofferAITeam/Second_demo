#!/bin/sh

echo "🚀 Starting backend service..."

# 等待数据库准备就绪
echo "⏳ Waiting for database connection..."
npx wait-port postgres:5432 -t 60000

# 运行数据库迁移
echo "📊 Running database migrations..."
npx prisma db push --accept-data-loss --force-reset

echo "🔄 Generating Prisma client..."
npx prisma generate

# 运行数据库种子
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo "✅ Database initialization completed!"
echo "🎯 Starting application..."
npm run dev
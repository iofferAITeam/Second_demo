#!/bin/bash

echo "🚀 Starting backend in production mode..."

# 等待数据库可用
echo "⏳ Waiting for database to be ready..."
npx wait-port postgres:5432

# 等待数据库完全启动
echo "⏳ Waiting additional 5 seconds for database to be fully ready..."
sleep 5

# 检查数据库连接并重试
echo "🔍 Testing database connection..."
for i in {1..5}; do
  if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection established"
    break
  else
    echo "⏳ Attempt $i/5 - Database not ready, waiting 10 seconds..."
    sleep 10
  fi
  
  if [ $i -eq 5 ]; then
    echo "❌ Failed to connect to database after 5 attempts"
    exit 1
  fi
done

# 强制推送schema到数据库
echo "🔄 Pushing database schema..."
npx prisma db push --accept-data-loss --force-reset

if [ $? -ne 0 ]; then
  echo "❌ Failed to push database schema"
  exit 1
fi

# 验证数据库表是否创建成功
echo "✅ Verifying database tables..."
TABLES=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -o '[0-9]*' | head -1)

if [ "$TABLES" -gt 0 ]; then
  echo "✅ Database tables created successfully ($TABLES tables found)"
else
  echo "❌ No tables found in database"
  exit 1
fi

# 生成Prisma客户端
echo "🔧 Generating Prisma client..."
npx prisma generate

# 运行种子数据（如果存在）
echo "🌱 Seeding database..."
if [ -f "./prisma/seed.ts" ]; then
  npx prisma db seed || echo "⚠️  Seeding failed, continuing..."
else
  echo "ℹ️  No seed file found, skipping..."
fi

# 启动应用
echo "✅ Starting application server..."
exec node dist/server.js
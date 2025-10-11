#!/bin/bash

echo "🚀 Starting backend in production mode..."

# 等待数据库可用
echo "⏳ Waiting for database to be ready..."
npx wait-port postgres:5432

# 运行数据库迁移 (如果迁移文件存在)
echo "🔄 Running database migrations..."
if [ -d "./prisma/migrations" ]; then
  npx prisma migrate deploy
else
  echo "⚠️  No migrations found, running db push instead..."
  npx prisma db push --force-reset
fi

# 生成Prisma客户端（如果需要）
echo "🔧 Generating Prisma client..."
npx prisma generate

# 启动应用
echo "✅ Starting application server..."
exec node dist/server.js
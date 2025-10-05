#!/bin/bash

echo "🚀 Starting backend in production mode..."

# 等待数据库可用
echo "⏳ Waiting for database to be ready..."
npx wait-port postgres:5432

# 运行数据库迁移
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# 生成Prisma客户端（如果需要）
echo "🔧 Generating Prisma client..."
npx prisma generate

# 启动应用
echo "✅ Starting application server..."
exec node dist/server.js
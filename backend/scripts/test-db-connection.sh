#!/bin/bash

echo "🔍 Testing database connection..."

# 测试数据库连接
if npx prisma db execute --stdin <<< "SELECT 1 as test;" 2>/dev/null; then
  echo "✅ Database connection successful"
  
  # 检查表是否存在
  echo "📊 Checking database tables..."
  TABLES=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -o '[0-9]*' | head -1)
  
  if [ "$TABLES" -gt 0 ]; then
    echo "✅ Database has $TABLES tables"
    
    # 列出所有表
    echo "📋 Available tables:"
    npx prisma db execute --stdin <<< "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>/dev/null
  else
    echo "⚠️  No tables found in database"
  fi
else
  echo "❌ Database connection failed"
  exit 1
fi

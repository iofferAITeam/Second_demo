#!/bin/bash

echo "🧪 测试本地部署文件..."

# 检查前端文件
echo "检查前端配置文件..."
if [ -f "frontend/package.json" ]; then
    echo "✅ package.json 存在"
else
    echo "❌ package.json 不存在"
    exit 1
fi

if [ -f "frontend/tailwind.config.ts" ]; then
    echo "✅ tailwind.config.ts 存在"
else
    echo "❌ tailwind.config.ts 不存在"
    exit 1
fi

if [ -f "frontend/postcss.config.mjs" ]; then
    echo "✅ postcss.config.mjs 存在"
else
    echo "❌ postcss.config.mjs 不存在"
    exit 1
fi

if [ -f "frontend/next.config.ts" ]; then
    echo "✅ next.config.ts 存在"
else
    echo "❌ next.config.ts 不存在"
    exit 1
fi

# 检查 CSS 文件
if [ -f "frontend/src/app/globals.css" ]; then
    echo "✅ globals.css 存在"
    if grep -q "@tailwind base" frontend/src/app/globals.css; then
        echo "✅ Tailwind CSS 配置正确"
    else
        echo "❌ Tailwind CSS 配置错误"
        exit 1
    fi
else
    echo "❌ globals.css 不存在"
    exit 1
fi

# 检查 Dockerfile
if [ -f "frontend/Dockerfile" ]; then
    echo "✅ 开发 Dockerfile 存在"
else
    echo "❌ 开发 Dockerfile 不存在"
    exit 1
fi

if [ -f "frontend/Dockerfile.prod" ]; then
    echo "✅ 生产 Dockerfile 存在"
else
    echo "❌ 生产 Dockerfile 不存在"
    exit 1
fi

# 检查 docker-compose 文件
if [ -f "docker-compose.prod.yml" ]; then
    echo "✅ docker-compose.prod.yml 存在"
else
    echo "❌ docker-compose.prod.yml 不存在"
    exit 1
fi

echo ""
echo "🎉 所有部署文件检查通过！"
echo ""
echo "📦 现在可以使用以下命令部署："
echo "   开发环境: docker-compose up --build"
echo "   生产环境: docker-compose -f docker-compose.prod.yml up --build"
echo ""
echo "🌐 访问地址："
echo "   前端: http://localhost:3005"
echo "   后端: http://localhost:8001"
echo "   AI服务: http://localhost:5555"
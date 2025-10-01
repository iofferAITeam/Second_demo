#!/bin/bash

echo "🚀 iOffer 大学推荐系统 - Docker 一键启动"
echo "========================================"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "📋 检查 Docker 服务状态..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ 错误: Docker 服务未运行，请启动 Docker"
    exit 1
fi

echo "🛠️  停止可能存在的旧容器..."
docker-compose down

echo "🏗️  构建并启动所有服务..."
docker-compose up -d --build

echo "⏱️  等待服务启动..."
sleep 10

echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 启动完成! 访问地址:"
echo "🌐 前端应用: http://localhost:3000"
echo "🔗 后端API: http://localhost:8001"
echo "🤖 AI服务: http://localhost:8000"
echo "📚 API文档: http://localhost:8000/docs"
echo ""
echo "📋 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
echo ""
echo "如需帮助，请查看 DOCKER_SETUP.md 文档"
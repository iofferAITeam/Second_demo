#!/bin/bash

# Docker启动脚本 - iOffer系统
echo "🚀 启动 iOffer 大学推荐系统..."

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down

# 清理旧镜像（可选，节省空间）
echo "🧹 清理旧镜像..."
docker system prune -f

# 构建并启动所有服务
echo "🔨 构建并启动所有服务..."
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 显示服务状态
echo "📊 服务状态："
docker-compose ps

# 显示访问信息
echo ""
echo "✅ 服务已启动！"
echo ""
echo "📱 访问地址："
echo "   前端应用: http://localhost:3005"
echo "   后端API:  http://localhost:8001"
echo "   AI服务:   http://localhost:5555"
echo "   数据库:   localhost:5432 (PostgreSQL)"
echo "   MongoDB:  localhost:27017"
echo ""
echo "🔧 管理命令："
echo "   查看日志: docker-compose logs -f [service-name]"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart [service-name]"
echo ""
echo "🎯 测试访问："
echo "   1. 访问 http://localhost:3005/auto-login 自动登录"
echo "   2. 然后访问 http://localhost:3005/recommendations 查看推荐"
echo ""
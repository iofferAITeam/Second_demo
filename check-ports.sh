#!/bin/bash

# 检查 EC2 端口连通性脚本
EC2_HOST="ec2-3-145-150-161.us-east-2.compute.amazonaws.com"

echo "🔍 检查 EC2 端口连通性..."
echo "目标主机: $EC2_HOST"
echo ""

# 检查端口函数
check_port() {
    local port=$1
    local service=$2

    echo -n "检查端口 $port ($service): "
    if nc -z -w5 "$EC2_HOST" "$port" 2>/dev/null; then
        echo "✅ 开放"
    else
        echo "❌ 关闭"
    fi
}

# 检查各个服务端口
check_port 22 "SSH"
check_port 3005 "前端应用"
check_port 8001 "后端API"
check_port 5555 "AI服务"
check_port 5432 "PostgreSQL"
check_port 27017 "MongoDB"

echo ""
echo "📋 需要在 AWS 安全组中开放的端口:"
echo "   - 22 (SSH) - 允许你的IP访问"
echo "   - 3005 (前端) - 允许所有IP访问 (0.0.0.0/0)"
echo "   - 8001 (后端API) - 允许所有IP访问 (0.0.0.0/0)"
echo "   - 5555 (AI服务) - 可选，仅用于调试"
echo ""
echo "💡 如果端口显示关闭，请到 AWS 控制台 -> EC2 -> 安全组 中添加相应规则"
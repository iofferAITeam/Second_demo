#!/bin/bash

# 部署验证脚本
# 用于检查部署后的服务是否正常工作

echo "🔍 验证 iOffer 系统部署状态..."

# 配置变量（可以通过参数传入）
HOST=${1:-"localhost"}
FRONTEND_PORT=${2:-"3005"}
BACKEND_PORT=${3:-"8001"}
AI_PORT=${4:-"5555"}

echo "📡 检查主机: $HOST"
echo "🔌 端口配置: 前端($FRONTEND_PORT) 后端($BACKEND_PORT) AI($AI_PORT)"
echo ""

# 检查后端健康状态
echo "🔧 检查后端服务..."
BACKEND_URL="http://$HOST:$BACKEND_PORT/health"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" 2>/dev/null || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ 后端服务正常 ($BACKEND_URL)"
    # 获取详细信息
    BACKEND_INFO=$(curl -s "$BACKEND_URL" 2>/dev/null)
    echo "   📊 状态: $BACKEND_INFO"
else
    echo "❌ 后端服务异常 (HTTP $BACKEND_STATUS) - $BACKEND_URL"
fi

# 检查前端服务
echo ""
echo "🎨 检查前端服务..."
FRONTEND_URL="http://$HOST:$FRONTEND_PORT"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")

if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "307" ]; then
    echo "✅ 前端服务正常 ($FRONTEND_URL)"
else
    echo "❌ 前端服务异常 (HTTP $FRONTEND_STATUS) - $FRONTEND_URL"
fi

# 检查AI服务
echo ""
echo "🤖 检查AI服务..."
AI_URL="http://$HOST:$AI_PORT/health"
AI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$AI_URL" 2>/dev/null || echo "000")

if [ "$AI_STATUS" = "200" ]; then
    echo "✅ AI服务正常 ($AI_URL)"
else
    echo "⚠️  AI服务可能未启动 (HTTP $AI_STATUS) - $AI_URL"
    echo "   (AI服务非必需，系统仍可正常运行)"
fi

# 测试API功能
echo ""
echo "🧪 测试API功能..."
REGISTER_URL="http://$HOST:$BACKEND_PORT/api/auth/register"
TEST_RESPONSE=$(curl -s -X POST "$REGISTER_URL" \
  -H "Content-Type: application/json" \
  -H "Origin: http://$HOST:$FRONTEND_PORT" \
  -d '{"email":"test@test.com","password":"123456","name":"Test"}' 2>/dev/null || echo "ERROR")

if [[ "$TEST_RESPONSE" == *"error"* ]] && [[ "$TEST_RESPONSE" == *"Missing required fields"* ]]; then
    echo "✅ API响应正常 (注册端点可访问)"
elif [[ "$TEST_RESPONSE" == *"success"* ]] || [[ "$TEST_RESPONSE" == *"User already exists"* ]]; then
    echo "✅ API功能正常 (注册成功或用户已存在)"
else
    echo "⚠️  API响应异常: $TEST_RESPONSE"
fi

# 总结
echo ""
echo "📋 部署验证总结:"
if [ "$BACKEND_STATUS" = "200" ] && ([ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "307" ]); then
    echo "🎉 核心服务部署成功！"
    echo ""
    echo "🌐 访问地址:"
    echo "   前端应用: http://$HOST:$FRONTEND_PORT"
    echo "   后端API:  http://$HOST:$BACKEND_PORT"
    if [ "$AI_STATUS" = "200" ]; then
        echo "   AI服务:   http://$HOST:$AI_PORT"
    fi
    echo ""
    echo "✨ 系统已就绪，可以开始使用！"
else
    echo "❌ 部署存在问题，请检查服务日志"
    echo ""
    echo "🔧 故障排除建议:"
    echo "   1. 检查 Docker 容器状态: docker ps"
    echo "   2. 查看服务日志: docker-compose logs [service-name]"
    echo "   3. 确认端口未被占用: netstat -tlnp | grep [port]"
    echo "   4. 检查防火墙和安全组设置"
fi
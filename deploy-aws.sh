#!/bin/bash

# AWS EC2 部署脚本 - iOffer系统
# 使用方法: ./deploy-aws.sh

echo "🚀 开始部署 iOffer 系统到 AWS EC2..."

# 配置变量
EC2_HOST="ec2-3-145-150-161.us-east-2.compute.amazonaws.com"
EC2_USER="ubuntu"  # 或者是 ec2-user，取决于你的AMI
KEY_FILE="./Ioffer_key1.pem"
REMOTE_DIR="/home/ubuntu/ioffer"

# 检查密钥文件权限
echo "🔑 检查密钥文件权限..."
chmod 400 "$KEY_FILE"

# 测试连接
echo "🔗 测试 EC2 连接..."
ssh -i "$KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo '连接成功!'"

if [ $? -ne 0 ]; then
    echo "❌ 无法连接到 EC2 实例，请检查:"
    echo "   1. 密钥文件路径: $KEY_FILE"
    echo "   2. EC2 实例地址: $EC2_HOST"
    echo "   3. 用户名: $EC2_USER"
    echo "   4. 安全组是否开放了 SSH (端口 22)"
    exit 1
fi

echo "✅ EC2 连接测试成功!"

# 创建远程目录
echo "📁 创建远程目录..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "mkdir -p $REMOTE_DIR"

# 同步项目文件 (排除 node_modules 和其他大文件)
echo "📤 上传项目文件..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '__pycache__' \
    -e "ssh -i $KEY_FILE" \
    ./ "$EC2_USER@$EC2_HOST:$REMOTE_DIR/"

echo "📦 安装系统依赖..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << 'EOF'
# 更新系统
sudo apt update

# 安装 Docker
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt update
    sudo apt install -y docker-ce
    sudo usermod -aG docker $USER
fi

# 安装 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

echo "Docker 版本:"
docker --version
docker-compose --version
EOF

echo "🐳 启动 Docker 服务..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" << EOF
cd $REMOTE_DIR

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 创建环境文件
cp .env.production .env

# 停止现有容器
sudo docker-compose -f docker-compose.prod.yml down

# 构建并启动服务
sudo docker-compose -f docker-compose.prod.yml up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 60

# 检查服务状态
echo "📊 检查服务状态:"
sudo docker-compose -f docker-compose.prod.yml ps
EOF

echo ""
echo "✅ 部署完成!"
echo ""
echo "🌐 访问地址:"
echo "   前端应用: http://$EC2_HOST:3005"
echo "   后端API:  http://$EC2_HOST:8001"
echo "   AI服务:   http://$EC2_HOST:5555"
echo ""
echo "🔧 管理命令:"
echo "   SSH登录: ssh -i $KEY_FILE $EC2_USER@$EC2_HOST"
echo "   查看日志: sudo docker-compose -f docker-compose.prod.yml logs -f [service-name]"
echo "   重启服务: sudo docker-compose -f docker-compose.prod.yml restart [service-name]"
echo ""
echo "⚠️  注意事项:"
echo "   1. 确保 EC2 安全组开放了以下端口:"
echo "      - 22 (SSH)"
echo "      - 3005 (前端)"
echo "      - 8001 (后端API)"
echo "      - 5555 (AI服务)"
echo "   2. 如果需要HTTPS，需要配置SSL证书和反向代理"
echo ""
# iOffer 手动部署指南

## 前置条件检查

### 1. 检查 EC2 实例状态
- 确保 EC2 实例正在运行
- 记录实例的公网IP或域名：`ec2-3-145-185-233.us-east-2.compute.amazonaws.com`

### 2. 检查安全组设置
在 AWS 控制台中，为你的 EC2 实例添加以下入站规则：

| 端口 | 协议 | 来源 | 说明 |
|------|------|------|------|
| 22 | TCP | 你的IP | SSH访问 |
| 3005 | TCP | 0.0.0.0/0 | 前端应用 |
| 8001 | TCP | 0.0.0.0/0 | 后端API |
| 5555 | TCP | 0.0.0.0/0 | AI服务(可选) |

### 3. 测试SSH连接
```bash
# 测试连接（替换为正确的用户名）
ssh -i ./ioffer-key.pem ubuntu@ec2-3-145-185-233.us-east-2.compute.amazonaws.com
# 或者
ssh -i ./ioffer-key.pem ec2-user@ec2-3-145-185-233.us-east-2.compute.amazonaws.com
```

## 手动部署步骤

### 步骤1: 连接到 EC2
```bash
ssh -i ./ioffer-key.pem [用户名]@ec2-3-145-185-233.us-east-2.compute.amazonaws.com
```

### 步骤2: 安装必要软件
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt update
sudo apt install -y docker-ce
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装 Git
sudo apt install -y git

# 重新登录以使 Docker 组权限生效
exit
```

### 步骤3: 克隆项目代码
重新连接并克隆代码：
```bash
ssh -i ./ioffer-key.pem [用户名]@ec2-3-145-185-233.us-east-2.compute.amazonaws.com

# 创建项目目录
mkdir -p ~/ioffer
cd ~/ioffer

# 如果你有 Git 仓库，克隆代码
# git clone [你的仓库地址] .

# 或者手动上传文件（在本地运行）
# scp -i ./ioffer-key.pem -r ./* [用户名]@ec2-3-145-185-233.us-east-2.compute.amazonaws.com:~/ioffer/
```

### 步骤4: 配置环境变量
在 EC2 上创建环境配置文件：
```bash
cd ~/ioffer

# 创建环境配置文件
cat > .env << 'EOF'
# 生产环境配置
POSTGRES_DB=ioffer_db
POSTGRES_USER=ioffer_user
POSTGRES_PASSWORD=ioffer_password_prod_2024

# JWT 密钥 (请生成您自己的密钥)
JWT_SECRET=your_jwt_secret_here

# AI 服务 API Keys (请替换为您自己的密钥)
GEMINI_API_KEY=your_gemini_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# 服务端口配置
BACKEND_PORT=8001
FRONTEND_PORT=3005
AI_SERVICE_PORT=5555
POSTGRES_PORT=5432
MONGODB_PORT=27017

# 环境设置
NODE_ENV=production

# 前端配置
NEXT_PUBLIC_API_URL=http://ec2-3-145-185-233.us-east-2.compute.amazonaws.com:8001
NEXT_PUBLIC_APP_NAME=iOffer College Recommendation System
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
```

### 步骤5: 启动服务
```bash
# 创建数据卷
docker volume create ioffer_postgres_data

# 启动服务（如果有 docker-compose.prod.yml）
docker-compose -f docker-compose.prod.yml up --build -d

# 或者使用普通的 docker-compose.yml
docker-compose up --build -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 步骤6: 验证部署
```bash
# 检查所有容器状态
docker ps

# 检查服务健康状态
curl http://localhost:8001/health
curl http://localhost:3005

# 查看特定服务日志
docker-compose logs frontend
docker-compose logs backend
docker-compose logs ai-service
```

## 访问应用

部署完成后，你可以通过以下地址访问：

- **前端应用**: http://ec2-3-145-185-233.us-east-2.compute.amazonaws.com:3005
- **后端API**: http://ec2-3-145-185-233.us-east-2.compute.amazonaws.com:8001
- **AI服务**: http://ec2-3-145-185-233.us-east-2.compute.amazonaws.com:5555

## 故障排除

### 常见问题

1. **端口无法访问**
   - 检查 AWS 安全组是否开放了相应端口
   - 检查 EC2 实例的防火墙设置

2. **容器启动失败**
   ```bash
   # 查看详细错误日志
   docker-compose logs [service-name]

   # 重新构建镜像
   docker-compose build --no-cache [service-name]
   ```

3. **数据库连接失败**
   ```bash
   # 检查数据库容器状态
   docker-compose logs postgres

   # 进入数据库容器检查
   docker exec -it ioffer-postgres psql -U ioffer_user -d ioffer_db
   ```

4. **API Key 错误**
   - 确保 `.env` 文件中的 API Keys 正确
   - 重启相关服务：`docker-compose restart backend ai-service`

### 重新部署
```bash
# 停止所有服务
docker-compose down

# 清理（可选）
docker system prune -f

# 重新构建并启动
docker-compose up --build -d
```

## 监控和维护

### 查看系统资源
```bash
# 查看 Docker 资源使用
docker stats

# 查看系统资源
htop
df -h
```

### 备份数据库
```bash
# 备份 PostgreSQL
docker exec ioffer-postgres pg_dump -U ioffer_user ioffer_db > backup_$(date +%Y%m%d).sql

# 备份 MongoDB
docker exec ioffer-mongodb mongodump --out /backup
```

### 日志管理
```bash
# 查看所有服务日志
docker-compose logs

# 实时查看特定服务日志
docker-compose logs -f frontend

# 清理日志（Docker 日志可能会占用大量空间）
docker system prune -f
```
# Docker 一键启动指南

这个文档提供了使用 Docker 一键启动整个 iOffer 大学推荐系统的完整指南。

## 📋 系统要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 4GB 可用内存
- 至少 10GB 可用磁盘空间

## 🚀 快速启动

### 1. 克隆代码并进入项目目录

```bash
git clone <你的仓库地址>
cd college-recommendation
```

### 2. 一键启动所有服务

```bash
# 启动所有服务（首次启动会自动构建镜像）
docker-compose up -d

# 查看启动状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 访问应用

启动成功后，可以通过以下地址访问：

- **前端应用**: http://localhost:3005
- **后端API**: http://localhost:8001
- **AI服务**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **数据库**:
  - PostgreSQL: localhost:5432
  - MongoDB: localhost:27017

## 📁 服务架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Service    │
│   (Next.js)     │────│   (Node.js)     │────│   (FastAPI)     │
│   Port: 3000    │    │   Port: 8001    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                 ┌──────────────────────────────┐
                 │         Databases            │
                 │  PostgreSQL(5432) + MongoDB  │
                 │         (27017)              │
                 └──────────────────────────────┘
```

## 🛠️ 常用命令

### 基本操作

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启所有服务
docker-compose restart

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f [service-name]
```

### 单独操作服务

```bash
# 只启动数据库
docker-compose up -d postgres mongodb

# 重启特定服务
docker-compose restart frontend

# 查看特定服务日志
docker-compose logs -f ai-service
```

### 开发调试

```bash
# 重新构建镜像
docker-compose build

# 强制重新构建并启动
docker-compose up --build

# 进入容器调试
docker-compose exec backend bash
docker-compose exec ai-service bash
```

## 🗄️ 数据管理

### 数据库连接信息

**PostgreSQL:**
- Host: localhost:5432
- Database: ioffer_db
- Username: ioffer_user
- Password: ioffer_password

**MongoDB:**
- Host: localhost:27017
- 无认证要求

### 数据持久化

数据自动保存在Docker volumes中：
- `postgres_data`: PostgreSQL数据
- `mongodb_data`: MongoDB数据

### 重置数据库

```bash
# 停止服务
docker-compose down

# 删除数据卷（⚠️ 会丢失所有数据）
docker volume rm college-recommendation_postgres_data
docker volume rm college-recommendation_mongodb_data

# 重新启动
docker-compose up -d
```

## 🔧 故障排除

### 常见问题

**1. 端口冲突**
```bash
# 查看端口占用
lsof -i :3000
lsof -i :8001
lsof -i :8000
lsof -i :5432
lsof -i :27017

# 修改 docker-compose.yml 中的端口映射
```

**2. 容器启动失败**
```bash
# 查看详细错误日志
docker-compose logs [service-name]

# 检查容器状态
docker-compose ps
```

**3. 前端无法连接后端**
- 检查 `frontend/.env.local` 中的 `NEXT_PUBLIC_API_URL` 配置
- 确认后端服务正常运行：`curl http://localhost:8001/health`

**4. AI服务连接失败**
- 检查API密钥配置
- 确认AI服务正常运行：`curl http://localhost:8000/health`

**5. 数据库连接失败**
```bash
# 检查数据库是否启动
docker-compose exec postgres pg_isready -U ioffer_user -d ioffer_db

# 连接数据库测试
docker-compose exec postgres psql -U ioffer_user -d ioffer_db
```

### 清理和重置

```bash
# 停止并删除所有容器
docker-compose down

# 删除所有相关镜像
docker-compose down --rmi all

# 完全清理（包括数据卷）
docker-compose down -v

# 清理构建缓存
docker system prune
```

## ⚙️ 环境配置

### 自定义环境变量

创建 `.env` 文件来覆盖默认配置：

```env
# API密钥（可选，有默认值）
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key

# 数据库配置（通常不需要修改）
POSTGRES_DB=ioffer_db
POSTGRES_USER=ioffer_user
POSTGRES_PASSWORD=ioffer_password
```

### 开发环境配置

如果需要在开发模式下运行（支持热重载）：

```bash
# 使用开发模式的 docker-compose 文件
docker-compose -f docker-compose.dev.yml up -d
```

## 📊 服务健康检查

```bash
# 检查所有服务状态
curl http://localhost:3000          # 前端
curl http://localhost:8001/health   # 后端
curl http://localhost:8000/health   # AI服务

# 检查数据库
docker-compose exec postgres pg_isready -U ioffer_user -d ioffer_db
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## 🎯 生产部署

对于生产环境部署，建议：

1. 使用生产版本的镜像构建
2. 配置环境变量文件
3. 使用外部数据库
4. 配置反向代理（Nginx）
5. 启用HTTPS
6. 配置监控和日志

## 📞 技术支持

如果遇到问题：

1. 首先查看日志：`docker-compose logs -f`
2. 检查服务状态：`docker-compose ps`
3. 查看本文档的故障排除部分
4. 联系开发团队

---

**注意**: 首次启动可能需要几分钟来下载镜像和构建服务，请耐心等待。
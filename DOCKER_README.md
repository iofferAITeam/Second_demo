# iOffer 大学推荐系统 - Docker 部署指南

## 🚀 快速启动

**所有环境变量已预配置默认值，数据库自动初始化，无需额外配置即可直接使用！**

### 方法一：使用自动启动脚本（推荐）
```bash
# 进入项目目录
cd /Users/ella/Desktop/Ioffer/code

# 运行启动脚本
./docker-start.sh
```

### 方法二：手动启动
```bash
# 进入项目目录
cd /Users/ella/Desktop/Ioffer/code

# 停止现有服务
docker-compose down

# 构建并启动所有服务
docker-compose up --build -d
```

### 方法三：一键启动（最简单）
```bash
# 直接运行，无需任何配置
docker-compose up -d
```

## 📋 包含的服务

| 服务名 | 端口 | 描述 | 访问地址 |
|--------|------|------|----------|
| Frontend | 3005 | Next.js 前端应用 | http://localhost:3005 |
| Backend | 8001 | Node.js 后端API | http://localhost:8001 |
| AI Service | 5555 | Python FastAPI AI服务 | http://localhost:5555 |
| PostgreSQL | 5432 | 主数据库 | localhost:5432 |
| MongoDB | 27017 | 文档数据库 | localhost:27017 |

## 🎯 测试访问

1. **自动登录**: http://localhost:3005/auto-login
2. **推荐页面**: http://localhost:3005/recommendations
3. **用户档案**: http://localhost:3005/profile
4. **聊天界面**: http://localhost:3005/chat

## ⚙️ 环境变量配置

### 🎉 预配置默认值
所有服务已预配置以下默认值，无需额外设置：

#### 数据库配置
- **PostgreSQL**: `ioffer_db` / `ioffer_user` / `ioffer_password`
- **MongoDB**: 无认证

#### AI服务API Keys
- **OpenAI API**: 已预配置可用的API key
- **Gemini API**: 已预配置可用的API key
- **Perplexity API**: 已预配置可用的API key

#### 端口配置
- **前端**: 3005
- **后端**: 8001
- **AI服务**: 5555
- **PostgreSQL**: 5432
- **MongoDB**: 27017

### 🔧 自定义配置（可选）
如需修改默认配置，可创建 `.env` 文件：

```bash
# 复制示例配置文件
cp .env.example .env

# 编辑配置（可选）
nano .env
```

支持的环境变量：
```bash
# 数据库
POSTGRES_DB=ioffer_db
POSTGRES_USER=ioffer_user
POSTGRES_PASSWORD=your_password

# 端口
FRONTEND_PORT=3005
BACKEND_PORT=8001
AI_SERVICE_PORT=5555
POSTGRES_PORT=5432
MONGODB_PORT=27017

# API Keys (可选替换)
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key

# JWT密钥
JWT_SECRET=your_jwt_secret
```

修改配置后重启服务：
```bash
docker-compose down
docker-compose up -d
```

## 🔧 管理命令

### 查看服务状态
```bash
docker-compose ps
```

### 查看服务日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f ai-service
```

### 重启特定服务
```bash
docker-compose restart frontend
docker-compose restart backend
docker-compose restart ai-service
```

### 停止所有服务
```bash
docker-compose down
```

### 完全清理（删除数据卷）
```bash
docker-compose down -v
docker system prune -a
```

## 🛠️ 开发调试

### 进入容器
```bash
# 进入前端容器
docker exec -it ioffer-frontend sh

# 进入后端容器
docker exec -it ioffer-backend sh

# 进入AI服务容器
docker exec -it ioffer-ai-service bash
```

### 查看数据库
```bash
# 连接PostgreSQL
docker exec -it ioffer-postgres psql -U ioffer_user -d ioffer_db

# 连接MongoDB
docker exec -it ioffer-mongodb mongosh
```

## 📁 项目结构

```
/Users/ella/Desktop/Ioffer/code/
├── docker-compose.yml      # Docker编排配置
├── docker-start.sh         # 自动启动脚本
├── frontend/               # Next.js前端
│   ├── Dockerfile
│   └── src/
├── backend/                # Node.js后端
│   ├── Dockerfile
│   └── src/
├── ai-service/             # Python AI服务
│   ├── Dockerfile
│   └── app/
└── DOCKER_README.md        # 本说明文档
```

## 🎨 已包含的修改

✅ **Profile Summary 4+2 卡片布局**
- 第一行：4个小卡片（GPA, Major, TOEFL, GRE）
- 第二行：2个卡片（Nationality, Goals）

✅ **删除语言切换按钮**
- 移除了"EN"语言选择器

✅ **优化字体大小**
- "Computer Science"等文本字号已调小

✅ **AI评分六边形**
- Academic Background 和 Overall Fit 评分
- 颜色与卡片背景一致

## 🔍 故障排除

### 端口冲突
如果遇到端口冲突，可以修改`docker-compose.yml`中的端口映射：
```yaml
ports:
  - "3006:3000"  # 将前端改为3006端口
```

### 数据库连接问题
1. 检查PostgreSQL容器是否正常运行
2. 确认数据库迁移是否成功执行
3. 查看后端日志是否有连接错误

### 构建失败
1. 清理Docker缓存：`docker system prune -a`
2. 重新构建：`docker-compose build --no-cache`
3. 检查网络连接和依赖下载

## 📞 支持

如遇问题，请检查：
1. Docker 和 Docker Compose 是否正确安装
2. 系统资源是否充足（至少4GB RAM）
3. 网络连接是否正常
4. 端口是否被其他程序占用

---

🎓 **iOffer - 让留学申请更智能！**
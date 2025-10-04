# iOffer 部署指南

## 🛠️ 修复的问题

### 前端配置修复
1. **Tailwind CSS 版本**：从 v4 (Beta) 降级到稳定的 v3.4.0
2. **PostCSS 配置**：修复了 `@tailwindcss/postcss` 插件配置
3. **CSS 导入**：统一使用标准的 `@tailwind` 指令
4. **构建配置**：移除了不稳定的 turbopack，使用标准构建
5. **Docker 配置**：分离开发和生产环境的 Dockerfile

### 文件修改列表
- ✅ `frontend/package.json` - 更新依赖版本
- ✅ `frontend/postcss.config.mjs` - 修复 PostCSS 插件
- ✅ `frontend/next.config.ts` - 添加稳定配置
- ✅ `frontend/src/app/globals.css` - 标准化 CSS 导入
- ✅ `frontend/Dockerfile` - 开发环境配置
- ✅ `frontend/Dockerfile.prod` - 生产环境配置（新建）
- ✅ `docker-compose.prod.yml` - 更新前端构建配置

## 🚀 部署方式

### 本地开发环境
```bash
# 使用开发配置（热重载）
docker-compose up --build

# 或单独启动前端开发模式
cd frontend && npm install && npm run dev
```

### 生产环境部署
```bash
# 使用生产配置（优化构建）
docker-compose -f docker-compose.prod.yml up --build -d
```

### AWS EC2 部署
```bash
# 使用部署脚本
./deploy-aws.sh

# 或手动部署
scp -r . ubuntu@your-ec2-instance:/path/to/app
ssh ubuntu@your-ec2-instance
cd /path/to/app
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔧 服务配置

### 端口映射
- **前端**: 3005 → 3000
- **后端**: 8001 → 8001
- **AI服务**: 5555 → 8000
- **PostgreSQL**: 5432 → 5432
- **MongoDB**: 27017 → 27017

### 环境变量
确保以下环境变量已配置：
```bash
# 数据库
POSTGRES_DB=ioffer_db
POSTGRES_USER=ioffer_user
POSTGRES_PASSWORD=your_password

# API Keys
GEMINI_API_KEY=your_key
OPENAI_API_KEY=your_key
PERPLEXITY_API_KEY=your_key
JWT_SECRET=your_secret

# 前端配置
NEXT_PUBLIC_API_URL=http://your-domain:8001
```

## 🏗️ 架构说明

### 开发环境 (Dockerfile)
- 使用 `npm install` 安装所有依赖
- 启动 `npm run dev` 开发服务器
- 支持热重载和开发工具

### 生产环境 (Dockerfile.prod)
- 多阶段构建优化镜像大小
- 使用 `npm ci` 只安装生产依赖
- 预构建静态资源
- 启用 standalone 输出模式

## 🐛 故障排除

### 前端编译错误
如果遇到 CSS 相关错误：
```bash
# 清理缓存并重新安装
rm -rf frontend/.next frontend/node_modules
cd frontend && npm install
```

### 容器启动失败
```bash
# 查看服务日志
docker-compose logs frontend
docker-compose logs backend

# 重新构建特定服务
docker-compose build --no-cache frontend
```

### 网络连接问题
确保防火墙和安全组开放以下端口：
- 22 (SSH)
- 3005 (前端)
- 8001 (后端)
- 5555 (AI服务)

## ✅ 验证部署

运行测试脚本验证配置：
```bash
./test-local.sh
```

访问服务：
- 前端应用: http://localhost:3005 或 http://your-domain:3005
- 后端API: http://localhost:8001 或 http://your-domain:8001
- API健康检查: http://localhost:8001/health

## 📝 更新记录

- 2024-10-04: 修复 Tailwind CSS v4 兼容性问题
- 2024-10-04: 添加生产环境 Dockerfile
- 2024-10-04: 统一开发和生产部署配置
# 端口配置说明

## 当前配置状态

### 开发环境 (npm run dev)
- **后端端口**: 8000
- **前端API配置**: `http://localhost:8000`
- **环境文件**: `.env.local`

### Docker环境 (docker-compose up)
- **后端端口**: 8001 (映射到容器内8001)
- **前端API配置**: `http://localhost:8001`
- **环境文件**: `.env.production` 或 docker-compose.yml 环境变量

## 为什么有两个不同的端口？

1. **开发环境 (8000)**:
   - 直接运行 `npm run dev`
   - 快速开发和调试
   - 使用 `.env` 中的 `BACKEND_PORT=8000`

2. **Docker环境 (8001)**:
   - 使用 `docker-compose up`
   - 生产环境模拟
   - 避免与开发环境端口冲突
   - 可以同时运行开发环境和Docker环境

## 配置文件说明

### 后端配置
- `backend/.env`: `BACKEND_PORT=8000` (开发环境)
- `backend/Dockerfile`: `ENV PORT=8001` (Docker环境)
- `docker-compose.yml`: `"8001:8001"` (Docker端口映射)

### 前端配置
- `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8000` (开发环境)
- `frontend/.env.production`: `NEXT_PUBLIC_API_URL=http://localhost:8001` (Docker环境)
- `docker-compose.yml`: 自动设置环境变量

## 使用指南

### 开发环境
```bash
# 后端
cd backend && npm run dev  # 运行在 8000 端口

# 前端
cd frontend && npm run dev  # 自动连接到 8000 端口
```

### Docker环境
```bash
# 启动所有服务
docker-compose up  # 后端运行在 8001 端口，前端自动连接
```

### 端口检查
```bash
# 检查端口使用情况
lsof -i :8000  # 开发环境后端
lsof -i :8001  # Docker环境后端
lsof -i :3000  # 前端
```

## 故障排除

如果遇到"Failed to fetch"错误：

1. **检查后端是否运行**:
   ```bash
   curl http://localhost:8000/health  # 开发环境
   curl http://localhost:8001/health  # Docker环境
   ```

2. **检查前端环境变量**:
   ```bash
   # 开发环境应该显示 8000
   echo $NEXT_PUBLIC_API_URL

   # 或检查浏览器控制台的API请求URL
   ```

3. **重启前端服务**:
   ```bash
   # 开发环境
   cd frontend && npm run dev

   # Docker环境
   docker-compose restart frontend
   ```
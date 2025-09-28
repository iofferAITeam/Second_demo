# College Recommendation System

一个基于 AI 的大学申请推荐系统，帮助学生找到最适合的大学和专业，并提供完整的申请流程管理。

## 🎯 当前工作版本 - 完整调用流程

**系统状态**: ✅ 完全正常运行，前端成功显示AI推荐结果

### 核心特性
- **6-Agent Multi-Agent工作流** - 绕过AutoGen框架，直接使用Gemini API
- **XGBoost ML模型** - 基于用户档案的个性化学校预测
- **智能关键词路由** - 自动将请求路由到合适的AI系统
- **JWT双令牌认证** - 安全的用户管理系统
- **实时聊天界面** - React/Next.js前端 + FastAPI后端

## 🚀 快速启动 (正确版本)

### 前置要求
- Python 3.8+
- Node.js 16+
- PostgreSQL
- MongoDB

### 1. 启动后端服务

```bash
# 进入项目目录
cd /Users/ella/Desktop/Ioffer/code/college-recommendation

# 启动AI服务 (端口 8001)
cd ai-service
uv run python api_server.py

# 新开终端，启动后端API (端口 8000)
cd backend
npm run dev
```

### 2. 启动前端

```bash
# 新开终端
cd frontend
npm run dev
# 前端运行在 http://localhost:3000
```

### 3. 数据库检查

```bash
# 检查PostgreSQL连接
PGPASSWORD=ioffer_password psql -h localhost -U ioffer_user -d ioffer_db

# 查看用户档案数据
PGPASSWORD=ioffer_password psql -h localhost -U ioffer_user -d ioffer_db -c "SELECT userId, gpa, major, toefl, goals FROM user_profiles ORDER BY updatedAt DESC LIMIT 5;"
```

## 🔄 完整正确调用流程

### 1. 用户输入处理
```
用户输入: "帮我推荐一下学校"
         ↓
前端 (React) → POST /chat/message
         ↓
后端API (端口 8000) → 转发到AI服务
         ↓
AI服务 (端口 8001) → 关键词分析
```

### 2. 智能路由系统
```python
# 在 api_server.py 中 - 关键词检测
school_keywords = [
    # 中文关键词 - 更灵活的匹配
    "推荐", "学校", "大学", "推荐大学", "推荐学校",
    "学校推荐", "大学推荐", "哪些大学", "哪些学校",
    "推荐一下", "推荐一些", "帮我推荐"
    # ... 更多关键词
]

# 路由决策逻辑
if any(keyword in user_message for keyword in school_keywords):
    team_type = "SCHOOL_REC"  # → Multi-Agent工作流
else:
    team_type = "GENERAL_QA"  # → 通用AI对话
```

### 3. Multi-Agent工作流 (SCHOOL_REC路由)
```
SCHOOL_REC检测
         ↓
Multi-Agent工作流初始化
         ↓
6个Agent顺序处理:
  1. Profile Agent → 加载用户数据
  2. Research Agent → 分析需求
  3. ML Agent → XGBoost预测
  4. Program Agent → 专业匹配
  5. Analysis Agent → 详细分析
  6. Final Agent → 推荐综合
         ↓
返回完整推荐结果
```

### 4. 响应流程
```
Multi-Agent结果
         ↓
AI服务响应格式:
{
  "message": "完整推荐内容...",
  "team_used": "SCHOOL_REC",
  "thinking_process": "Agent工作流程...",
  "confidence": 0.95,
  "source": "Multi-Agent + ML模型"
}
         ↓
后端API → 转发到前端
         ↓
前端 → 显示格式化结果
```

## 🧠 Multi-Agent工作流详情

### 工作流状态管理
```python
@dataclass
class WorkflowState:
    user_message: str
    user_id: str
    user_profile: Optional[Dict] = None
    ml_predictions: Optional[Any] = None
    application_details: Optional[Dict] = None
    degree_type: Optional[DegreeType] = None
    summary: str = ""
    research_result: str = ""
    final_recommendation: str = ""
    program_result: str = ""
    final_analysis: str = ""
```

### Agent执行顺序
1. **Profile Agent** (`run_profile_agent`)
   - 从PostgreSQL加载用户档案
   - 提取GPA, TOEFL, 专业, 目标
   - 确定学位类型 (Bachelor/Master/PhD)

2. **Research Agent** (`run_research_agent`)
   - 分析用户需求和目标
   - 研究相关学术领域
   - 为学校匹配提供背景

3. **ML Prediction Agent** (`run_ml_agent`)
   - 调用XGBoost模型和用户数据
   - 生成个性化学校预测
   - 返回REACH/TARGET/SAFETY分类

4. **Program Agent** (`run_program_agent`)
   - 匹配具体专业到用户档案
   - 考虑专业兼容性和要求
   - 提供专业特定推荐

5. **Analysis Agent** (`run_analysis_agent`)
   - 执行匹配的详细分析
   - 考虑录取机会和匹配度
   - 提供策略见解

6. **Final Agent** (`run_final_agent`)
   - 综合所有Agent输出
   - 创建全面推荐
   - 格式化最终用户响应

## 🔧 配置信息

### 环境变量

**前端 (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=College Recommendation System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**后端:**
```env
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
DATABASE_URL=postgresql://ioffer_user:ioffer_password@localhost/ioffer_db
```

### 数据库配置
```python
# PostgreSQL连接
PGPASSWORD=ioffer_password
psql -h localhost -U ioffer_user -d ioffer_db

# 必需表
- user_profiles (userId, gpa, major, toefl, goals, ...)
- users (认证数据)
- chat_sessions (会话管理)
- chat_messages (消息历史)
```

## 🗂️ 当前文件结构

```
college-recommendation/
├── ai-service/
│   ├── api_server.py                    # 主AI服务 (端口 8001)
│   ├── src/workflows/
│   │   └── multi_agent_workflow.py     # 6-Agent工作流实现
│   └── src/models/
│       └── ml_predictor.py             # XGBoost ML模型集成
├── backend/
│   ├── server.js                       # 后端API (端口 8000)
│   └── routes/
│       └── auth.js                     # JWT认证路由
├── frontend/
│   ├── src/lib/
│   │   ├── api.ts                      # API客户端
│   │   └── auth.ts                     # 认证工具
│   ├── src/components/chat/
│   │   ├── ChatInterface.tsx           # 主聊天组件
│   │   └── ChatMessages.tsx            # 消息显示
│   └── .env.local                      # 环境配置
└── README.md                           # 本文件
```

## 🚨 故障排除

### 常见问题

1. **"No response" 错误**
   - **原因**: 响应格式不匹配
   - **修复**: 确保前端读取 `response.message` 而非 `response.aiResponse.content`

2. **认证404错误**
   - **原因**: 缺少JWT端点
   - **修复**: 确保后端实现所有认证路由

3. **ML模型未调用**
   - **原因**: 错误路由 (GENERAL_QA 而非 SCHOOL_REC)
   - **修复**: 检查关键词匹配包含单独词语如 "推荐", "学校"

4. **端口连接问题**
   - **原因**: 前端尝试错误端口
   - **修复**: 确保 NEXT_PUBLIC_API_URL=http://localhost:8000

### 调试命令

```bash
# 检查运行服务
lsof -i :3000  # 前端
lsof -i :8000  # 后端API
lsof -i :8001  # AI服务

# 查看日志
tail -f ai-service/logs/api_server.log
tail -f backend/logs/app.log

# 测试API端点
curl -X POST http://localhost:8000/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "帮我推荐一下学校"}'
```

## 📊 系统性能

### 响应时间
- 关键词路由: ~10ms
- Multi-Agent工作流: ~5-15秒
- ML模型预测: ~1-3秒
- 数据库查询: ~50-200ms

### 成功指标
- ✅ 关键词路由准确率: 95%+
- ✅ ML模型集成: 正常工作
- ✅ 认证系统: 稳定
- ✅ 前端-后端通信: 稳定
- ✅ Multi-agent工作流: 完整6-agent处理

## 🔄 开发工作流

### 进行更改

1. **更新工作流逻辑**
   ```bash
   # 编辑multi-agent工作流
   vim ai-service/src/workflows/multi_agent_workflow.py

   # 重启AI服务
   cd ai-service && uv run python api_server.py
   ```

2. **更新前端**
   ```bash
   # 编辑前端组件
   vim frontend/src/components/chat/ChatInterface.tsx

   # 重启前端
   cd frontend && npm run dev
   ```

3. **更新后端API**
   ```bash
   # 编辑后端路由
   vim backend/server.js

   # 重启后端
   cd backend && npm run dev
   ```

### 测试流程

```bash
# 1. 启动所有服务
./start_all_services.sh

# 2. 测试认证
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'

# 3. 测试学校推荐
curl -X POST http://localhost:8000/chat/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "帮我推荐一下学校"}'

# 4. 验证ML模型被调用 (检查日志)
grep "XGBoost" ai-service/logs/api_server.log
```

## 📈 成功确认

系统确认工作当:
- ✅ 前端显示AI响应 (非 "No response")
- ✅ 学校推荐请求触发SCHOOL_REC路由
- ✅ Multi-Agent工作流执行所有6个agents
- ✅ XGBoost ML模型被调用进行预测
- ✅ 认证系统无404错误工作
- ✅ 日志显示: "Successfully found user profile" 和 "Created new native Gemini client"

## 💡 关键架构决策

1. **绕过AutoGen框架** - 直接Gemini API调用避免工具调用兼容性问题
2. **双令牌JWT系统** - 带自动令牌刷新的安全认证
3. **智能关键词路由** - 灵活匹配确保正确ML模型集成
4. **Dataclass状态管理** - 防止agent调用间数据丢失
5. **端口分离** - AI服务 (8001) + 后端API (8000) 关注点清晰分离

---

**状态**: ✅ 系统完全运行并测试
**最后更新**: 当前工作版本确认前端结果
**下一步**: 监控性能和用户反馈

---

## 项目架构 (原始设计文档)

### 技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Express.js + TypeScript + Prisma ORM
- **数据库**: PostgreSQL
- **容器化**: Docker & Docker Compose
- **认证**: JWT 双令牌机制（Access Token + Refresh Token）
- **包管理**: npm workspaces (Monorepo)

### 项目结构
```
college-recommendation/
├── frontend/                    # Next.js 前端应用
│   ├── src/
│   │   ├── app/                # App Router 页面
│   │   │   ├── home/           # 首页
│   │   │   ├── chat/           # AI 对话页面
│   │   │   ├── auth/           # 认证相关页面
│   │   │   └── layout.tsx      # 全局布局
│   │   ├── components/         # React 组件
│   │   │   ├── shared/         # 共享组件 (Navbar, Footer)
│   │   │   ├── home/           # 首页组件
│   │   │   ├── chat/           # 对话组件
│   │   │   └── auth/           # 认证组件
│   │   └── services/           # API 服务层
│   ├── public/                 # 静态资源
│   └── package.json            # 前端依赖
├── backend/                    # Express.js 后端 API
│   ├── src/
│   │   ├── routes/             # API 路由
│   │   ├── services/           # 业务逻辑
│   │   ├── database/           # 数据库操作
│   │   ├── middleware/         # 中间件
│   │   ├── utils/              # 工具函数
│   │   ├── app.ts             # Express 应用配置
│   │   └── server.ts          # 服务器启动文件
│   ├── prisma/                # 数据库 Schema
│   │   └── schema.prisma      # Prisma 数据模型
│   └── package.json           # 后端依赖
├── docker-compose.yml         # PostgreSQL 容器配置
└── package.json              # 工作区配置
```

## 数据库设计

### 核心数据模型

#### 用户系统
- **User**: 用户基本信息（邮箱、密码、个人设置）
- **UserProfile**: 用户详细档案（学术背景、标准化考试成绩、经历）

#### 学校和专业
- **School**: 学校信息（名称、排名、地理位置）
- **Program**: 专业信息（学位类型、学费、入学要求）

#### 申请管理
- **Application**: 申请记录（状态追踪、截止日期、申请结果）
- **Essay**: 申请文书（个人陈述、推荐信、补充文书）

### 数据关系
```
User (1:1) UserProfile
User (1:n) Application
User (1:n) Essay
School (1:n) Program
School (1:n) Application
Program (1:n) Application
Application (1:n) Essay
```

## 认证系统设计

### JWT 双令牌机制

#### Access Token（访问令牌）
- **生命周期**: 15 分钟
- **用途**: API 访问授权
- **存储**: 内存中（不持久化）
- **包含信息**: 用户 ID、邮箱、权限

#### Refresh Token（刷新令牌）
- **生命周期**: 7 天
- **用途**: 刷新 Access Token
- **存储**: 数据库 + HttpOnly Cookie
- **安全特性**: 自动轮换（每次使用后更新）

### 认证流程

#### 1. 用户注册
```
用户填写注册信息 → 后端验证邮箱唯一性 → 密码加密存储 → 创建用户记录 → 返回注册成功
```

#### 2. 用户登录
```
用户输入邮箱密码 → 后端验证凭据 → 生成 Access Token (15min) → 生成 Refresh Token (7天) →
Refresh Token 存储到数据库 → 返回 Access Token → 设置 HttpOnly Cookie (Refresh Token)
```

#### 3. API 访问
```
前端发送请求携带 Access Token → 后端验证令牌有效性 →
如果有效：返回数据
如果过期：自动调用刷新接口 → 使用 Refresh Token 获取新 Access Token → 重试原请求
```

#### 4. 令牌刷新
```
前端检测 Access Token 即将过期 → 发送刷新请求携带 Refresh Token (Cookie) →
后端验证 Refresh Token → 生成新的 Access Token → 轮换 Refresh Token →
返回新令牌 → 更新前端存储
```

#### 5. 登出
```
用户点击登出 → 清除前端 Access Token → 发送登出请求 →
后端删除数据库中的 Refresh Token → 清除 Cookie → 重定向到登录页
```

## 业务流程

### 核心功能流程

#### 1. 用户档案建立
```
注册登录 → 填写基本信息 → 上传学术背景 → 添加考试成绩 →
输入个人经历 → 设置申请目标 → 保存用户档案
```

#### 2. 学校推荐
```
AI 分析用户档案 → 匹配学校数据库 → 计算匹配度 →
生成推荐列表 → 显示学校详情 → 用户收藏感兴趣的学校
```

#### 3. 申请管理
```
选择目标学校 → 创建申请记录 → 设置申请截止日期 →
上传申请材料 → 追踪申请状态 → 记录申请结果
```

#### 4. 文书写作辅助
```
选择文书类型 → 输入题目要求 → AI 生成文书大纲 →
用户编辑完善内容 → 多版本管理 → 关联到具体申请
```

#### 5. 进度追踪
```
查看申请列表 → 检查材料完成度 → 提醒重要截止日期 →
更新申请状态 → 统计申请结果 → 生成申请报告
```

## 开发环境设置

### 前置要求
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose（可选）

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd college-recommendation
```

2. **安装依赖**
```bash
npm install
```

3. **启动数据库**
```bash
# 使用 Docker（推荐）
docker-compose up -d

# 或使用本地 PostgreSQL
brew install postgresql
brew services start postgresql
```

4. **环境变量配置**

后端 `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/college_rec_db"
JWT_ACCESS_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"
PORT=8002
NODE_ENV=development
```

前端 `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8002
NEXT_PUBLIC_APP_NAME=College Recommendation System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

5. **数据库初始化**
```bash
cd backend
npx prisma generate
npx prisma db push
```

6. **启动开发服务器**
```bash
# 后端（端口 8002）
cd backend && npm run dev

# 前端（端口 3000）
cd frontend && npm run dev
```

### 访问地址
- 前端应用: http://localhost:3000
- 后端 API: http://localhost:8002
- API 文档: http://localhost:8002/api-docs

## API 接口

### 认证相关
```
POST /api/auth/register           # 用户注册
POST /api/auth/login              # 用户登录
GET  /api/auth/verify             # 验证令牌
POST /api/auth/refresh            # 刷新令牌
POST /api/auth/logout             # 用户登出
POST /api/auth/send-verification  # 发送验证邮件
POST /api/auth/verify-email       # 验证邮箱
POST /api/auth/forgot-password    # 忘记密码
POST /api/auth/reset-password     # 重置密码
```

### 用户档案
```
GET    /api/profile         # 获取用户档案
PUT    /api/profile         # 更新用户档案
POST   /api/profile/avatar  # 上传头像
```

### 学校和专业
```
GET    /api/schools         # 获取学校列表
GET    /api/schools/:id     # 获取学校详情
GET    /api/programs        # 获取专业列表
GET    /api/programs/:id    # 获取专业详情
```

### 申请管理
```
GET    /api/applications    # 获取申请列表
POST   /api/applications    # 创建新申请
PUT    /api/applications/:id # 更新申请
DELETE /api/applications/:id # 删除申请
```

### 文书管理
```
GET    /api/essays          # 获取文书列表
POST   /api/essays          # 创建新文书
PUT    /api/essays/:id      # 更新文书
DELETE /api/essays/:id      # 删除文书
```

## 部署说明

### 生产环境部署

1. **构建应用**
```bash
# 前端构建
cd frontend && npm run build

# 后端构建
cd backend && npm run build
```

2. **环境变量**
- 更新数据库连接字符串
- 配置生产环境域名
- 设置安全的 JWT 密钥

3. **数据库迁移**
```bash
npx prisma migrate deploy
```

### Docker 部署
```bash
# 构建镜像
docker build -t college-rec-frontend ./frontend
docker build -t college-rec-backend ./backend

# 使用 docker-compose 部署
docker-compose -f docker-compose.prod.yml up -d
```

## 开发规范

### 代码规范
- TypeScript 严格模式
- ESLint + Prettier 代码格式化
- 组件和函数使用 TypeScript 类型定义
- API 响应统一格式

### Git 工作流
```bash
# 功能开发
git checkout -b feature/功能名称
git commit -m "feat: 添加功能描述"

# 修复问题
git checkout -b fix/问题描述
git commit -m "fix: 修复问题描述"
```


---

## 注册登录脚本调用流程

### 脚本和方法名完整调用链

#### 1. 用户注册流程
```typescript
用户操作 → 表单提交
↓
📁 frontend/src/app/auth/register/page.tsx → handleSubmit()           // 注册页面表单提交处理
↓
📁 frontend/src/state/auth-service.ts → authService.signUp()          // 认证服务处理注册逻辑
↓
📁 frontend/src/utils/api-client.ts → apiClient.register()            // API客户端发送注册请求
↓
HTTP POST /api/auth/register                                          // HTTP请求到后端
↓
📁 backend/src/routes/index.ts → router.use('/auth', authRoutes)      // 主路由分发到认证路由
↓
📁 backend/src/routes/auth.ts → router.post('/register', AuthController.register) // 注册路由映射到控制器
↓
📁 backend/src/controllers/AuthController.ts → AuthController.register() // 控制器处理注册请求
↓
📁 backend/src/services/AuthService.ts → authService.register()       // 业务逻辑层处理注册
↓
📁 backend/src/database/auth-database.ts → AuthDatabaseService.createUser() // 数据库层创建用户记录
↓
返回响应 → 前端更新状态 → 跳转主页                                      // 完成注册流程
```

#### 2. 用户登录流程
```typescript
用户操作 → 表单提交
↓
📁 frontend/src/app/auth/login/page.tsx → handleSubmit()             // 登录页面表单提交处理
↓
📁 frontend/src/state/auth-service.ts → authService.signIn()         // 认证服务处理登录逻辑
↓
📁 frontend/src/utils/api-client.ts → apiClient.login()              // API客户端发送登录请求
↓
HTTP POST /api/auth/login                                            // HTTP请求到后端
↓
📁 backend/src/routes/auth.ts → router.post('/login', AuthController.login) // 登录路由映射到控制器
↓
📁 backend/src/controllers/AuthController.ts → AuthController.login() // 控制器处理登录请求
↓
📁 backend/src/services/AuthService.ts → authService.login()         // 业务逻辑层验证用户凭据
↓
📁 backend/src/database/auth-database.ts → AuthDatabaseService.validateUser() // 数据库层验证用户密码
↓
返回双令牌 → 前端保存状态 → 跳转主页                                   // 完成登录并保存令牌
```

#### 3. Token 自动刷新流程
```typescript
API 请求拦截                                                         // 每个API请求前的自动检查
↓
📁 frontend/src/utils/api-client.ts → isTokenExpiringSoon()          // 检查AccessToken是否即将过期(5分钟内)
↓
📁 frontend/src/utils/api-client.ts → refreshToken()                 // 自动触发令牌刷新机制
↓
HTTP POST /api/auth/refresh (Cookie携带RefreshToken)                // 发送刷新请求，Cookie自动携带RefreshToken
↓
📁 backend/src/controllers/AuthController.ts → AuthController.refresh() // 控制器处理刷新请求
↓
📁 backend/src/services/AuthService.ts → authService.refreshTokens() // 业务逻辑层生成新令牌对
↓
📁 backend/src/database/auth-database.ts → AuthDatabaseService.updateRefreshToken() // 数据库更新RefreshToken记录
↓
返回新双令牌 → 更新前端存储 → 重试原请求                                // 无感知更新令牌并继续原请求
```

#### 4. 用户登出流程
```typescript
用户点击登出按钮                                                     // 用户主动触发登出操作
↓
📁 frontend/src/components/Navbar.tsx → handleLogout()               // 导航栏登出按钮点击处理
↓
📁 frontend/src/state/auth-service.ts → authService.signOut()        // 认证服务处理登出逻辑
↓
📁 frontend/src/utils/api-client.ts → apiClient.logout()             // API客户端发送登出请求
↓
HTTP POST /api/auth/logout                                           // HTTP请求到后端
↓
📁 backend/src/controllers/AuthController.ts → AuthController.logout() // 控制器处理登出请求
↓
📁 backend/src/database/auth-database.ts → AuthDatabaseService.removeRefreshToken() // 数据库删除RefreshToken记录
↓
清除前端状态 → 跳转登录页                                              // 清除所有认证状态并跳转
```

### 核心脚本文件和关键方法

#### 前端核心文件
- **认证状态管理**: `frontend/src/state/auth-service.ts`
  - `authService.signUp()` - 用户注册
  - `authService.signIn()` - 用户登录
  - `authService.signOut()` - 用户登出
  - `authService.refreshToken()` - 刷新令牌

- **API 客户端**: `frontend/src/utils/api-client.ts`
  - `apiClient.register()` - 注册请求
  - `apiClient.login()` - 登录请求
  - `apiClient.logout()` - 登出请求
  - `apiClient.refreshToken()` - 刷新请求

#### 后端核心文件
- **路由定义**: `backend/src/routes/auth.ts`
  - `POST /register` → `AuthController.register`
  - `POST /login` → `AuthController.login`
  - `POST /refresh` → `AuthController.refresh`
  - `POST /logout` → `AuthController.logout`

- **控制器**: `backend/src/controllers/AuthController.ts`
  - `AuthController.register()` - 处理注册
  - `AuthController.login()` - 处理登录
  - `AuthController.refresh()` - 处理刷新
  - `AuthController.logout()` - 处理登出

- **数据库操作**: `backend/src/database/auth-database.ts`
  - `AuthDatabaseService.createUser()` - 创建用户
  - `AuthDatabaseService.validateUser()` - 验证用户
  - `AuthDatabaseService.updateRefreshToken()` - 更新刷新令牌
  - `AuthDatabaseService.removeRefreshToken()` - 删除刷新令牌

### 后端路由架构

```typescript
// 主路由文件：backend/src/routes/index.ts
router.use('/auth', authRoutes)           // 认证相关 /api/auth/*
router.use('/user', userRoutes)           // 用户信息 /api/user/*
router.use('/chat', chatRoutes)           // AI对话 /api/chat/*
router.use('/recommendations', recRoutes) // 推荐系统 /api/recommendations/*

// 认证路由：backend/src/routes/auth.ts
POST /register           → AuthController.register
POST /login              → AuthController.login
GET  /verify             → AuthController.verify
POST /refresh            → AuthController.refresh
POST /logout             → AuthController.logout
POST /send-verification  → AuthController.sendVerification
POST /verify-email       → AuthController.verifyEmail
POST /forgot-password    → AuthController.forgotPassword
POST /reset-password     → AuthController.resetPassword
```

### 中间件和安全机制

```typescript
// 1. 认证中间件
backend/src/middleware/auth.ts
- 验证 Access Token
- 解析用户信息
- 请求上下文注入用户数据

// 2. 路由保护
// 需要认证的路由自动应用认证中间件
router.use('/user', authenticateToken, userRoutes)

// 3. 错误处理中间件
- 统一错误响应格式
- 日志记录
- 生产环境敏感信息过滤

// 4. CORS 和安全头
- 跨域请求配置
- Content-Security-Policy
- XSS 保护
- Rate Limiting
```
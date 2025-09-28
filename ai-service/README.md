# iOffer AI - 智能留学申请助手

一个基于多Agent架构的智能留学申请助手，提供个性化的学校推荐、申请咨询和问答服务。

## 🚀 功能特性

### 核心功能
- **智能学校推荐**: 基于学生档案和真实ML模型的个性化大学推荐，包含完整的5步分析流程
- **通用问答**: 支持留学相关问题的智能问答，结合RAG和实时网络搜索
- **学生信息管理**: 完整的学生档案管理系统，支持MongoDB持久化存储
- **实时WebSocket通信**: 支持实时状态更新和进度追踪，无阻塞用户体验

### 技术架构
- **多Agent系统**: 基于Autogen的多智能体协作，确保专业化任务分工
- **真实机器学习预测**: XGBoost模型进行录取概率预测，**无fallback机制，确保数据真实性**
- **混合检索增强**: 结合本地RAG和Perplexity API的实时问答系统
- **MongoDB存储**: 学生档案和会话数据持久化，支持多用户档案管理
- **进程隔离**: ML预测采用subprocess隔离，防止C++级别崩溃影响主服务

## 📋 系统要求

- Python 3.12+
- MongoDB 4.0+
- UV包管理器
- 必需的API密钥：
  - Google Gemini API
  - Perplexity API

## 🛠️ 安装和启动

### 1. 环境准备
   ```bash
# 克隆项目
git clone <repository-url>
   cd ioffer-ai

# 安装依赖
uv sync

# 设置RAG数据 (重要: 首次运行必须执行)
chmod +x run_rag_setup.sh
./run_rag_setup.sh

# 启动MongoDB（如果未运行）
mongod --dbpath /your/mongodb/path
```

### 2. 配置环境变量
创建 `.env` 文件并设置以下变量：
   ```bash
GEMINI_API_KEY=your_gemini_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
MONGODB_URL=mongodb://127.0.0.1:27017
```
需要基于.env.example新建.env文件，在上传时千万不要上传包含api key的.env 文件

### 3. 启动服务
   ```bash
# 启动API服务器
uv run uvicorn api_server:app --host 127.0.0.1 --port 8010

# 或在后台运行
uv run uvicorn api_server:app --host 127.0.0.1 --port 8010 &
```

### 4. 测试连接
```bash
# 检查服务状态
curl http://127.0.0.1:8010/health

# 检查用户档案
curl http://127.0.0.1:8010/profile/hanyuliu
```

## 🧪 测试和使用

### 手动测试界面
1. 打开 `manual_test.html` 文件
2. 选择用户档案：
   - `hanyu_liu_003`: 测试用户
   - `hanyuliu`: 完整档案用户
3. 点击"连接"建立WebSocket连接
4. 使用快速测试按钮或输入自定义消息

### 完整工作流测试
```bash
# 确保MongoDB运行 (Student Info团队需要)
brew services start mongodb/brew/mongodb-community

# 运行完整聊天工作流
PYTHONPATH=. python src/workflows/chat_workflow.py
```

### 用户控制命令
- **`new topic`** - 强制切换到orchestrator进行团队路由
- **`continue`** - 继续当前团队 (如果适用)
- **`change topic`** - 切换到不同的团队/话题
- **自然提问** - 自动路由到合适的团队

### API测试
```bash
# WebSocket连接测试
python test_basic_ws.py

# 学校推荐测试
python test_school_rec_detailed.py

# 综合API测试
python test_api_comprehensive.py
```

## 📊 系统组件

### Agent团队架构
1. **GENERAL_QA**: 通用问答团队
   - Hybrid QA Agent (结合Perplexity和RAG)
   - 支持实时网络搜索和本地知识检索
   - 平均响应时间: 30-60秒

2. **SCHOOL_RECOMMENDATION**: 学校推荐团队 **(核心功能)**
   - **Summary Agent**: 深度分析学生档案，提取关键申请要素
   - **Graduate School Research Agent**: 调用真实XGBoost ML模型进行学校匹配
   - **Final Recommendation Agent**: 从ML结果中选择最佳10所学校，进行Reach/Target/Safety分类
   - **Program Recommendation Agent**: 匹配具体项目要求和申请条件
   - **Final School Analysis Agent**: 生成详细的录取概率评估和申请策略
   - 完整流程时间: 5-10分钟 (包含真实模型计算)

3. **STUDENT_INFO**: 学生信息管理团队
   - 档案创建、更新和管理
   - 支持多用户档案切换

### 学校推荐核心逻辑 (无Fallback机制)
```
学生档案 → ML特征提取 → XGBoost模型预测 → 25所候选学校
    ↓
择优选择10所 → Reach/Target/Safety分类 → 详细录取分析
    ↓
最终推荐报告 (包含录取概率、申请策略、项目匹配度)
```

**重要**: 系统**不使用任何虚假或模拟数据**，所有推荐均基于真实ML模型计算结果。

### 数据流程
```
用户输入 → 路由Agent → 选择团队 → 执行工具 → 返回结果
         ↓
    WebSocket实时状态更新 (5步进度追踪)
```

## 🔧 ML模型和预测

### 预测模型
- **模型**: XGBoost分类器
- **特征**: 学术背景、标准化考试、语言能力、实习经历等
- **输出**: 录取概率和匹配学校列表

### 预测流程
1. 加载学生档案信息
2. 特征工程和数据预处理
3. 模型预测（subprocess隔离防止C++崩溃）
4. 结果过滤和排序

## 📝 当前状态和功能完成度

### ✅ 已完成并验证的功能
- [x] **完整WebSocket API实现** - 支持实时双向通信
- [x] **多用户档案管理** - 支持hanyuliu和hanyu_liu_003等用户切换
- [x] **General QA工作流** - 完整的问答系统，结合RAG和Perplexity
- [x] **真实ML模型预测集成** - XGBoost模型无fallback机制，确保数据真实性
- [x] **5步学校推荐工作流** - 完整的多Agent协作流程
- [x] **实时状态更新系统** - 5步进度追踪，详细状态反馈
- [x] **WebSocket错误处理** - 优雅处理连接断开和超时
- [x] **进程隔离ML预测** - 防止C++崩溃影响主服务
- [x] **UI优化** - 支持长文本显示，滚动查看完整结果

### ⚡ 系统性能指标
- **General QA响应时间**: 30-60秒
- **学校推荐完整流程**: 5-10分钟 (真实模型计算)
- **WebSocket超时设置**: 10分钟 (适配复杂工作流)
- **ML模型预测准确性**: 基于训练数据的真实XGBoost分类器

### 🔄 系统架构验证点
- **API Server结构**: FastAPI + WebSocket + MongoDB，支持并发请求
- **Agent协作机制**: Autogen框架，确保任务正确传递和终止
- **数据流完整性**: 学生档案 → ML预测 → Agent分析 → 结构化输出
- **错误恢复能力**: API配额限制、网络中断、模型计算错误的处理

### 🎯 核心验证完成
1. **学校推荐逻辑验证**: ✅ 无虚假数据，完全基于真实ML模型
2. **多Agent终止机制**: ✅ 正确发送TERMINATE信号
3. **WebSocket稳定性**: ✅ 处理长时间连接和复杂工作流
4. **用户体验**: ✅ 实时进度更新，完整结果显示

## 🧪 新来者验证任务

### 📋 完整系统验证清单

如果您是第一次接触此项目，请按以下步骤验证系统完整性：

#### 1. API Server结构验证
```bash
# 启动服务器
uv run uvicorn api_server:app --host 127.0.0.1 --port 8010

# 验证基础端点
curl http://127.0.0.1:8010/health
curl http://127.0.0.1:8010/profile/hanyuliu
```

#### 1.5 RAG数据设置验证 (重要)
```bash
# 确保RAG数据已正确设置
ls -la data/rag_data/
ls -la data/rag_data/qa_pairs.json

# 如果RAG数据不存在，运行设置脚本
./run_rag_setup.sh

# 验证RAG组件加载
# 启动服务器后查看日志中是否包含: "✅ RAG components loaded: X QA pairs"
```

#### 2. 学校推荐逻辑验证 (optional)
```bash
# 运行完整学校推荐测试
python test_school_rec_detailed.py

# 验证关键点:
# ✅ 是否调用真实XGBoost模型 (查看日志中的 [pred] 标记)
# ✅ 是否生成25所候选学校后筛选到10所
# ✅ 是否包含Reach/Target/Safety分类
# ✅ 是否有详细的录取概率分析
# ✅ 绝对不能有任何fallback或虚假数据
```

#### 3. WebSocket工作流验证
```bash
# 打开测试界面
open manual_test.html

# 测试步骤:
# 1. 选择 hanyuliu 用户 (有完整档案)
# 2. 连接WebSocket
# 3. 点击 "School Recommendation Test"
# 4. 观察5步进度: 档案分析 → 学校生成 → 项目匹配 → 详细评估 → 最终报告
# 5. 验证最终结果包含完整的10所学校分析
```

#### 4. 核心验证点
- **无Fallback机制**: 系统必须使用真实ML模型，绝不能生成虚假推荐
- **完整Agent链**: 5个Agent必须正确传递任务并最终TERMINATE
- **数据真实性**: 所有推荐基于用户真实档案和模型计算
- **性能指标**: General QA < 1分钟，学校推荐 5-10分钟

## 🔍 调试和诊断

### 日志系统
- ML预测日志: 查找 `[pred]` 标记确认真实模型调用
- Agent执行日志: 查找 `---------- TextMessage` 追踪Agent对话
- WebSocket状态: 查找连接建立/断开/重连信息

### 关键调试命令
```bash
# 实时查看服务器日志
tail -f debug_output.log | grep -E "\[pred\]|TERMINATE|Agent"

# 验证ML模型文件
ls -la src/ml_models/xgboost_pipeline.joblib

# 检查用户档案
python -c "from src.utils.session_manager import init_session; init_session('hanyuliu')"

# 验证RAG数据
ls -la data/rag_data/
cat data/rag_data/qa_pairs.json | head -20
```

## 📞 支持和问题排查

### 常见问题
1. **学校推荐超时**: 正常现象，真实模型计算需要时间
2. **API配额限制**: Gemini API限制，等待或重试
3. **WebSocket断开**: 刷新页面重新连接即可
4. **RAG组件加载失败**: 确保已运行 `./run_rag_setup.sh` 脚本
5. **General QA无响应**: 检查RAG数据是否正确加载，查看日志中的RAG组件状态

### 报告问题时请包含
1. 具体的错误日志 (特别是 `[pred]` 相关)
2. 使用的用户档案 (hanyuliu vs hanyu_liu_003)
3. 复现步骤和预期行为

## 🔄 最新改进 (Latest Update)

### 🔧 修复无限循环问题
- ✅ 解决了hybrid QA团队无限滚动问题，使用function tools方法
- ✅ 正确的AutoGen终止处理，使用TERMINATE信号
- ✅ 修复UserProxyAgent参数问题，防止连接断开

### 🎯 增强编排Agent
- ✅ 改进"continue"命令的上下文处理
- ✅ 添加显式路由逻辑，支持对话连续性
- ✅ 更好地理解之前的团队交互

### 🛠️ 复杂团队处理
- ✅ 为复杂团队(如Student Info)添加特殊处理，支持内部handoff机制
- ✅ 防止路由错误和无限失败尝试
- ✅ 优雅的错误恢复和重新路由

### 📈 准确的指标追踪
- ✅ 分别追踪总尝试次数 vs. 成功交互次数
- ✅ 更好的对话完成检测
- ✅ 改进的成功率报告

## 💬 示例工作流

```
用户: "Hello, I want to share my GPA and activities"
系统: → 路由到Student Info团队 ✅

用户: "continue" 
系统: → 继续Student Info团队 ✅ (通过orchestrator路由复杂团队)

用户: "new topic - what schools should I apply to?"
系统: → 路由到School Recommendations团队 ✅

用户: "How do I write essays?"
系统: → 路由到Hybrid QA团队 ✅
```

---

**最后更新**: 2025-01-15  
**版本**: 1.0.0-stable  
**状态**: 生产就绪 ✅  
**核心功能**: 完全验证 ✅  
**ML模型**: 无Fallback，真实数据 ✅  
**工作流**: 完整集成测试通过 ✅
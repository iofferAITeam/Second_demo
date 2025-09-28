# 🚀 iOffer AI - 开发团队集成指南

## 📋 **项目概述**

这是一个基于 Autogen 框架的 AI 智能问答系统，支持多种 AI 代理团队协作，提供学校推荐、通用问答等功能。

## 🏗️ **系统架构**

### **后端 (Python/FastAPI)**
- **主服务器**: `api_server.py` - FastAPI WebSocket 服务器
- **AI 代理**: `src/agents/` - 各种 AI 代理实现
- **团队协作**: `src/teams/` - 代理团队配置
- **数据模型**: `src/domain/` - 数据结构和模型
- **工具集成**: `src/tools/` - 外部工具和 API 集成

### **前端 (HTML/JavaScript)**
- **测试界面**: `manual_test.html` - 临时测试 UI
- **WebSocket 客户端**: 实时通信实现

## 🚀 **快速启动**

### **1. 环境准备**
```bash
# 安装 Python 3.11+
# 安装 uv 包管理器
pip install uv

# 克隆项目
git clone <repository-url>
cd ioffer-ai

# 安装依赖
uv sync
```

### **2. 启动后端服务**
```bash
# 启动 API 服务器
uv run uvicorn api_server:app --host 127.0.0.1 --port 8010

# 服务器将在 http://127.0.0.1:8010 启动
# WebSocket 端点: ws://127.0.0.1:8010/ws
```

### **3. 测试前端**
```bash
# 打开浏览器访问
open manual_test.html
```

### **4. 查看 API 文档**
```bash
# 在浏览器中打开以下地址查看自动生成的 API 文档
open http://127.0.0.1:8010/docs      # Swagger UI 文档
open http://127.0.0.1:8010/redoc     # ReDoc 文档
open http://127.0.0.1:8010/          # API 主页
```

## 🔌 **API 接口说明**

### **自动生成的 API 文档**
🚀 **重要**: 系统已自动生成完整的 API 文档网页，开发团队可以直接在浏览器中查看和测试！

- **📚 Swagger UI 文档**: `http://127.0.0.1:8010/docs`
  - 交互式 API 文档界面
  - 可以直接在网页上测试所有端点
  - 包含完整的请求/响应示例

- **📖 ReDoc 文档**: `http://127.0.0.1:8010/redoc`
  - 美观的文档阅读界面
  - 适合团队分享和阅读

- **🏠 API 主页**: `http://127.0.0.1:8010/`
  - 漂亮的 API 信息页面
  - 包含所有文档链接和端点说明

### **WebSocket 连接**
- **端点**: `ws://127.0.0.1:8010/ws`
- **协议**: WebSocket

### **消息格式**

#### **客户端发送消息**
```json
{
  "type": "message",
  "content": "用户问题内容",
  "user_id": "用户标识符"
}
```

#### **服务器响应消息**
```json
{
  "type": "result",
  "message": "AI 回答内容",
  "thinking_process": "AI 思考过程",
  "reference_links": ["参考链接1", "参考链接2"],
  "strategy": "使用的策略",
  "source": "信息来源",
  "rag_similarity": "RAG 相似度分数"
}
```

## 🎯 **核心功能模块**

### **1. 通用问答 (GENERAL_QA)**
- **用途**: 处理一般性问题
- **代理**: Hybrid QA 团队
- **输出**: 结构化回答 + 思考过程

### **2. 学校推荐 (SCHOOL_REC)**
- **用途**: 基于学生信息推荐学校
- **代理**: 学校推荐团队
- **输入**: 学生背景信息
- **输出**: 学校推荐列表 + 分析

### **3. 学生信息收集 (STUDENT_INFO)**
- **用途**: 收集和更新学生信息
- **代理**: 信息收集团队
- **功能**: 信息提取、验证、存储

## 🔧 **开发指南**

### **添加新的 AI 代理**
1. 在 `src/agents/` 创建代理文件
2. 在 `src/teams/` 配置团队
3. 在 `api_server.py` 添加路由逻辑

### **修改前端界面**
1. 编辑 `manual_test.html`
2. 更新 WebSocket 消息处理
3. 添加新的 UI 组件

### **扩展 API 功能**
1. 在 `api_server.py` 添加新的端点
2. 更新消息处理逻辑
3. 测试 WebSocket 通信

## 📊 **数据流**

```
用户输入 → WebSocket → API 服务器 → AI 代理团队 → 工具执行 → 结果整合 → 前端显示
```

## 🧪 **测试**

### **API 文档测试（推荐）**
🚀 **最佳实践**: 使用自动生成的 Swagger UI 文档进行 API 测试！

1. **启动服务器**: `uv run uvicorn api_server:app --host 127.0.0.1 --port 8010`
2. **打开 Swagger UI**: 访问 `http://127.0.0.1:8010/docs`
3. **测试端点**:
   - 选择要测试的端点（如 POST /chat）
   - 点击 "Try it out" 按钮
   - 填写请求参数
   - 点击 "Execute" 执行请求
   - 查看响应结果

### **WebSocket 测试**
1. 启动服务器
2. 打开 `manual_test.html`
3. 发送测试消息
4. 检查响应和日志

### **运行自动化测试**
```bash
# 运行所有测试
uv run python -m pytest test/

# 运行特定测试
uv run python test/test_api_comprehensive.py

# 使用 Python 测试客户端
python api_test_client.py

# 使用 JavaScript 测试客户端（在浏览器控制台中）
# 加载 api_test_client.js 后使用
```

## 📝 **日志和调试**

### **日志文件**
- 服务器日志输出到控制台
- 详细的消息流和错误信息

### **调试技巧**
1. 检查 WebSocket 连接状态
2. 查看服务器控制台输出
3. 使用浏览器开发者工具检查网络请求

## 🚨 **注意事项**

### **基础配置**
1. **端口冲突**: 确保 8010 端口未被占用
2. **依赖版本**: 使用 `uv.lock` 确保依赖版本一致
3. **环境变量**: 可能需要配置 API 密钥等环境变量
4. **数据库连接**: 确保 MongoDB 和 MySQL 服务运行正常

### **API 文档访问**
1. **确保服务器运行**: 必须先启动 API 服务器才能访问文档
2. **端口访问**: 确保 8010 端口可访问（本地或远程）
3. **浏览器兼容**: 推荐使用 Chrome、Firefox 或 Safari
4. **网络设置**: 如果在远程服务器上，需要配置相应的网络访问权限
5. **文档更新**: 修改代码后重启服务器，文档会自动更新

## 📞 **技术支持**

如有问题，请检查：
1. 服务器日志输出
2. 网络连接状态
3. 依赖安装完整性
4. 配置文件正确性

## 🎉 **下一步**

1. 集成到现有前端框架
2. 添加用户认证和会话管理
3. 实现数据持久化
4. 添加监控和性能优化
5. 部署到生产环境

---

**祝开发顺利！** 🚀

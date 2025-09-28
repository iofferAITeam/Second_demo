# 🔌 iOffer AI - API 接口文档

## 📋 **概述**

iOffer AI 系统提供基于 WebSocket 的实时通信 API，支持多种 AI 代理团队协作，实现智能问答、学校推荐、学生信息收集等功能。

## 🌐 **基础信息**

- **协议**: WebSocket
- **基础 URL**: `ws://127.0.0.1:8010`
- **端点**: `/ws`
- **认证**: 当前版本无需认证（生产环境建议添加）
- **编码**: UTF-8

## 🔗 **连接端点**

### **WebSocket 连接**
```
ws://127.0.0.1:8010/ws
```

### **连接参数**
- **host**: 服务器地址
- **port**: 端口号 (默认 8010)
- **path**: WebSocket 路径 (/ws)

## 📨 **消息格式**

### **客户端发送消息**

#### **基础消息结构**
```json
{
  "type": "message",
  "content": "用户问题内容",
  "user_id": "用户唯一标识符"
}
```

#### **字段说明**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | ✅ | 消息类型，固定为 "message" |
| `content` | string | ✅ | 用户输入的问题或请求 |
| `user_id` | string | ✅ | 用户唯一标识符，用于会话管理 |

#### **示例消息**
```json
{
  "type": "message",
  "content": "介绍一下哈佛大学",
  "user_id": "user_12345"
}
```

### **服务器响应消息**

#### **成功响应结构**
```json
{
  "type": "result",
  "message": "AI 回答内容",
  "thinking_process": "AI 思考过程",
  "reference_links": ["参考链接1", "参考链接2"],
  "strategy": "使用的策略",
  "source": "信息来源",
  "rag_similarity": 0.85,
  "team_used": "GENERAL_QA",
  "timestamp": "2025-08-24T23:30:00Z"
}
```

#### **字段说明**
| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | string | 响应类型，固定为 "result" |
| `message` | string | AI 的主要回答内容 |
| `thinking_process` | string | AI 的思考过程和推理逻辑 |
| `reference_links` | array | 参考链接列表 |
| `strategy` | string | 使用的策略（如 RAG、网络搜索等） |
| `source` | string | 信息来源 |
| `rag_similarity` | number | RAG 相似度分数 (0-1) |
| `team_used` | string | 使用的 AI 团队 |
| `timestamp` | string | 响应时间戳 |

#### **错误响应结构**
```json
{
  "type": "error",
  "error_code": "ERROR_CODE",
  "message": "错误描述信息",
  "details": "详细错误信息",
  "timestamp": "2025-08-24T23:30:00Z"
}
```

#### **错误代码说明**
| 错误代码 | 说明 | 解决方案 |
|----------|------|----------|
| `CONNECTION_FAILED` | 连接失败 | 检查网络和服务器状态 |
| `INVALID_MESSAGE` | 消息格式错误 | 检查 JSON 格式和必填字段 |
| `TEAM_NOT_FOUND` | AI 团队未找到 | 检查团队配置 |
| `PROCESSING_ERROR` | 处理过程中出错 | 查看服务器日志 |
| `TIMEOUT` | 请求超时 | 检查 AI 服务状态 |

## 🎯 **AI 团队说明**

### **1. GENERAL_QA (通用问答)**
- **用途**: 处理一般性问题
- **适用场景**: 知识问答、概念解释、信息查询
- **响应特点**: 提供详细答案 + 思考过程 + 参考链接

#### **示例请求**
```json
{
  "type": "message",
  "content": "什么是人工智能？",
  "user_id": "user_12345"
}
```

#### **示例响应**
```json
{
  "type": "result",
  "message": "人工智能（AI）是计算机科学的一个分支，致力于创建能够执行通常需要人类智能的任务的系统...",
  "thinking_process": "首先分析用户问题，确定需要解释的核心概念。然后通过 RAG 系统检索相关信息，结合知识库内容生成全面解释...",
  "reference_links": [
    "https://en.wikipedia.org/wiki/Artificial_intelligence",
    "https://www.ibm.com/topics/artificial-intelligence"
  ],
  "strategy": "RAG + 知识库检索",
  "source": "知识库 + 网络搜索",
  "rag_similarity": 0.92,
  "team_used": "GENERAL_QA"
}
```

### **2. SCHOOL_REC (学校推荐)**
- **用途**: 基于学生信息推荐学校
- **适用场景**: 留学咨询、学校选择、专业匹配
- **输入要求**: 学生背景信息（成绩、专业、预算等）

#### **示例请求**
```json
{
  "type": "message",
  "content": "我是一名计算机科学专业的学生，GPA 3.8，想申请美国的研究生项目，预算每年 5 万美元，请推荐一些学校",
  "user_id": "user_12345"
}
```

#### **示例响应**
```json
{
  "type": "result",
  "message": "基于您的背景信息，我推荐以下学校：\n\n1. **卡内基梅隆大学** - 计算机科学排名第一...\n2. **斯坦福大学** - 硅谷地理位置优势...",
  "thinking_process": "分析学生背景：CS专业、GPA 3.8（优秀）、预算5万/年。筛选美国CS强校，考虑录取难度、地理位置、费用等因素...",
  "reference_links": [
    "https://www.usnews.com/best-colleges/rankings/computer-science",
    "https://www.cmu.edu/cs/"
  ],
  "strategy": "多维度匹配算法",
  "source": "学校数据库 + 排名信息",
  "rag_similarity": 0.88,
  "team_used": "SCHOOL_REC"
}
```

### **3. STUDENT_INFO (学生信息收集)**
- **用途**: 收集和更新学生信息
- **适用场景**: 信息录入、资料更新、档案管理
- **功能**: 信息提取、验证、存储

#### **示例请求**
```json
{
  "type": "message",
  "content": "我叫张三，25岁，计算机科学专业，GPA 3.7，托福 100，GRE 320",
  "user_id": "user_12345"
}
```

#### **示例响应**
```json
{
  "type": "result",
  "message": "已成功记录您的信息：\n\n**个人信息**\n- 姓名：张三\n- 年龄：25岁\n- 专业：计算机科学\n- GPA：3.7\n- 托福：100\n- GRE：320",
  "thinking_process": "识别用户提供的信息类型，提取关键数据点，验证数据合理性，更新学生档案...",
  "reference_links": [],
  "strategy": "信息提取 + 数据验证",
  "source": "用户输入",
  "rag_similarity": 0.0,
  "team_used": "STUDENT_INFO"
}
```

## 🔄 **消息流程**

### **完整对话流程**
```
1. 客户端连接 WebSocket
2. 发送用户消息
3. 服务器路由到相应 AI 团队
4. AI 团队处理请求
5. 返回结构化响应
6. 客户端显示结果
```

### **状态码说明**
| 状态 | 说明 |
|------|------|
| `connecting` | 正在连接 |
| `connected` | 连接成功 |
| `disconnected` | 连接断开 |
| `error` | 连接错误 |

## 🛠️ **集成示例**

### **JavaScript 客户端示例**

#### **基础连接**
```javascript
class IOfferAIClient {
  constructor(url = 'ws://127.0.0.1:8010/ws') {
    this.url = url;
    this.ws = null;
    this.messageId = 0;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('✅ WebSocket 连接成功');
        resolve();
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket 连接错误:', error);
        reject(error);
      };
      
      this.ws.onclose = () => {
        console.log('🔌 WebSocket 连接已关闭');
      };
    });
  }

  sendMessage(content, userId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 未连接');
    }

    const message = {
      type: 'message',
      content: content,
      user_id: userId
    };

    this.ws.send(JSON.stringify(message));
    this.messageId++;
  }

  onMessage(callback) {
    if (this.ws) {
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('消息解析错误:', error);
        }
      };
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
```

#### **使用示例**
```javascript
// 创建客户端实例
const client = new IOfferAIClient();

// 连接服务器
client.connect().then(() => {
  console.log('连接成功，开始发送消息');
  
  // 设置消息处理
  client.onMessage((data) => {
    if (data.type === 'result') {
      console.log('AI 回答:', data.message);
      console.log('思考过程:', data.thinking_process);
      console.log('参考链接:', data.reference_links);
    } else if (data.type === 'error') {
      console.error('错误:', data.message);
    }
  });
  
  // 发送消息
  client.sendMessage('介绍一下哈佛大学', 'user_12345');
  
}).catch(error => {
  console.error('连接失败:', error);
});
```

### **Python 客户端示例**

#### **基础连接**
```python
import asyncio
import websockets
import json

class IOfferAIPythonClient:
    def __init__(self, url="ws://127.0.0.1:8010/ws"):
        self.url = url
        self.websocket = None
    
    async def connect(self):
        try:
            self.websocket = await websockets.connect(self.url)
            print("✅ WebSocket 连接成功")
            return True
        except Exception as e:
            print(f"❌ 连接失败: {e}")
            return False
    
    async def send_message(self, content, user_id):
        if not self.websocket:
            raise Exception("WebSocket 未连接")
        
        message = {
            "type": "message",
            "content": content,
            "user_id": user_id
        }
        
        await self.websocket.send(json.dumps(message))
        print(f"📤 已发送消息: {content}")
    
    async def receive_messages(self):
        if not self.websocket:
            return
        
        try:
            async for message in self.websocket:
                data = json.loads(message)
                
                if data["type"] == "result":
                    print(f"🤖 AI 回答: {data['message']}")
                    print(f"🧠 思考过程: {data['thinking_process']}")
                    print(f"🔗 参考链接: {data['reference_links']}")
                elif data["type"] == "error":
                    print(f"❌ 错误: {data['message']}")
                    
        except Exception as e:
            print(f"接收消息错误: {e}")
    
    async def close(self):
        if self.websocket:
            await self.websocket.close()
            print("🔌 连接已关闭")

# 使用示例
async def main():
    client = IOfferAIPythonClient()
    
    if await client.connect():
        # 启动消息接收
        receive_task = asyncio.create_task(client.receive_messages())
        
        # 发送消息
        await client.send_message("介绍一下哈佛大学", "user_12345")
        
        # 等待响应
        await asyncio.sleep(10)
        
        # 关闭连接
        await client.close()

# 运行客户端
if __name__ == "__main__":
    asyncio.run(main())
```

## 📊 **性能指标**

### **响应时间**
- **连接建立**: < 100ms
- **消息处理**: < 50ms
- **AI 响应**: 2-10 秒（取决于问题复杂度）

### **并发能力**
- **WebSocket 连接**: 支持多用户并发
- **AI 处理**: 异步处理，支持队列
- **内存使用**: 每个连接约 1-2MB

### **限制说明**
- **消息长度**: 单条消息最大 10MB
- **连接数**: 建议单服务器不超过 1000 并发
- **超时设置**: 建议客户端设置 30 秒超时

## 🚨 **注意事项**

### **开发环境**
1. **端口配置**: 确保 8010 端口可用
2. **依赖安装**: 使用 `uv sync` 安装依赖
3. **服务启动**: 使用 `uv run uvicorn api_server:app --host 127.0.0.1 --port 8010`

### **生产环境**
1. **安全配置**: 添加 CORS、认证、限流
2. **监控日志**: 配置日志轮转和监控
3. **负载均衡**: 考虑多实例部署
4. **错误处理**: 完善异常处理和重试机制

### **常见问题**
1. **连接失败**: 检查服务器状态和网络
2. **消息丢失**: 实现消息确认和重传
3. **性能问题**: 监控内存和 CPU 使用
4. **超时错误**: 调整客户端超时设置

## 📞 **技术支持**

### **调试方法**
1. 查看服务器控制台日志
2. 使用浏览器开发者工具
3. 检查网络连接状态
4. 验证消息格式正确性

### **联系信息**
- **项目文档**: 查看 `DEV_TEAM_INTEGRATION_GUIDE.md`
- **状态信息**: 查看 `PROJECT_STATUS_SUMMARY.md`
- **测试界面**: 使用 `manual_test.html`

---

**🎯 目标**: 开发团队能够快速理解和使用 API  
**📅 更新时间**: 2025-08-24  
**🚀 状态**: 文档完整，可直接使用

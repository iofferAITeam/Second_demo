"""
集成ML工作流的API服务器
简化版本：直接使用MLWorkflow替代复杂的路由系统
"""
from typing import Any, Dict, Optional
import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 导入简化的ML工作流
from ml_workflow import process_with_ml_workflow
from src.utils.session_manager import init_session
from src.domain.students_pg import StudentDocument


app = FastAPI(
    title="iOffer AI ML API",
    version="3.0.0",
    description="基于ML工作流的AI推荐系统，直接映射推荐→ML，问答→通用AI",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:3006",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",
        "http://127.0.0.1:3005",
        "http://127.0.0.1:3006",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 聊天请求模型
class ChatRequest(BaseModel):
    """聊天请求模型"""
    message: str
    user_id: str = "test_user"

class ChatResponse(BaseModel):
    """聊天响应模型"""
    message: str
    thinking_process: Optional[str] = None
    reference_links: Optional[list] = None
    strategy: Optional[str] = None
    source: Optional[str] = None
    rag_similarity: Optional[float] = None
    team_used: str
    timestamp: str
    status: str = "success"
    execution_time: Optional[str] = None
    workflow_id: Optional[str] = None
    category: Optional[str] = None
    universities: Optional[list] = None

# 根路径
@app.get("/", response_class=HTMLResponse)
async def root():
    """根路径，显示ML API信息"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>iOffer AI ML API</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; text-align: center; }
            .api-info { background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .status { text-align: center; color: #27ae60; font-weight: bold; }
            .highlight { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 iOffer AI ML API v3.0</h1>
            <div class="status">✅ ML工作流服务运行中</div>

            <div class="highlight">
                <h3>🎯 核心特性</h3>
                <p><strong>智能分类:</strong> 推荐请求 → ML算法，问答咨询 → 通用AI</p>
                <p><strong>ML引擎:</strong> XGBoost + QS排名数据</p>
                <p><strong>简化架构:</strong> 无复杂路由，直接映射处理</p>
            </div>

            <div class="api-info">
                <h3>📋 API端点</h3>
                <p><strong>POST /chat/message</strong> - ML驱动的聊天接口</p>
                <p><strong>WebSocket /ws/{user_id}</strong> - 实时ML推荐</p>
                <p><strong>GET /health</strong> - 服务健康检查</p>
            </div>

            <div class="api-info">
                <h3>🔧 使用示例</h3>
                <p><strong>推荐请求:</strong> "推荐适合我的美国大学" → ML算法</p>
                <p><strong>问答咨询:</strong> "什么是GPA？" → 通用AI</p>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "iOffer AI ML API",
        "version": "3.0.0",
        "workflow": "ML-driven"
    }

@app.post("/chat/message", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    ML驱动的聊天端点
    自动分类: 推荐→ML算法，问答→通用AI
    """
    try:
        print(f"\n🎯 收到请求: {request.message}")
        print(f"👤 用户ID: {request.user_id}")

        # 调用ML工作流处理请求
        result = await process_with_ml_workflow(request.message, request.user_id)

        # 转换为ChatResponse格式
        response = ChatResponse(
            message=result.get('message', '抱歉，无法处理您的请求'),
            thinking_process=result.get('thinking_process'),
            reference_links=result.get('reference_links', []),
            strategy=result.get('strategy', 'ml_workflow'),
            source=result.get('source', 'ml_workflow'),
            rag_similarity=result.get('rag_similarity', 0.0),
            team_used=result.get('category', 'ML_WORKFLOW'),
            timestamp=result.get('timestamp', datetime.now().isoformat()),
            status=result.get('status', 'success'),
            execution_time=result.get('execution_time'),
            workflow_id=result.get('workflow_id'),
            category=result.get('category'),
            universities=result.get('universities', [])
        )

        print(f"✅ 响应生成完成: {result.get('category')} ({result.get('execution_time')})")
        return response

    except Exception as e:
        print(f"❌ 处理请求时出错: {e}")
        import traceback
        traceback.print_exc()

        # 返回错误响应
        response = ChatResponse(
            message="系统暂时不可用，请稍后再试。我们正在修复问题。",
            thinking_process=f"系统错误: {str(e)}",
            reference_links=[],
            strategy="error_fallback",
            source="system_error",
            rag_similarity=0.0,
            team_used="ERROR_HANDLER",
            timestamp=datetime.now().isoformat(),
            status="error"
        )
        return response

# WebSocket支持
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()

    print(f"🔗 WebSocket连接建立: {user_id}")

    # 初始化用户会话
    try:
        init_session(user_id)
        print(f"✅ 用户会话初始化成功: {user_id}")
    except Exception as e:
        print(f"⚠️ 用户会话初始化失败: {e}")

    await websocket.send_json({
        "type": "system",
        "message": "欢迎使用iOffer AI ML推荐系统！",
        "user_id": user_id
    })

    try:
        while True:
            try:
                # 接收用户消息
                data = await websocket.receive_json()
                message = data.get("data", {}).get("message", "").strip()

                if not message:
                    await websocket.send_json({
                        "type": "error",
                        "message": "请输入有效的消息"
                    })
                    continue

                print(f"📥 WebSocket收到消息: {message}")

                # 发送状态更新
                await websocket.send_json({
                    "type": "status",
                    "data": {
                        "status": "processing",
                        "message": "正在分析您的请求...",
                        "step": "analyzing"
                    }
                })

                # 使用ML工作流处理
                result = await process_with_ml_workflow(message, user_id)

                # 发送最终结果
                await websocket.send_json({
                    "type": "result",
                    "data": {
                        "status": result.get('status', 'success'),
                        "message": result.get('message'),
                        "meta": {
                            "category": result.get('category'),
                            "execution_time": result.get('execution_time'),
                            "workflow_id": result.get('workflow_id'),
                            "source": result.get('source'),
                            "universities": result.get('universities', []),
                            "thinking_process": result.get('thinking_process'),
                            "reference_links": result.get('reference_links', [])
                        }
                    }
                })

                print(f"✅ WebSocket响应发送完成")

            except WebSocketDisconnect:
                print(f"🔌 WebSocket连接断开: {user_id}")
                break
            except Exception as e:
                print(f"❌ WebSocket处理错误: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "处理消息时发生错误，请重试"
                })

    except Exception as e:
        print(f"❌ WebSocket连接错误: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass

# 用户档案端点
@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """获取用户档案摘要"""
    try:
        doc = StudentDocument.find_by_user_id(user_id)
        if not doc:
            return {"exists": False, "summary": None}

        # 返回简化的档案信息
        summary = {
            "user_id": doc.user_id,
            "name": {
                "firstName": getattr(getattr(doc.basicInformation, "name", object()), "firstName", ""),
                "lastName": getattr(getattr(doc.basicInformation, "name", object()), "lastName", "")
            },
            "major": getattr(doc.applicationDetails, "intendedMajor", ""),
            "target_country": getattr(doc.applicationDetails, "targetCountry", ""),
            "gpa": getattr(getattr(doc.educationBackground, "gpa", object()), "average", "")
        }

        return {"exists": True, "summary": summary}
    except Exception as e:
        return {
            "exists": False,
            "summary": None,
            "error": f"{type(e).__name__}: {e}"
        }

# 系统信息端点
@app.get("/info")
async def system_info():
    """系统信息端点"""
    return {
        "name": "iOffer AI ML API",
        "version": "3.0.0",
        "description": "ML驱动的AI推荐系统",
        "features": [
            "智能请求分类",
            "XGBoost机器学习模型",
            "QS排名数据集成",
            "实时WebSocket通信",
            "简化工作流架构"
        ],
        "workflow": {
            "recommendation": "ML算法 (XGBoost + QS排名)",
            "qa": "混合问答系统",
            "routing": "关键词直接映射"
        },
        "endpoints": {
            "chat": "/chat/message",
            "websocket": "/ws/{user_id}",
            "health": "/health",
            "profile": "/profile/{user_id}",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 启动iOffer AI ML API服务器...")
    print("🎯 架构: 推荐→ML算法，问答→通用AI")
    print("🔗 端口: 8011")
    uvicorn.run(app, host="0.0.0.0", port=8011, log_level="info")
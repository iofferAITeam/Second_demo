from typing import Any, Dict, Optional

import asyncio
import json
import re
import os
import shutil
import logging
from datetime import datetime, timedelta
from pathlib import Path
import jwt
import hashlib

from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    UploadFile,
    File,
    HTTPException,
    Depends,
    status,
)
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from autogen_agentchat.agents import UserProxyAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.ui import Console

from src.agents.orchestrating_agent import get_orchestrating_agent
from src.teams.student_info_team import create_student_info_team
from src.teams.school_rec_teams import create_school_rec_team
from src.teams.hybrid_qa_team import create_hybrid_qa_team
from src.utils.session_manager import init_session
from src.domain.students_pg import StudentDocument


def keyword_based_routing(message: str) -> str:
    """
    Keyword-based routing to bypass Gemini dependency.
    Returns: "SCHOOL_REC", "STUDENT_INFO", or "GENERAL_QA"
    """
    print(f"🎯 Keyword-based routing for: {message}")

    # Convert message to lowercase for case-insensitive matching
    message_lower = message.lower()

    # School recommendation keywords
    school_keywords = [
        # Chinese keywords - more flexible matching
        "推荐",
        "学校",
        "大学",
        "推荐大学",
        "推荐学校",
        "学校推荐",
        "大学推荐",
        "哪些大学",
        "哪些学校",
        "推荐一下",
        "推荐一些",
        "帮我推荐",
        "选择学校",
        "选择大学",
        "申请学校",
        "申请大学",
        "录取率",
        "录取概率",
        "保底学校",
        "冲刺学校",
        "匹配学校",
        "安全学校",
        "适合的大学",
        "适合的学校",
        "计算机科学专业",
        "cs专业",
        "工程专业",
        "商科专业",
        "申请cs",
        "申请计算机",
        "美国大学",
        "英国大学",
        "加拿大大学",
        "澳洲大学",
        "欧洲大学",
        "排名",
        "学校排名",
        "大学排名",
        "qs排名",
        "usnews排名",
        "机器学习",
        "人工智能",
        "数据科学",
        "软件工程",
        "计算机工程",
        # English keywords
        "recommend",
        "school",
        "university",
        "college",
        "recommend university",
        "recommend school",
        "recommend college",
        "which university",
        "which school",
        "which college",
        "choose university",
        "choose school",
        "choose college",
        "apply university",
        "apply school",
        "apply college",
        "admission rate",
        "admission probability",
        "acceptance rate",
        "safety school",
        "reach school",
        "match school",
        "target school",
        "computer science",
        "cs program",
        "engineering program",
        "business program",
        "us university",
        "uk university",
        "canadian university",
        "australian university",
        "university ranking",
        "school ranking",
        "college ranking",
        "qs ranking",
        "machine learning",
        "artificial intelligence",
        "data science",
        "software engineering",
        "mit",
        "stanford",
        "harvard",
        "berkeley",
        "cmu",
        "caltech",
        "gpa",
        "gre",
        "toefl",
        "ielts",
        "sat",
        "act",
    ]

    # Student info extraction keywords
    student_info_keywords = [
        # Chinese keywords
        "我的gpa",
        "我的专业",
        "我的成绩",
        "我的背景",
        "我的经历",
        "我叫",
        "我的名字",
        "我来自",
        "我的国籍",
        "我的学校",
        "我想申请",
        "我希望",
        "我的目标",
        "我的计划",
        "我的兴趣",
        "我学的是",
        "我的托福",
        "我的雅思",
        "我的gre",
        "我的gmat",
        "更新资料",
        "修改资料",
        "个人信息",
        "基本信息",
        "学术背景",
        # English keywords
        "my gpa",
        "my major",
        "my grade",
        "my background",
        "my experience",
        "my name",
        "i am",
        "i'm from",
        "my nationality",
        "my school",
        "i want to apply",
        "i hope",
        "my goal",
        "my plan",
        "my interest",
        "i study",
        "i major in",
        "my toefl",
        "my ielts",
        "my gre",
        "my gmat",
        "update profile",
        "modify profile",
        "personal information",
        "academic background",
    ]

    # Determine team based on keyword matching
    school_score = sum(1 for keyword in school_keywords if keyword in message_lower)
    student_info_score = sum(
        1 for keyword in student_info_keywords if keyword in message_lower
    )

    print(f"🎯 Keyword scores: School={school_score}, StudentInfo={student_info_score}")

    # Route based on highest score
    if school_score > student_info_score and school_score > 0:
        team_type = "SCHOOL_REC"
        print(f"🏫 Selected team: SCHOOL_REC (matched {school_score} keywords)")
    elif student_info_score > 0:
        team_type = "STUDENT_INFO"
        print(f"📝 Selected team: STUDENT_INFO (matched {student_info_score} keywords)")
    else:
        team_type = "GENERAL_QA"
        print(f"💬 Selected team: GENERAL_QA (no specific keywords matched)")

    print(f"🎯 Final routing decision: {team_type}")
    return team_type


# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Security
security = HTTPBearer()

# In-memory user storage (replace with database in production)
users_db = {}
refresh_tokens_db = {}

app = FastAPI(
    title="iOffer AI Chat API",
    version="2.0.0",
    description="基于 Autogen 框架的 AI 智能问答系统，支持多种 AI 代理团队协作",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
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
        "*",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 创建上传目录
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# HTTP 端点用于测试和文档
@app.get("/", response_class=HTMLResponse)
async def root():
    """根路径，显示 API 信息"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>iOffer AI Chat API</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; text-align: center; }
            .api-info { background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .endpoints { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .websocket { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .links { text-align: center; margin: 30px 0; }
            .links a { display: inline-block; margin: 10px; padding: 12px 24px; background: #3498db; color: white; text-decoration: none; border-radius: 6px; }
            .links a:hover { background: #2980b9; }
            .status { text-align: center; color: #27ae60; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 iOffer AI Chat API</h1>
            <div class="status">✅ 服务运行中</div>
            
            <div class="api-info">
                <h3>📋 API 信息</h3>
                <p><strong>版本:</strong> 2.0.0</p>
                <p><strong>描述:</strong> 基于 Autogen 框架的 AI 智能问答系统</p>
                <p><strong>协议:</strong> WebSocket + HTTP</p>
            </div>
            
            <div class="endpoints">
                <h3>🔗 HTTP 端点</h3>
                <p><strong>GET /</strong> - 此页面</p>
                <p><strong>GET /health</strong> - 健康检查</p>
                <p><strong>GET /info</strong> - API 信息</p>
                <p><strong>POST /chat</strong> - 聊天接口（同步）</p>
            </div>
            
            <div class="websocket">
                <h3>🔌 WebSocket 端点</h3>
                <p><strong>ws://127.0.0.1:8010/ws</strong> - 实时聊天</p>
                <p>支持多种 AI 代理团队：GENERAL_QA, SCHOOL_REC, STUDENT_INFO</p>
            </div>
            
            <div class="links">
                <a href="/docs" target="_blank">📚 Swagger UI 文档</a>
                <a href="/redoc" target="_blank">📖 ReDoc 文档</a>
                <a href="/openapi.json" target="_blank">🔧 OpenAPI JSON</a>
                <a href="/manual_test.html" target="_blank">🧪 测试界面</a>
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
        "service": "iOffer AI Chat API",
        "version": "2.0.0",
    }


@app.get("/info")
async def api_info():
    """API 信息端点"""
    return {
        "name": "iOffer AI Chat API",
        "version": "2.0.0",
        "description": "基于 Autogen 框架的 AI 智能问答系统",
        "features": [
            "WebSocket 实时通信",
            "多种 AI 代理团队",
            "智能问答",
            "学校推荐",
            "学生信息收集",
        ],
        "endpoints": {
            "websocket": "/ws",
            "docs": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
        },
    }


# Authentication models
class LoginRequest(BaseModel):
    """登录请求模型"""

    email: str
    password: str


class RegisterRequest(BaseModel):
    """注册请求模型"""

    email: str
    name: str
    password: str


class RefreshTokenRequest(BaseModel):
    """刷新令牌请求模型"""

    refreshToken: str


class UserResponse(BaseModel):
    """用户响应模型"""

    id: str
    email: str
    name: str


class AuthResponse(BaseModel):
    """认证响应模型"""

    success: bool
    accessToken: Optional[str] = None
    refreshToken: Optional[str] = None
    user: Optional[UserResponse] = None
    error: Optional[str] = None


# 聊天请求模型
class ChatRequest(BaseModel):
    """聊天请求模型"""

    message: str
    user_id: str = "test_user"
    team_type: Optional[str] = None  # GENERAL_QA, SCHOOL_REC, STUDENT_INFO


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


# Authentication helper functions
def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed


def create_access_token(data: dict) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None or user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return users_db[user_id]


def format_user_context(user_profile) -> str:
    """将用户档案转换为AI可理解的上下文信息"""
    if not user_profile:
        return ""

    context_parts = []

    # 基本信息
    basic_info = user_profile.basicInformation
    if basic_info.name.firstName or basic_info.name.lastName:
        name = f"{basic_info.name.firstName} {basic_info.name.lastName}".strip()
        context_parts.append(f"Student Name: {name}")

    if basic_info.nationality:
        context_parts.append(f"Nationality: {basic_info.nationality}")

    # 申请信息
    app_details = user_profile.applicationDetails
    if app_details.degreeType:
        context_parts.append(f"Degree Type: {app_details.degreeType}")
    if app_details.intendedMajor:
        context_parts.append(f"Intended Major: {app_details.intendedMajor}")
    if app_details.targetCountry:
        context_parts.append(f"Target Country: {app_details.targetCountry}")
    if app_details.applicationYear:
        context_parts.append(f"Application Year: {app_details.applicationYear}")

    # 教育背景
    edu_bg = user_profile.educationBackground
    if edu_bg.highestDegree:
        context_parts.append(f"Highest Degree: {edu_bg.highestDegree}")
    if edu_bg.major:
        context_parts.append(f"Current Major: {edu_bg.major}")
    if edu_bg.gpa.average:
        context_parts.append(f"GPA: {edu_bg.gpa.average}")
    if edu_bg.currentInstitution.name:
        context_parts.append(f"Current Institution: {edu_bg.currentInstitution.name}")

    # 职业发展
    career_dev = user_profile.careerDevelopment
    if career_dev.careerPath:
        context_parts.append(f"Career Path: {career_dev.careerPath}")
    if career_dev.futureCareerPlan:
        context_parts.append(f"Future Career Plan: {career_dev.futureCareerPlan}")
    if career_dev.graduateStudyPlan:
        context_parts.append(f"Graduate Study Plan: {career_dev.graduateStudyPlan}")
    if career_dev.hasWorkExperience:
        context_parts.append(f"Has Work Experience: Yes")

    # 学习偏好
    study_abroad = user_profile.studyAbroadPreparation
    if study_abroad.internationalDegree.desiredInstitution:
        context_parts.append(
            f"Desired Institution: {study_abroad.internationalDegree.desiredInstitution}"
        )
    if study_abroad.internationalDegree.desiredProgram:
        context_parts.append(
            f"Desired Program: {study_abroad.internationalDegree.desiredProgram}"
        )

    lifestyle = study_abroad.lifestylePreferences
    if lifestyle.preferredCityType:
        context_parts.append(
            f"Preferred City Type: {', '.join(lifestyle.preferredCityType)}"
        )
    if lifestyle.preferredEnvironment:
        context_parts.append(
            f"Preferred Environment: {', '.join(lifestyle.preferredEnvironment)}"
        )

    # 个性信息
    personality = user_profile.personalityProfile
    if personality.mbtiType:
        context_parts.append(f"MBTI Type: {personality.mbtiType}")
    if personality.interests:
        context_parts.append(f"Interests: {personality.interests}")
    if personality.strengths:
        context_parts.append(f"Strengths: {personality.strengths}")

    if context_parts:
        return (
            "STUDENT PROFILE:\n"
            + "\n".join(f"- {part}" for part in context_parts)
            + "\n\nBased on this student profile, please provide personalized recommendations."
        )
    else:
        return ""


def clean_ai_response(message: str) -> str:
    """清理AI响应中的引用标记、引用部分和格式标记，保留所有正文内容"""
    import re

    # 1. 先移除引用部分（避免误删正文）
    message = re.sub(r"Reference Sources:.*$", "", message, flags=re.DOTALL)
    message = re.sub(r"Additional Sources:.*$", "", message, flags=re.DOTALL)

    # 2. 移除文中的引用标记 [1], [2], [3] 等
    message = re.sub(r"\[\d+\]", "", message)

    # 3. 移除网址链接 (https://...) 和 (http://...)
    message = re.sub(r"\(https?://[^\s\)]+\)", "", message)

    # 4. 移除粗体标记 **文字** -> 文字
    message = re.sub(r"\*\*(.*?)\*\*", r"\1", message)

    # 5. 移除列表符号 - （行首的破折号）
    message = re.sub(r"^\s*-\s+", "", message, flags=re.MULTILINE)

    # 6. 移除不完整的格式标记
    message = re.sub(r"\*\*\s*$", "", message)
    message = re.sub(r"^\s*\*\*", "", message)

    # 7. 清理多余的空行
    message = re.sub(r"\n\s*\n\s*\n+", "\n\n", message)

    # 8. 清理首尾空白
    message = message.strip()

    return message


# Authentication endpoints
@app.post("/api/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    """用户登录"""
    try:
        # Check if user exists
        user_found = None
        for user_id, user_data in users_db.items():
            if user_data["email"] == request.email:
                user_found = user_data
                break

        if not user_found or not verify_password(
            request.password, user_found["password"]
        ):
            return AuthResponse(success=False, error="Invalid email or password")

        # Create tokens
        token_data = {"sub": user_found["id"]}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Store refresh token
        refresh_tokens_db[refresh_token] = user_found["id"]

        return AuthResponse(
            success=True,
            accessToken=access_token,
            refreshToken=refresh_token,
            user=UserResponse(
                id=user_found["id"], email=user_found["email"], name=user_found["name"]
            ),
        )

    except Exception as e:
        print(f"Login error: {e}")
        return AuthResponse(success=False, error="Login failed. Please try again.")


@app.post("/api/auth/register", response_model=AuthResponse)
async def register(request: RegisterRequest):
    """用户注册"""
    try:
        # Check if user already exists
        for user_data in users_db.values():
            if user_data["email"] == request.email:
                return AuthResponse(
                    success=False, error="User with this email already exists"
                )

        # Create new user
        user_id = f"user_{len(users_db) + 1}"
        hashed_password = hash_password(request.password)

        user_data = {
            "id": user_id,
            "email": request.email,
            "name": request.name,
            "password": hashed_password,
            "created_at": datetime.utcnow().isoformat(),
        }

        users_db[user_id] = user_data

        # Create tokens
        token_data = {"sub": user_id}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Store refresh token
        refresh_tokens_db[refresh_token] = user_id

        return AuthResponse(
            success=True,
            accessToken=access_token,
            refreshToken=refresh_token,
            user=UserResponse(id=user_id, email=request.email, name=request.name),
        )

    except Exception as e:
        print(f"Registration error: {e}")
        return AuthResponse(
            success=False, error="Registration failed. Please try again."
        )


@app.get("/api/auth/verify", response_model=AuthResponse)
async def verify_auth(current_user: dict = Depends(get_current_user)):
    """验证当前用户token"""
    try:
        return AuthResponse(
            success=True,
            user=UserResponse(
                id=current_user["id"],
                email=current_user["email"],
                name=current_user["name"],
            ),
        )
    except Exception as e:
        print(f"Verification error: {e}")
        return AuthResponse(success=False, error="Token verification failed")


@app.post("/api/auth/logout", response_model=AuthResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """用户登出"""
    try:
        # Remove all refresh tokens for this user
        tokens_to_remove = []
        for token, user_id in refresh_tokens_db.items():
            if user_id == current_user["id"]:
                tokens_to_remove.append(token)

        for token in tokens_to_remove:
            del refresh_tokens_db[token]

        return AuthResponse(success=True, message="Logged out successfully")
    except Exception as e:
        print(f"Logout error: {e}")
        return AuthResponse(success=False, error="Logout failed")


@app.post("/api/auth/refresh", response_model=AuthResponse)
async def refresh_token(request: RefreshTokenRequest):
    """刷新access token"""
    try:
        # Verify refresh token
        payload = verify_token(request.refreshToken)

        if payload is None or payload.get("type") != "refresh":
            return AuthResponse(success=False, error="Invalid refresh token")

        user_id = payload.get("sub")
        if (
            user_id is None
            or request.refreshToken not in refresh_tokens_db
            or refresh_tokens_db[request.refreshToken] != user_id
            or user_id not in users_db
        ):
            return AuthResponse(success=False, error="Invalid refresh token")

        # Create new tokens
        token_data = {"sub": user_id}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        # Update refresh token in storage
        del refresh_tokens_db[request.refreshToken]
        refresh_tokens_db[new_refresh_token] = user_id

        return AuthResponse(
            success=True, accessToken=new_access_token, refreshToken=new_refresh_token
        )

    except Exception as e:
        print(f"Token refresh error: {e}")
        return AuthResponse(success=False, error="Token refresh failed")


@app.post("/chat/message", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    同步聊天端点

    用于测试和集成，返回 AI 回答。
    """
    try:
        # Import AI teams and user data
        import json
        from src.teams.hybrid_qa_team import hybrid_qa_query
        from src.teams.school_rec_teams import create_school_rec_team
        from src.teams.student_info_team import create_student_info_team
        from src.domain.students_pg import StudentDocument
        from autogen_agentchat.ui import Console

        # session 初始化
        try:
            init_session(request.user_id)
            print(f"✅ Session 初始化: {request.user_id}")
        except Exception as e:
            print(f"⚠️ Session 初始化失败: {e}")

        # 查询用户档案
        user_profile = None
        user_context = ""
        try:
            user_profile = StudentDocument.find_by_user_id(request.user_id)
            if user_profile:
                user_context = format_user_context(user_profile)
                print(f"✅ 找到用户档案: {request.user_id}")
            else:
                print(f"⚠️ 未找到用户档案: {request.user_id}")
        except Exception as e:
            print(f"⚠️ 用户档案查询失败: {e}")

        # 组合用户问题和个人档案上下文
        enhanced_message = request.message
        if user_context:
            enhanced_message = f"{user_context}\n\nUSER QUESTION: {request.message}"

        # Check if team_type is specified, otherwise use auto-routing
        team_type = getattr(request, "team_type", None)

        if team_type is None:
            # Use keyword-based routing (bypassing Gemini dependency)
            team_type = keyword_based_routing(request.message)

        # 🟢 统一使用 AutoGen Teams
        print(f"🎯 路由到: {team_type}")
        
        # 步骤1: 选择对应的 AutoGen Team
        if team_type == "GENERAL_QA":
            # Use real hybrid QA agent with user context
            qa_result = await hybrid_qa_query(enhanced_message)
            qa_data = json.loads(qa_result)

            # 清理AI响应
            raw_message = qa_data.get(
                "answer", "I apologize, but I cannot provide an answer right now."
            )
            cleaned_message = clean_ai_response(raw_message)

            response = ChatResponse(
                message=cleaned_message,
                thinking_process=qa_data.get(
                    "thinking_process", "Processing your question..."
                ),
                reference_links=qa_data.get("reference_links", []),
                strategy=qa_data.get("strategy", "hybrid_qa"),
                source=qa_data.get("source", "knowledge_base"),
                rag_similarity=qa_data.get("rag_similarity", 0.0),
                team_used="GENERAL_QA",
                timestamp=datetime.now().isoformat(),
            )
            return response
            
        elif team_type == "SCHOOL_REC":
            team = create_school_rec_team()
        elif team_type == "STUDENT_INFO":
            team = create_student_info_team()
        else:
            # Default to General QA for unknown team types
            qa_result = await hybrid_qa_query(request.message)
            qa_data = json.loads(qa_result)

            # 清理AI响应
            raw_message = qa_data.get(
                "answer", "I apologize, but I cannot provide an answer right now."
            )
            cleaned_message = clean_ai_response(raw_message)

            response = ChatResponse(
                message=cleaned_message,
                thinking_process=qa_data.get(
                    "thinking_process", "Processing your question..."
                ),
                reference_links=qa_data.get("reference_links", []),
                strategy=qa_data.get("strategy", "hybrid_qa"),
                source=qa_data.get("source", "knowledge_base"),
                rag_similarity=qa_data.get("rag_similarity", 0.0),
                team_used="GENERAL_QA",
                timestamp=datetime.now().isoformat(),
            )
            return response
        
        # 步骤2: 执行 AutoGen Team
        print(f"🚀 运行 {team_type} team...")
        try:
            task_result = await Console(
                team.run_stream(task=enhanced_message)
            )
            
            # 步骤3: 提取最终消息
            team_response = ""
            
            for i in range(len(task_result.messages) - 1, -1, -1):
                msg = task_result.messages[i]
                content = str(msg.content) if hasattr(msg, 'content') else str(msg)
                
                if content.strip() and content.strip() != "TERMINATE":
                    team_response = content.replace("TERMINATE", "").strip()
                    print(f"✅ 找到有效消息: {len(team_response)} 字符")
                    break
            
            if not team_response:
                team_response = "I apologize, but I couldn't generate a proper response."
            
            team_response = clean_ai_response(team_response)
            
            # 步骤4: 构建响应
            response = ChatResponse(
                message=team_response,
                thinking_process=f"使用 AutoGen {team_type} team 处理请求",
                reference_links=[],
                strategy="autogen_team",
                source="autogen",
                rag_similarity=0.0,
                team_used=team_type,
                timestamp=datetime.now().isoformat(),
            )
            
        except Exception as team_error:
            print(f"❌ {team_type} team 执行失败: {str(team_error)}")
            import traceback
            traceback.print_exc()
            
            response = ChatResponse(
                message="I apologize, but I'm experiencing technical difficulties.",
                thinking_process=f"Team execution error: {str(team_error)}",
                reference_links=[],
                strategy="error_fallback",
                source="system",
                rag_similarity=0.0,
                team_used=f"{team_type}_FALLBACK",
                timestamp=datetime.now().isoformat(),
            )
        return response

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        # Fallback response for any errors
        response = ChatResponse(
            message="I'm experiencing some technical difficulties right now, but I'm here to help with college recommendations and questions. Could you please try rephrasing your question?",
            thinking_process=f"Error encountered: {str(e)}",
            reference_links=[],
            strategy="error_fallback",
            source="system",
            rag_similarity=0.0,
            team_used="ERROR_FALLBACK",
            timestamp=datetime.now().isoformat(),
        )
        return response


# Session management endpoints
class SessionRequest(BaseModel):
    """会话创建请求模型"""

    title: Optional[str] = None


class SessionResponse(BaseModel):
    """会话响应模型"""

    message: str
    session: dict


@app.post("/chat/session", response_model=SessionResponse)
async def create_session(request: SessionRequest):
    """创建新的聊天会话"""
    try:
        import uuid

        session_id = str(uuid.uuid4())
        session = {
            "id": session_id,
            "title": request.title or "New Chat",
            "userId": "default_user",
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat(),
            "messageCount": 0,
            "lastMessage": None,
        }

        return SessionResponse(message="Session created successfully", session=session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建会话时出错: {str(e)}")


@app.get("/chat/sessions")
async def get_sessions():
    """获取用户的所有会话"""
    try:
        # 返回示例会话列表
        sessions = [
            {
                "id": "session_1",
                "title": "College Planning Discussion",
                "userId": "default_user",
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat(),
                "messageCount": 5,
                "lastMessage": "What schools would you recommend?",
            }
        ]
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取会话列表时出错: {str(e)}")


@app.delete("/chat/session/{session_id}")
async def delete_session(session_id: str):
    """删除指定会话"""
    try:
        return {"message": f"Session {session_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除会话时出错: {str(e)}")


@app.get("/chat/session/{session_id}/messages")
async def get_session_messages(session_id: str):
    """获取指定会话的消息历史"""
    try:
        # 返回示例消息
        messages = [
            {
                "id": "msg_1",
                "content": "Hello, I need help with college recommendations",
                "type": "user",
                "timestamp": datetime.now().isoformat(),
                "teamUsed": "GENERAL_QA",
            },
            {
                "id": "msg_2",
                "content": "I'd be happy to help you with college recommendations! Can you tell me about your academic interests and goals?",
                "type": "assistant",
                "timestamp": datetime.now().isoformat(),
                "teamUsed": "GENERAL_QA",
            },
        ]
        return {"sessionId": session_id, "messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取会话消息时出错: {str(e)}")


@app.get("/chat/history")
async def get_chat_history(limit: int = 50, offset: int = 0):
    """获取聊天历史"""
    try:
        messages = [
            {
                "id": "msg_1",
                "content": "Hello, I need help with college planning",
                "type": "user",
                "timestamp": datetime.now().isoformat(),
                "teamUsed": "GENERAL_QA",
            },
            {
                "id": "msg_2",
                "content": "I'd be happy to help you with college planning! What specific areas would you like to explore?",
                "type": "assistant",
                "timestamp": datetime.now().isoformat(),
                "teamUsed": "GENERAL_QA",
            },
        ]
        return {"messages": messages[offset : offset + limit], "total": len(messages)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取聊天历史时出错: {str(e)}")


# 配置详细日志
def setup_logging():
    """设置详细的日志记录"""
    import os
    
    # 确保 logs 目录存在
    logs_dir = "logs"
    os.makedirs(logs_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_filename = os.path.join(logs_dir, f"api_server_detailed_{timestamp}.log")

    # 配置日志格式
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(message)s",
        handlers=[
            logging.FileHandler(log_filename, encoding="utf-8"),
            logging.StreamHandler(),  # 同时输出到控制台
        ],
    )

    logger = logging.getLogger(__name__)

    # 创建日志分隔符
    separator = "=" * 80
    logger.info(separator)
    logger.info("🚀 iOffer AI API Server 启动")
    logger.info(f"📅 启动时间: {timestamp}")
    logger.info(f"📁 日志文件: {log_filename}")
    logger.info(separator)

    return logger


# 初始化日志
logger = setup_logging()


# 日志辅助函数
def log_section(title: str):
    """记录日志分节标题"""
    logger.info(f"\n{'='*20} {title} {'='*20}")


def log_message_flow(
    direction: str, message_type: str, content: str, user_id: str = ""
):
    """记录消息流向"""
    if direction == "IN":
        logger.info(f"📥 收到消息 | 用户: {user_id} | 类型: {message_type}")
        logger.info(f"📝 内容: {content[:200]}{'...' if len(content) > 200 else ''}")
    elif direction == "OUT":
        logger.info(f"📤 发送消息 | 类型: {message_type}")
        logger.info(f"📝 内容: {content[:200]}{'...' if len(content) > 200 else ''}")


def log_team_execution(team_name: str, message_count: int, final_message: str):
    """记录团队执行结果"""
    logger.info(f"🤖 团队执行完成 | 团队: {team_name} | 消息数: {message_count}")
    logger.info(
        f"📋 最终消息: {final_message[:300]}{'...' if len(final_message) > 300 else ''}"
    )


def log_text_message_analysis(messages: list):
    """记录 TextMessage 分析过程"""
    logger.info(f"🔍 TextMessage 分析 | 总消息数: {len(messages)}")
    for i, msg in enumerate(messages):
        msg_type = type(msg).__name__
        content = (
            getattr(msg, "content", str(msg)) if hasattr(msg, "content") else str(msg)
        )
        logger.info(
            f"  📝 消息 {i}: {msg_type} | 长度: {len(content) if content else 0}"
        )
        if content and len(content) > 0:
            logger.info(
                f"     预览: {content[:150]}{'...' if len(content) > 150 else ''}"
            )


# 添加文件类型验证
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_upload_file(file: UploadFile):
    """验证上传文件"""
    # 检查文件扩展名
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type {file_ext} not allowed")

    # 检查文件大小
    if file.size > MAX_FILE_SIZE:
        raise ValueError(f"File size {file.size} exceeds limit")

    return True


def _validate_and_clean_url(url: str) -> str:
    """
    Validate and clean a URL to ensure it's properly formatted
    """
    if not url or not isinstance(url, str):
        return ""

    # Remove trailing punctuation and whitespace
    clean_url = url.rstrip(".,;:!?()[]{}\"'").strip()

    # Basic URL validation
    if not clean_url.startswith(("http://", "https://")):
        return ""

    # Remove any trailing slashes that might cause issues
    clean_url = clean_url.rstrip("/")

    # Ensure minimum length
    if len(clean_url) < 10:
        return ""

    return clean_url


def _safe_get_content(obj: Any) -> str:
    try:
        if obj is None:
            return ""
        if hasattr(obj, "content") and obj.content is not None:
            return str(obj.content)
        return str(obj)
    except Exception:
        return ""


def _try_extract_payload(text: str) -> Optional[Dict[str, Any]]:
    """
    Try to extract a JSON object from the agent's textual output.
    Supports raw JSON or fenced blocks ```json ... ```.
    Returns a dict if successful, otherwise None.
    """
    if not isinstance(text, str):
        return None

    candidate = text.strip()

    # Extract JSON from fenced code block if present
    fenced = re.search(
        r"```json\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```", candidate, flags=re.IGNORECASE
    )
    if fenced:
        candidate = fenced.group(1).strip()

    # Try parse as JSON object
    if candidate.startswith("{") or candidate.startswith("["):
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            return None
    return None


async def _send_status(
    ws: WebSocket,
    message: str,
    step: str,
    extra_details: Optional[Dict[str, Any]] = None,
) -> None:
    details = {"step": step}
    if extra_details:
        details.update(extra_details)
    await ws.send_json(
        {
            "type": "status",
            "data": {
                "status": "thinking",
                "message": message,
                "details": details,
            },
        }
    )


async def _send_error(ws: WebSocket, user_message: str, exc: Exception) -> None:
    await ws.send_json(
        {
            "type": "status",
            "data": {
                "status": "error",
                "message": "Sorry, something went wrong while processing your request. Please try again.",
                "details": {
                    "error_code": 500,
                    "internal_message": f"{type(exc).__name__}: {exc}",
                    "user_message": user_message,
                },
            },
        }
    )


def _build_workflow_context():
    """
    Build and return routing agent, user proxy, and teams for handling messages.
    We intentionally avoid relying on ChatbotWorkflow to keep WS non-blocking.
    """
    routing_agent = get_orchestrating_agent()
    # Non-blocking user proxy (input_func accepts prompt but returns empty string)
    user_proxy = UserProxyAgent("user_proxy", input_func=lambda prompt: "")

    teams: Dict[str, Any] = {
        "STUDENT_INFO": create_student_info_team(),
        "SCHOOL_RECOMMENDATION": create_school_rec_team(),
        "GENERAL_QA": create_hybrid_qa_team(),
    }

    return routing_agent, user_proxy, teams


@app.get("/")
async def root():
    html = """
    <html>
      <head>
        <title>iOffer AI WebSocket</title>
      </head>
      <body>
        <h3>iOffer AI WebSocket</h3>
        <p>Open WebSocket to <code>/ws/&lt;user_id&gt;</code> and send:</p>
        <pre>{"type":"user_message","data":{"user_id":"hanyu_liu_003","message":"Hello"}}</pre>
      </body>
    </html>
    """
    return HTMLResponse(content=html)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "iOffer AI Chat API"}


@app.get("/api")
async def api_docs():
    """简洁的API文档页面"""
    html_content = """
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>iOffer AI - API 文档</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
                line-height: 1.6;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
            }
            h2 {
                color: #34495e;
                margin-top: 30px;
                border-left: 4px solid #3498db;
                padding-left: 15px;
            }
            .endpoint {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
            }
            .method {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 12px;
                text-transform: uppercase;
            }
            .get { background: #d4edda; color: #155724; }
            .post { background: #d1ecf1; color: #0c5460; }
            .websocket { background: #fff3cd; color: #856404; }
            .url {
                background: #e9ecef;
                padding: 8px 12px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #495057;
            }
            .description {
                margin: 10px 0;
                color: #6c757d;
            }
            .example {
                background: #f8f9fa;
                border-left: 3px solid #28a745;
                padding: 15px;
                margin: 10px 0;
                font-family: 'Courier New', monospace;
                font-size: 13px;
            }
            .status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .online { background: #d4edda; color: #155724; }
            .offline { background: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 iOffer AI API 文档</h1>
            
            <div style="text-align: center; margin: 20px 0;">
                <span class="status online">🟢 服务在线</span>
                <span style="margin-left: 10px; color: #6c757d;">版本: 2.0.0</span>
            </div>

            <h2>📡 核心端点</h2>
            
            <div class="endpoint">
                <div><span class="method get">GET</span> <span class="url">/health</span></div>
                <div class="description">健康检查端点，用于验证服务状态</div>
                <div class="example">
                    响应: {"status": "healthy", "service": "iOffer AI Chat API"}
                </div>
            </div>

            <div class="endpoint">
                <div><span class="method post">POST</span> <span class="url">/upload</span></div>
                <div class="description">文件上传端点，支持PDF、JPG、PNG格式，最大10MB</div>
                <div class="example">
                    请求: multipart/form-data with file<br>
                    响应: {"status": "success", "file_path": "uploads/xxx.pdf"}
                </div>
            </div>

            <div class="endpoint">
                <div><span class="method websocket">WebSocket</span> <span class="url">/ws/{user_id}</span></div>
                <div class="description">实时聊天端点，支持AI对话和文件处理</div>
                <div class="example">
                    连接: ws://127.0.0.1:8010/ws/hanyuliu<br>
                    消息类型: user_message, file_upload
                </div>
            </div>

            <h2>🔗 快速测试</h2>
            
            <div class="endpoint">
                <div style="margin-bottom: 15px;">
                    <strong>健康检查:</strong> 
                    <a href="/health" target="_blank">/health</a>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>完整API文档:</strong> 
                    <a href="/docs" target="_blank">/docs</a> (Swagger UI)
                </div>
                <div>
                    <strong>测试页面:</strong> 
                    <a href="/test" target="_blank">/test</a> (HTML测试界面)
                </div>
            </div>

            <h2>📋 使用说明</h2>
            
            <div class="endpoint">
                <div style="margin-bottom: 10px;"><strong>1. 启动服务:</strong></div>
                <div class="example">uv run uvicorn api_server:app --host 127.0.0.1 --port 8010</div>
                
                <div style="margin: 15px 0 10px 0;"><strong>2. 测试连接:</strong></div>
                <div class="example">curl http://127.0.0.1:8010/health</div>
                
                <div style="margin: 15px 0 10px 0;"><strong>3. 文件上传:</strong></div>
                <div class="example">curl -X POST -F "file=@test.pdf" http://127.0.0.1:8010/upload</div>
            </div>

            <h2>🔧 技术信息</h2>
            
            <div class="endpoint">
                <div><strong>框架:</strong> FastAPI + WebSocket</div>
                <div><strong>AI模型:</strong> Google Gemini 2.5 Pro</div>
                <div><strong>数据库:</strong> MongoDB</div>
                <div><strong>文件处理:</strong> OCR + LLM信息提取</div>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@app.get("/test")
async def test_page():
    """HTML测试界面"""
    html_content = """
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>iOffer AI - 测试界面</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                max-width: 1000px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
            }
            .test-section {
                margin: 20px 0;
                padding: 20px;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                background: #f8f9fa;
            }
            .test-button {
                display: inline-block;
                padding: 10px 20px;
                margin: 5px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .test-button:hover {
                background: #0056b3;
                color: white;
            }
            .status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 10px;
            }
            .online { background: #d4edda; color: #155724; }
            .endpoint-info {
                background: #e9ecef;
                padding: 15px;
                border-radius: 5px;
                margin: 10px 0;
                font-family: 'Courier New', monospace;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 iOffer AI 测试界面</h1>
            
            <div style="text-align: center; margin: 20px 0;">
                <span class="status online">🟢 服务在线</span>
                <span style="margin-left: 10px; color: #6c757d;">端口: 8010</span>
            </div>

            <div class="test-section">
                <h3>🔗 快速测试</h3>
                <a href="/health" class="test-button" target="_blank">健康检查</a>
                <a href="/api" class="test-button" target="_blank">API文档</a>
                <a href="/docs" class="test-button" target="_blank">Swagger UI</a>
            </div>

            <div class="test-section">
                <h3>📡 端点信息</h3>
                <div class="endpoint-info">
                    <strong>健康检查:</strong> GET /health<br>
                    <strong>文件上传:</strong> POST /upload<br>
                    <strong>WebSocket:</strong> ws://127.0.0.1:8010/ws/{user_id}<br>
                    <strong>API文档:</strong> GET /api<br>
                    <strong>测试页面:</strong> GET /test
                </div>
            </div>

            <div class="test-section">
                <h3>🧪 功能测试</h3>
                <p>使用以下工具进行完整功能测试：</p>
                <ul>
                    <li><strong>manual_test.html</strong> - 完整的WebSocket聊天测试</li>
                    <li><strong>curl命令</strong> - 命令行API测试</li>
                    <li><strong>Postman</strong> - API测试工具</li>
                </ul>
            </div>

            <div class="test-section">
                <h3>📋 测试命令</h3>
                <div class="endpoint-info">
                    # 健康检查<br>
                    curl http://127.0.0.1:8010/health<br><br>
                    
                    # 文件上传<br>
                    curl -X POST -F "file=@test.pdf" http://127.0.0.1:8010/upload<br><br>
                    
                    # WebSocket连接<br>
                    wscat -c ws://127.0.0.1:8010/ws/hanyuliu
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """处理文件上传"""
    try:
        # 验证文件
        validate_upload_file(file)

        # 生成唯一文件名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = Path(file.filename).suffix
        unique_filename = f"{timestamp}_{file.filename}"
        file_path = UPLOAD_DIR / unique_filename

        # 保存文件
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "status": "success",
            "file_path": str(file_path),
            "filename": unique_filename,
            "size": file.size,
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


def _summarize_profile(doc: StudentDocument) -> Dict[str, Any]:
    """Build a concise profile summary for API responses."""
    try:
        name = {
            "firstName": getattr(
                getattr(doc.basicInformation, "name", object()), "firstName", ""
            ),
            "lastName": getattr(
                getattr(doc.basicInformation, "name", object()), "lastName", ""
            ),
        }
        email = getattr(
            getattr(doc.basicInformation, "contactInformation", object()), "email", ""
        )
        app = doc.applicationDetails
        app_summary = {
            "degreeType": getattr(app, "degreeType", ""),
            "intendedMajor": getattr(app, "intendedMajor", ""),
            "targetCountry": getattr(app, "targetCountry", ""),
            "applicationYear": getattr(app, "applicationYear", ""),
            "applicationTerm": getattr(app, "applicationTerm", ""),
        }
        return {
            "user_id": doc.user_id,
            "name": name,
            "email": email,
            "applicationDetails": app_summary,
        }
    except Exception:
        # Fallback minimal summary
        return {"user_id": getattr(doc, "user_id", "")}


@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    """Read-only endpoint to check if a profile exists and return a concise summary."""
    try:
        doc = StudentDocument.find_by_user_id(user_id)
        if not doc:
            return {"exists": False, "summary": None}
        return {"exists": True, "summary": _summarize_profile(doc)}
    except Exception as e:
        return {
            "exists": False,
            "summary": None,
            "error": f"{type(e).__name__}: {e}",
        }


@app.websocket("/ws/{user_id}")
async def ws_endpoint(ws: WebSocket, user_id: str):
    await ws.accept()

    log_section(f"WebSocket 连接建立 - 用户: {user_id}")
    logger.info(f"🔗 新连接建立 | 用户ID: {user_id}")

    # Initialize user session for downstream tools
    try:
        init_session(user_id)
        logger.info(f"✅ 用户会话初始化成功")
    except Exception as e:
        logger.warning(f"⚠️ 用户会话初始化失败: {e}")
        # Continue even if session init fails; tools may handle defaults
        pass

    await ws.send_json(
        {"type": "system", "message": "Welcome to iOffer AI!", "user_id": user_id}
    )
    logger.info(f"✅ 欢迎消息已发送")

    routing_agent, user_proxy, teams = _build_workflow_context()
    interaction_count = 0

    try:
        while True:
            try:
                payload = await ws.receive_json()
                log_section("收到用户消息")
                logger.info(f"📥 原始数据: {payload}")
            except WebSocketDisconnect:
                log_section("WebSocket 连接断开")
                logger.info("🔌 连接已断开")
                break

            msg_type = str(payload.get("type", "")).strip().lower()
            data = (
                payload.get("data", {})
                if isinstance(payload.get("data", {}), dict)
                else {}
            )
            message_text = str(data.get("message", "")).strip()

            log_message_flow("IN", msg_type, message_text, user_id)

            # 检查是否包含文件信息
            file_info = data.get("file_info")
            if file_info and msg_type == "user_message":
                # 处理通过WebSocket发送的文件
                try:
                    # 保存文件到临时目录
                    import base64
                    import tempfile

                    # 从Data URL中提取文件内容
                    if file_info.get("content", "").startswith("data:"):
                        # 解析Data URL: data:image/jpeg;base64,/9j/4AAQ...
                        content_type, base64_data = file_info["content"].split(",", 1)
                        file_bytes = base64.b64decode(base64_data)

                        # 创建临时文件
                        file_ext = Path(file_info["filename"]).suffix.lower()
                        if not file_ext:
                            # 根据content-type推断扩展名
                            if "pdf" in content_type:
                                file_ext = ".pdf"
                            elif "jpeg" in content_type or "jpg" in content_type:
                                file_ext = ".jpg"
                            elif "png" in content_type:
                                file_ext = ".png"

                        with tempfile.NamedTemporaryFile(
                            delete=False, suffix=file_ext, dir=UPLOAD_DIR
                        ) as temp_file:
                            temp_file.write(file_bytes)
                            temp_file_path = temp_file.name

                        # 更新消息文本，包含文件路径
                        message_text = f"Please process and extract information from this file: {temp_file_path}"
                        await ws.send_json(
                            {
                                "type": "status",
                                "data": {
                                    "message": f"📁 文件已保存到: {temp_file_path}",
                                    "step": "file_upload",
                                },
                            }
                        )

                except Exception as e:
                    print(f"Error processing file: {e}")
                    message_text = f"Error processing file: {e}. Please try again."

            if msg_type != "user_message" or not message_text:
                await ws.send_json(
                    {
                        "type": "status",
                        "data": {
                            "status": "error",
                            "message": "Invalid message payload. Expect type=user_message with non-empty data.message.",
                            "details": {"error_code": 400},
                        },
                    }
                )
                continue

            interaction_count += 1

            # 1) Received
            await _send_status(
                ws, "Received your message. Parsing intent…", step="received"
            )

            # 2) Routing start
            await _send_status(
                ws, "Analyzing and deciding which team to route…", step="routing_start"
            )

            # Use keyword-based routing (bypassing Gemini dependency)
            routing_result = keyword_based_routing(message_text)

            # Map routing result to team keys
            team_key: Optional[str] = None
            if routing_result == "SCHOOL_REC":
                team_key = "SCHOOL_RECOMMENDATION"
            elif routing_result == "STUDENT_INFO":
                team_key = "STUDENT_INFO"
            elif routing_result == "GENERAL_QA":
                team_key = "GENERAL_QA"
            else:
                team_key = "GENERAL_QA"  # Fallback

            # 3) Routed to team
            await _send_status(
                ws,
                f"Routed to {team_key}. Preparing tools and context…",
                step="routed_to_team",
                extra_details={"team": team_key},
            )

            # 4) Tools start
            await _send_status(
                ws,
                "Running tools for your request…",
                step="tools_start",
                extra_details={"team": team_key},
            )

            team = teams.get(team_key)
            try:
                # Pass the user's original message as task
                # Set team-specific timeouts based on complexity
                if team_key == "SCHOOL_RECOMMENDATION":
                    timeout_seconds = (
                        300.0  # 5 minutes for complex school recommendations
                    )
                elif team_key == "STUDENT_INFO":
                    timeout_seconds = 120.0  # 2 minutes for profile management
                else:
                    timeout_seconds = 90.0  # 1.5 minutes for general QA

                # Use run_stream to capture messages as they happen
                team_result = await asyncio.wait_for(
                    Console(team.run_stream(task=message_text)), timeout=timeout_seconds
                )

                # Find the last meaningful message before TERMINATE
                final_message = ""
                text_message_found = False

                # First, look for TextMessage (the final user-friendly content)
                log_text_message_analysis(team_result.messages)

                for i in range(len(team_result.messages) - 1, -1, -1):
                    msg = team_result.messages[i]
                    msg_type = type(msg).__name__
                    content = _safe_get_content(msg)

                    # Check if this is a TextMessage (the final, clean answer)
                    if hasattr(msg, "__class__") and "TextMessage" in str(
                        msg.__class__
                    ):
                        if content.strip() and content.strip() != "TERMINATE":
                            final_message = content
                            text_message_found = True
                            logger.info(f"🎯 找到 TextMessage!")
                            logger.info(f"📝 内容长度: {len(content)} 字符")
                            logger.info(f"📝 完整内容: {content}")
                            break

                # If no TextMessage found, look for the last meaningful message before TERMINATE
                if not text_message_found:
                    for i in range(len(team_result.messages) - 1, -1, -1):
                        msg = team_result.messages[i]
                        content = _safe_get_content(msg)

                        # Skip TERMINATE-only messages
                        if content.strip() == "TERMINATE":
                            continue

                        # If this message contains TERMINATE, extract the content before it
                        if "TERMINATE" in content:
                            parts = content.split("TERMINATE")
                            if parts[0].strip():
                                final_message = parts[0].strip()
                                break
                        else:
                            # This is a regular message without TERMINATE
                            final_message = content
                            break

                # If we still don't have content, use the last non-empty message
                if not final_message:
                    for msg in reversed(team_result.messages):
                        content = _safe_get_content(msg)
                        if content.strip() and content.strip() != "TERMINATE":
                            final_message = content
                            print(f"Fallback: using last non-empty message")
                            break

                # Set team_text - this is the key fix!
                team_text = (
                    final_message
                    if final_message
                    else "Team completed but no content was generated."
                )

                # Log what we found
                if text_message_found:
                    logger.info(f"✅ 成功找到 TextMessage，长度: {len(team_text)} 字符")
                    logger.info(f"✅ TextMessage 内容预览: {team_text[:200]}...")
                else:
                    logger.info(
                        f"⚠️ 未找到 TextMessage，使用备选内容，长度: {len(team_text)} 字符"
                    )

                log_section("团队执行结果分析")
                log_team_execution(team_key, len(team_result.messages), team_text)
            except asyncio.TimeoutError:
                print(
                    f"Team {team_key} execution timed out after {timeout_seconds} seconds"
                )
                team_text = f"I apologize, but the {team_key} team is taking longer than expected. Please try again in a moment."
            except Exception as team_error:
                print(f"Team {team_key} execution failed: {team_error}")
                # Provide more specific error messages based on the error type
                if "TypeError" in str(team_error) and "NoneType" in str(team_error):
                    team_text = f"I apologize, but there was a technical issue with the {team_key} team. This might be due to a temporary service disruption. Please try again in a moment or contact support if the problem persists."
                elif "GroupChatError" in str(team_error):
                    team_text = f"I apologize, but there was a communication issue within the {team_key} team. Please try again or contact support if the problem persists."
                else:
                    team_text = f"I apologize, but there was an error with the {team_key} team. Please try again or contact support if the problem persists."

            # 5) Tools done
            await _send_status(
                ws,
                "Tools finished. Composing the final answer…",
                step="tools_done",
                extra_details={"team": team_key},
            )

            # Extract optional payload
            payload_obj = _try_extract_payload(team_text)

            # 6) Final result
            result_data = {
                "status": "success",
                "message": team_text,
                "meta": {
                    "team_used": team_key,
                    "interaction_count": interaction_count,
                    "content_type": "text/markdown",
                },
            }
            if payload_obj:
                result_data["payload"] = payload_obj

            log_section("构建最终结果")
            logger.info(f"🏗️ 团队: {team_key}")
            logger.info(f"📏 消息长度: {len(team_text) if team_text else 0}")
            if team_text:
                logger.info(
                    f"📋 消息内容预览: {team_text[:300]}{'...' if len(team_text) > 300 else ''}"
                )

            # Special handling for GENERAL_QA team to extract thinking process and reference links
            if team_key == "GENERAL_QA":
                try:
                    print(
                        f"🔍 Processing GENERAL_QA team result with {len(team_result.messages)} messages"
                    )

                    # Initialize tool_result variable
                    tool_result = None

                    # Always process tool results to extract thinking_process, reference_links, etc.
                    # But don't override the main message if TextMessage was found
                    if text_message_found:
                        print(f"✅ TextMessage already found, keeping original content")
                        logger.info(f"🎯 保持 TextMessage 内容: {len(team_text)} 字符")
                        logger.info(f"🎯 TextMessage 内容预览: {team_text[:200]}...")
                        print(
                            f"🔍 继续提取额外信息 (thinking_process, reference_links 等)"
                        )
                    else:
                        # Process tool results for main content
                        for i, msg in enumerate(team_result.messages):
                            print(f"Message {i}: {type(msg).__name__}")

                            # Look for ToolCallExecutionEvent messages which contain the actual tool result
                            if (
                                hasattr(msg, "content")
                                and msg.content
                                and isinstance(msg.content, str)
                            ):
                                content = msg.content.strip()
                                print(f"  Content preview: {content[:100]}...")

                                # Check if this looks like a JSON response from our tool
                                if content.startswith("{") and content.endswith("}"):
                                    try:
                                        # Try to parse as JSON to validate
                                        test_parse = json.loads(content)
                                        if (
                                            "thinking_process" in test_parse
                                            and "answer" in test_parse
                                        ):
                                            tool_result = content
                                            print(
                                                f"✅ Found tool result with thinking process: {len(tool_result)} characters"
                                            )
                                            break
                                    except Exception as parse_error:
                                        print(
                                            f"  JSON parse test failed: {parse_error}"
                                        )
                                        continue

                        # If we found a tool result, use it
                        if tool_result:
                            parsed_response = json.loads(tool_result)
                            if isinstance(parsed_response, dict):
                                # Extract the main content from JSON fields
                                if "text_summary" in parsed_response:
                                    result_data["message"] = parsed_response.get(
                                        "text_summary", team_text
                                    )
                                    print(
                                        f"✅ Using tool result text_summary: {len(parsed_response.get('text_summary', ''))} characters"
                                    )
                                elif "summary" in parsed_response:
                                    result_data["message"] = parsed_response.get(
                                        "summary", team_text
                                    )
                                    print(
                                        f"✅ Using tool result summary: {len(parsed_response.get('summary', ''))} characters"
                                    )
                                else:
                                    result_data["message"] = parsed_response.get(
                                        "answer", team_text
                                    )
                                    print(
                                        f"✅ Using tool result answer: {len(parsed_response.get('answer', ''))} characters"
                                    )

                            # Add thinking process if available
                            if "thinking_process" in parsed_response:
                                result_data["thinking_process"] = parsed_response[
                                    "thinking_process"
                                ]
                                print(
                                    f"✅ Added thinking process: {len(parsed_response['thinking_process'])} characters"
                                )

                            # Add reference links if available
                            if (
                                "reference_links" in parsed_response
                                and parsed_response["reference_links"]
                            ):
                                result_data["reference_links"] = parsed_response[
                                    "reference_links"
                                ]
                                print(
                                    f"✅ Added reference links: {len(parsed_response['reference_links'])} links"
                                )

                            # Add strategy and source information
                            if "strategy" in parsed_response:
                                result_data["meta"]["strategy"] = parsed_response[
                                    "strategy"
                                ]

                            if "source" in parsed_response:
                                result_data["meta"]["source"] = parsed_response[
                                    "source"
                                ]

                            if "rag_similarity" in parsed_response:
                                result_data["meta"]["rag_similarity"] = parsed_response[
                                    "rag_similarity"
                                ]

                    # If no tool result found, log for debugging
                    if not tool_result:
                        print(
                            f"❌ No valid tool result found in {len(team_result.messages)} messages"
                        )
                        print("Available message types:")
                        for i, msg in enumerate(team_result.messages):
                            content = _safe_get_content(msg)
                            print(
                                f"  Message {i}: {type(msg).__name__} - Content: {content[:100] if content else 'None'}..."
                            )

                        # Fallback: try to find JSON in the team_text
                        print(f"🔄 Fallback: checking team_text for JSON content")
                        if (
                            team_text
                            and team_text.strip().startswith("{")
                            and team_text.strip().endswith("}")
                        ):
                            try:
                                fallback_parse = json.loads(team_text)
                                if (
                                    "thinking_process" in fallback_parse
                                    and "answer" in fallback_parse
                                ):
                                    print(f"✅ Found JSON in team_text fallback")
                                    tool_result = team_text
                                else:
                                    print(
                                        f"❌ team_text contains JSON but missing required fields"
                                    )
                            except Exception as fallback_error:
                                print(
                                    f"❌ team_text JSON parse failed: {fallback_error}"
                                )
                        else:
                            print(
                                f"❌ team_text doesn't look like JSON: {team_text[:100] if team_text else 'None'}..."
                            )

                    # If we still have no tool result, try one more approach
                    if not tool_result:
                        print(
                            f"🔄 Final attempt: searching all messages for JSON content"
                        )
                        for i, msg in enumerate(team_result.messages):
                            content = _safe_get_content(msg)
                            if content and isinstance(content, str):
                                # Look for any JSON-like content
                                if (
                                    "{" in content
                                    and "}" in content
                                    and "thinking_process" in content
                                ):
                                    print(f"✅ Found potential JSON in message {i}")
                                    # Try to extract JSON from the content
                                    try:
                                        # Find the JSON part
                                        start = content.find("{")
                                        end = content.rfind("}") + 1
                                        json_part = content[start:end]
                                        test_parse = json.loads(json_part)
                                        if (
                                            "thinking_process" in test_parse
                                            and "answer" in test_parse
                                        ):
                                            tool_result = json_part
                                            print(
                                                f"✅ Successfully extracted JSON from message {i}"
                                            )

                                            # Immediately process this JSON to extract fields
                                            try:
                                                parsed_response = json.loads(json_part)
                                                if isinstance(parsed_response, dict):
                                                    # Extract thinking process
                                                    if (
                                                        "thinking_process"
                                                        in parsed_response
                                                    ):
                                                        result_data[
                                                            "thinking_process"
                                                        ] = parsed_response[
                                                            "thinking_process"
                                                        ]
                                                        print(
                                                            f"✅ Added thinking process: {len(parsed_response['thinking_process'])} characters"
                                                        )

                                                    # Extract reference links
                                                    if (
                                                        "reference_links"
                                                        in parsed_response
                                                        and parsed_response[
                                                            "reference_links"
                                                        ]
                                                    ):
                                                        result_data[
                                                            "reference_links"
                                                        ] = parsed_response[
                                                            "reference_links"
                                                        ]
                                                        print(
                                                            f"✅ Added reference links: {len(parsed_response['reference_links'])} links"
                                                        )

                                                    # Extract strategy and source information
                                                    if "strategy" in parsed_response:
                                                        result_data["meta"][
                                                            "strategy"
                                                        ] = parsed_response["strategy"]
                                                    if "source" in parsed_response:
                                                        result_data["meta"][
                                                            "source"
                                                        ] = parsed_response["source"]
                                                    if (
                                                        "rag_similarity"
                                                        in parsed_response
                                                    ):
                                                        result_data["meta"][
                                                            "rag_similarity"
                                                        ] = parsed_response[
                                                            "rag_similarity"
                                                        ]

                                                    print(
                                                        f"✅ Successfully extracted all fields from JSON"
                                                    )
                                            except Exception as process_error:
                                                print(
                                                    f"❌ Error processing extracted JSON: {process_error}"
                                                )

                                            break
                                    except Exception as extract_error:
                                        print(
                                            f"❌ JSON extraction failed: {extract_error}"
                                        )
                                        continue

                except (json.JSONDecodeError, TypeError) as e:
                    print(f"❌ JSON parsing failed for GENERAL_QA: {e}")
                    # If not JSON, use the original text
                    pass

            # Special handling for SCHOOL_RECOMMENDATION team to extract thinking process
            elif team_key == "SCHOOL_RECOMMENDATION":
                try:
                    print(f"🔍 Processing SCHOOL_RECOMMENDATION team result")

                    # Look for thinking process in the team_text
                    if team_text and "=== THINKING PROCESS ===" in team_text:
                        # Split the response into sections
                        parts = team_text.split("=== THINKING PROCESS ===")
                        if len(parts) >= 2:
                            thinking_part = (
                                parts[1].split("=== FINAL ANALYSIS ===")[0].strip()
                            )

                            # Extract final analysis and reference links
                            remaining_parts = parts[1].split("=== FINAL ANALYSIS ===")
                            if len(remaining_parts) >= 2:
                                analysis_and_links = remaining_parts[1].split(
                                    "=== REFERENCE LINKS ==="
                                )
                                analysis_part = analysis_and_links[0].strip()

                                # Extract reference links if available
                                reference_links = []
                                if len(analysis_and_links) >= 2:
                                    links_text = analysis_and_links[1].strip()
                                    # Extract URLs from the reference links section
                                    import re

                                    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
                                    urls = re.findall(url_pattern, links_text)

                                    print(f"🔍 Raw URLs found: {urls}")

                                    # Clean and deduplicate URLs
                                    cleaned_urls = []
                                    seen_urls = set()

                                    for url in urls:
                                        # Validate and clean the URL
                                        clean_url = _validate_and_clean_url(url)

                                        # Only add if it's a valid URL and not a duplicate
                                        if clean_url and clean_url not in seen_urls:
                                            cleaned_urls.append(clean_url)
                                            seen_urls.add(clean_url)

                                    reference_links = cleaned_urls[
                                        :10
                                    ]  # Limit to 10 unique links
                                    print(
                                        f"🔗 Extracted {len(reference_links)} unique reference links from SCHOOL_RECOMMENDATION"
                                    )
                                    print(f"🔗 Cleaned URLs: {reference_links}")

                                # Update the message to show only the analysis part
                                result_data["message"] = (
                                    analysis_part if analysis_part else team_text
                                )

                                # Add thinking process
                                result_data["thinking_process"] = thinking_part
                                print(
                                    f"✅ Added thinking process for SCHOOL_RECOMMENDATION: {len(thinking_part)} characters"
                                )

                                # Add reference links if found
                                if reference_links:
                                    result_data["reference_links"] = reference_links
                                    print(
                                        f"✅ Added reference links for SCHOOL_RECOMMENDATION: {len(reference_links)} links"
                                    )

                                # Add team-specific metadata
                                result_data["meta"][
                                    "team_type"
                                ] = "school_recommendation"
                                result_data["meta"][
                                    "analysis_type"
                                ] = "comprehensive_evaluation"

                except Exception as e:
                    print(
                        f"❌ Error processing SCHOOL_RECOMMENDATION thinking process: {e}"
                    )
                    pass

            # Special handling for STUDENT_INFO team to extract thinking process
            elif team_key == "STUDENT_INFO":
                try:
                    print(f"🔍 Processing STUDENT_INFO team result")
                    print(
                        f"📝 Raw team_text (first 500 chars): {team_text[:500] if team_text else 'None'}"
                    )

                    # First, try to extract JSON response for development team use
                    json_data = None
                    json_extracted = False
                    if team_text and "{" in team_text and "}" in team_text:
                        try:
                            # Look for JSON content in the response
                            start_idx = team_text.find("{")
                            end_idx = team_text.rfind("}") + 1
                            if start_idx != -1 and end_idx != -1:
                                json_str = team_text[start_idx:end_idx]
                                json_data = json.loads(json_str)
                                print(
                                    f"✅ Extracted JSON response for STUDENT_INFO: {len(json_str)} characters"
                                )

                                # Extract thinking process and profile summary from JSON
                                if json_data:
                                    if "thinking_process" in json_data:
                                        result_data["thinking_process"] = json_data[
                                            "thinking_process"
                                        ]
                                        print(
                                            f"✅ Added thinking process from JSON: {len(json_data['thinking_process'])} characters"
                                        )

                                    if "profile_summary" in json_data:
                                        result_data["message"] = json_data[
                                            "profile_summary"
                                        ]
                                        print(
                                            f"✅ Added profile summary from JSON: {len(json_data['profile_summary'])} characters"
                                        )

                                    # Add additional JSON fields for development team use
                                    result_data["json_response"] = json_data

                                    # Add team-specific metadata
                                    result_data["meta"]["team_type"] = "student_info"
                                    result_data["meta"][
                                        "analysis_type"
                                    ] = "profile_management"
                                    result_data["meta"]["has_json"] = True

                                    # Mark that we successfully extracted JSON
                                    json_extracted = True
                        except json.JSONDecodeError as e:
                            print(f"⚠️ JSON parsing failed for STUDENT_INFO: {e}")
                            # Continue with regular parsing

                    # Only do fallback parsing if JSON extraction failed
                    if not json_extracted:
                        # Look for thinking process in the team_text (fallback to regular parsing)
                        if team_text and "=== THINKING PROCESS ===" in team_text:
                            # Split the response into sections
                            parts = team_text.split("=== THINKING PROCESS ===")
                            if len(parts) >= 2:
                                # Extract thinking process (everything after === THINKING PROCESS === until the next === or end)
                                thinking_part = parts[1]

                                # Look for the next section marker
                                if "=== PROFILE SUMMARY ===" in thinking_part:
                                    thinking_part = thinking_part.split(
                                        "=== PROFILE SUMMARY ==="
                                    )[0].strip()
                                    summary_part = (
                                        parts[1]
                                        .split("=== PROFILE SUMMARY ===")[1]
                                        .strip()
                                    )

                                    # Update the message to show only the summary part
                                    result_data["message"] = (
                                        summary_part if summary_part else team_text
                                    )
                                else:
                                    # If no PROFILE SUMMARY section, the thinking process goes until the end
                                    # Remove "TERMINATE" if present
                                    thinking_part = thinking_part.replace(
                                        "TERMINATE", ""
                                    ).strip()
                                    # The message remains as the full team_text
                                    result_data["message"] = team_text

                                # Add thinking process
                                result_data["thinking_process"] = thinking_part
                                print(
                                    f"✅ Added thinking process for STUDENT_INFO: {len(thinking_part)} characters"
                                )

                                # Add team-specific metadata
                                result_data["meta"]["team_type"] = "student_info"
                                result_data["meta"][
                                    "analysis_type"
                                ] = "profile_management"
                            else:
                                print(
                                    f"⚠️ STUDENT_INFO response has === THINKING PROCESS === but can't parse sections properly"
                                )
                        else:
                            print(
                                f"⚠️ STUDENT_INFO response missing === THINKING PROCESS === section"
                            )
                            # Try to extract any thinking-like content from the beginning of the response
                            if team_text and len(team_text) > 100:
                                # Look for natural thinking indicators in the first few sentences
                                first_sentences = team_text[:200]
                                if any(
                                    indicator in first_sentences.lower()
                                    for indicator in [
                                        "i've analyzed",
                                        "looking at",
                                        "based on",
                                        "i can see",
                                        "examining",
                                    ]
                                ):
                                    thinking_part = first_sentences.strip()
                                    result_data["thinking_process"] = thinking_part
                                    print(
                                        f"✅ Extracted implicit thinking process for STUDENT_INFO: {len(thinking_part)} characters"
                                    )
                                    result_data["meta"]["team_type"] = "student_info"
                                    result_data["meta"][
                                        "analysis_type"
                                    ] = "profile_management"

                except Exception as e:
                    print(f"❌ Error processing STUDENT_INFO thinking process: {e}")
                    pass

            await ws.send_json({"type": "result", "data": result_data})

    except Exception as e:
        log_section("错误处理")
        logger.error(f"❌ 发生错误: {e}")
        await _send_error(ws, user_message="", exc=e)
    finally:
        try:
            await ws.close()
            log_section("连接关闭")
            logger.info(f"🔌 WebSocket 连接已关闭 | 用户: {user_id}")
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

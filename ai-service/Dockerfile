# 使用官方Python镜像，包含预编译的科学计算库
FROM python:3.12-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖 (包含ChromaDB所需的sqlite3)
RUN apt-get update && apt-get install -y \
    build-essential \
    libomp-dev \
    libgomp1 \
    curl \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制项目文件
COPY . .

# 安装Python依赖
RUN pip install --no-cache-dir uv && \
    uv sync --no-dev

# 准备RAG设置脚本（运行时执行，避免构建时依赖问题）
# 1. 赋予脚本执行权限
# 2. 创建基础目录结构
# 3. RAG初始化将在容器启动时进行
RUN chmod +x run_rag_setup.sh && \
    chmod +x run_langchain_rag_setup_docker.sh && \
    mkdir -p data logs

# 暴露端口（AI服务8000）
EXPOSE 8000

# 设置环境变量
ENV PYTHONPATH=/app
ENV OMP_NUM_THREADS=4

# 设置entrypoint脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 启动命令 - 使用entrypoint脚本
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["uv", "run", "python", "api_server.py"]
# 使用官方Python镜像，包含预编译的科学计算库
FROM python:3.12-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    libomp-dev \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制项目文件
COPY . .

# 安装Python依赖
RUN pip install --no-cache-dir uv && \
    uv sync --no-dev

# 暴露端口（AI服务8010）
EXPOSE 8010

# 设置环境变量
ENV PYTHONPATH=/app
ENV OMP_NUM_THREADS=4

# 启动命令 - 直接运行api_server.py
CMD ["uv", "run", "python", "api_server.py"]
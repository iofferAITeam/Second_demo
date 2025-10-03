# 使用Node.js 18 Alpine镜像
FROM node:18-alpine

# 安装必要的系统依赖
RUN apk add --no-cache openssl openssl-dev libc6-compat

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 全局安装TypeScript和ts-node以及wait-port
RUN npm install -g typescript ts-node wait-port

# 复制源代码
COPY . .

# 复制启动脚本
COPY scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh

# 暴露端口
EXPOSE 8001

# 使用启动脚本（包含数据库初始化）
CMD ["/app/scripts/start.sh"]
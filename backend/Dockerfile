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

# 全局安装TypeScript和ts-node
RUN npm install -g typescript ts-node

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 暴露端口
EXPOSE 8001

# 启动开发服务器（跳过迁移直接启动）
CMD ["npm", "run", "dev"]
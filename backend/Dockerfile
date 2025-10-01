# 后端 Dockerfile
FROM node:18-alpine

# 安装 OpenSSL 和其他必要的库
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 安装 TypeScript 和 ts-node
RUN npm install -g typescript ts-node

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 暴露端口
EXPOSE 8001

# 启动命令
CMD ["npm", "run", "dev"]
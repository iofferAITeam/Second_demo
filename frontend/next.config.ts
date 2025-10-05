import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用standalone模式，用于Docker生产构建
  output: 'standalone',

  // 环境变量配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'College Recommendation System',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // 生产优化
  experimental: {
    // 启用服务器端渲染优化
    serverComponentsExternalPackages: [],
  },

  // 图片优化配置
  images: {
    domains: [],
    unoptimized: false,
  },
};

export default nextConfig;

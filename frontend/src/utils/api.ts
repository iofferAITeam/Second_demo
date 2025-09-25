// 前端API客户端 - 用于调用后端API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8010/api'

// 通用请求函数
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.statusText}`)
  }

  return response.json()
}

// 认证相关API调用
export const authApi = {
  // 用户登录
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  // 用户注册
  register: async (email: string, password: string, name: string) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  },

  // 用户登出
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    })
  },
}

// 用户相关API调用
export const userApi = {
  // 获取用户资料
  getProfile: async () => {
    return apiRequest('/user/profile')
  },

  // 更新用户资料
  updateProfile: async (profileData: any) => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },
}

// 聊天相关API调用
export const chatApi = {
  // 发送消息
  sendMessage: async (message: string) => {
    return apiRequest('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  },

  // 获取聊天历史
  getChatHistory: async () => {
    return apiRequest('/chat/history')
  },
}

// 推荐相关API调用
export const recommendationApi = {
  // 获取学校推荐
  getRecommendations: async (preferences: any) => {
    return apiRequest('/recommendations', {
      method: 'POST',
      body: JSON.stringify(preferences),
    })
  },
}
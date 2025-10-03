import { getToken, getUserIdFromToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export interface ApiResponse<T = any> {
  success?: boolean
  message?: string
  error?: string
  data?: T
}

export interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: string
  teamUsed?: string
  confidence?: number
  thinkingProcess?: string
  referenceLinks?: string[]
  strategy?: string
  source?: string
  fallback?: boolean
}

export interface ChatResponse {
  message: string
  thinking_process?: string
  reference_links?: string[]
  strategy?: string
  source?: string
  rag_similarity?: number
  team_used: string
  timestamp: string
  status?: string
  confidence?: number
  fallback?: boolean
}

export interface ChatSession {
  id: string
  title: string
  userId: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage?: string
}

export interface SessionResponse {
  message: string
  session: ChatSession
}

export interface SessionsResponse {
  sessions: ChatSession[]
}

export interface MessagesResponse {
  messages: ChatMessage[]
  total?: number
}

export interface SessionMessagesResponse {
  sessionId: string
  messages: ChatMessage[]
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken()

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, redirect to login
        window.location.href = '/auth'
        throw new Error('Unauthorized')
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Chat API
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    // 使用正确的聊天端点（不需要 /api 前缀）
    return this.request<ChatResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        sessionId
      }),
    })
  }

  async getChatHistory(limit = 50, offset = 0): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(`/api/chat/history?limit=${limit}&offset=${offset}`)
  }

  async createSession(title?: string): Promise<SessionResponse> {
    return this.request<SessionResponse>('/api/chat/session', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
  }

  async getSessions(): Promise<SessionsResponse> {
    return this.request<SessionsResponse>('/api/chat/sessions')
  }

  async deleteSession(sessionId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/chat/session/${sessionId}`, {
      method: 'DELETE',
    })
  }

  async getSessionMessages(sessionId: string): Promise<SessionMessagesResponse> {
    return this.request<SessionMessagesResponse>(`/api/chat/session/${sessionId}/messages`)
  }

  // User API
  async getProfile() {
    return this.request('/api/user/profile')
  }

  async updateProfile(data: any) {
    return this.request('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Upload API (when fixed)
  async uploadFile(file: File, type: 'avatar' | 'document') {
    const formData = new FormData()
    formData.append(type, file)

    const token = getToken()
    const response = await fetch(`${API_BASE_URL}/api/upload/${type}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }
}

export const api = new ApiClient()
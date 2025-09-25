const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
  user?: T
  accessToken?: string
  refreshToken?: string
  tokenRefreshed?: boolean
  newTokens?: {
    accessToken: string
    refreshToken: string
  }
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout: number = 10000
  private isRefreshing: boolean = false
  private refreshPromise: Promise<any> | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout
    } = config

    const url = `${this.baseURL}${endpoint}`

    // 设置默认headers
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 如果有access token，添加到headers
    const accessToken = this.getAccessToken()
    if (accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${accessToken}`
    }

    const requestHeaders = { ...defaultHeaders, ...headers }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // 检查是否有自动刷新的token
      const tokenRefreshed = response.headers.get('X-Token-Refreshed')
      const newAccessToken = response.headers.get('X-New-Access-Token')
      const newRefreshToken = response.headers.get('X-New-Refresh-Token')

      if (tokenRefreshed === 'true' && newAccessToken && newRefreshToken) {
        console.log('Tokens auto-refreshed by server')
        this.setAccessToken(newAccessToken)
        this.setRefreshToken(newRefreshToken)
      }

      const data = await response.json()

      // 处理响应体中的token更新
      if (data.tokenRefreshed && data.newTokens) {
        console.log('Tokens updated in response body')
        this.setAccessToken(data.newTokens.accessToken)
        this.setRefreshToken(data.newTokens.refreshToken)
      }

      if (!response.ok) {
        // 如果是401错误且不是refresh请求，尝试刷新token
        if (response.status === 401 && endpoint !== '/api/auth/refresh') {
          const refreshResult = await this.handleTokenRefresh()
          if (refreshResult) {
            // 重试原请求
            return this.request(endpoint, config)
          }
        }
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // 处理token刷新
  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      // 如果正在刷新，等待刷新完成
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      this.clearTokens()
      return false
    }

    this.isRefreshing = true
    this.refreshPromise = this.refreshTokens(refreshToken)

    try {
      const result = await this.refreshPromise
      this.isRefreshing = false
      this.refreshPromise = null
      return result
    } catch (error) {
      this.isRefreshing = false
      this.refreshPromise = null
      this.clearTokens()
      return false
    }
  }

  // 刷新token
  private async refreshTokens(refreshToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.accessToken && data.refreshToken) {
        this.setAccessToken(data.accessToken)
        this.setRefreshToken(data.refreshToken)
        console.log('Tokens refreshed successfully')
        return true
      } else {
        console.error('Token refresh failed:', data.error)
        return false
      }
    } catch (error) {
      console.error('Token refresh request failed:', error)
      return false
    }
  }

  // Token管理 - 更新为双token系统
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token)
    }
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken)
    this.setRefreshToken(refreshToken)
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      // 为了兼容性，也清除旧的token
      localStorage.removeItem('auth_token')
    }
  }

  // 兼容性方法
  private getToken(): string | null {
    return this.getAccessToken()
  }

  setToken(token: string): void {
    this.setAccessToken(token)
  }

  removeToken(): void {
    this.clearTokens()
  }

  // 认证相关API
  async login(email: string, password: string) {
    const response = await this.request<any>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    // 登录成功后保存双token
    if (response.success && response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken)
    }

    return response
  }

  async register(email: string, name: string, password: string) {
    const response = await this.request<any>('/api/auth/register', {
      method: 'POST',
      body: { email, name, password }
    })

    // 注册成功后保存双token
    if (response.success && response.accessToken && response.refreshToken) {
      this.setTokens(response.accessToken, response.refreshToken)
    }

    return response
  }

  async verify() {
    return this.request<any>('/api/auth/verify', {
      method: 'GET'
    })
  }

  async logout() {
    const response = await this.request<any>('/api/auth/logout', {
      method: 'POST'
    })

    // 登出后清除所有token
    this.clearTokens()

    return response
  }

  // 手动刷新token的公共方法
  async refreshToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    return this.refreshTokens(refreshToken)
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  // 通用GET请求
  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  // 通用POST请求
  async post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  // 通用PUT请求
  async put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  // 通用DELETE请求
  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// 创建默认实例
export const apiClient = new ApiClient()
export default apiClient
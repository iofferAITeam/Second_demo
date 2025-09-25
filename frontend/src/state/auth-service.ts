import { AuthState, User, LoginRequest, RegisterRequest } from '../types/auth'
import { apiClient } from '../utils/api-client'

type AuthListener = (state: AuthState) => void

class AuthService {
  private static instance: AuthService
  private state: AuthState = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
  }
  private listeners: Set<AuthListener> = new Set()

  private constructor() {
    // 初始化时检查本地token
    this.initialize()
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // 订阅状态变化
  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener)
    // 返回取消订阅的函数
    return () => {
      this.listeners.delete(listener)
    }
  }

  // 通知所有监听器
  private notify() {
    this.listeners.forEach(listener => listener(this.state))
  }

  // 更新状态
  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState }
    this.notify()
  }

  // 获取当前状态
  getState(): AuthState {
    return { ...this.state }
  }

  // 初始化：检查本地token并验证
  private async initialize() {
    // 首先尝试迁移旧token（向后兼容）
    const legacyMigrated = this.migrateLegacyToken()
    if (legacyMigrated) {
      console.log('Migrated legacy token to dual-token system')
    }

    const accessToken = apiClient['getAccessToken']()
    if (!accessToken) {
      this.setState({ isLoading: false })
      return
    }

    this.setState({ isLoading: true })

    try {
      const response = await apiClient.verify()

      if (response.user) {
        this.setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        throw new Error('Invalid token')
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      // 清除所有token（包括refresh token）
      apiClient.clearTokens()
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }

  // 迁移旧token到新系统
  private migrateLegacyToken(): boolean {
    if (typeof window === 'undefined') return false

    const legacyToken = localStorage.getItem('auth_token')
    if (legacyToken && !apiClient['getAccessToken']()) {
      // 将旧token作为access token保存（没有refresh token）
      apiClient.setAccessToken(legacyToken)
      localStorage.removeItem('auth_token')
      return true
    }

    return false
  }

  // 登录
  async signIn(credentials: LoginRequest): Promise<void> {
    this.setState({ isLoading: true, error: null })

    try {
      const response = await apiClient.login(credentials.email, credentials.password)

      if (response.success && response.user && response.accessToken && response.refreshToken) {
        // 保存双token（apiClient.login已经在内部处理了）
        this.setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      this.setState({
        isLoading: false,
        error: errorMessage,
      })
      throw error
    }
  }

  // 注册
  async signUp(data: RegisterRequest): Promise<void> {
    this.setState({ isLoading: true, error: null })

    try {
      const response = await apiClient.register(data.email, data.name, data.password)

      if (response.success && response.user && response.accessToken && response.refreshToken) {
        // 保存双token（apiClient.register已经在内部处理了）
        this.setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })
      } else {
        throw new Error(response.error || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      this.setState({
        isLoading: false,
        error: errorMessage,
      })
      throw error
    }
  }

  // 登出
  async signOut(): Promise<void> {
    this.setState({ isLoading: true })

    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      // 无论请求是否成功，都清除本地状态（apiClient.logout已经在内部处理了）
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  }

  // 更新用户信息
  updateUser(user: Partial<User>): void {
    if (this.state.user) {
      this.setState({
        user: { ...this.state.user, ...user }
      })
    }
  }

  // 清除错误
  clearError(): void {
    this.setState({ error: null })
  }

  // 刷新用户信息
  async refreshUser(): Promise<void> {
    if (!this.state.isAuthenticated) return

    try {
      const response = await apiClient.verify()
      if (response.user) {
        this.setState({ user: response.user })
      }
    } catch (error) {
      console.error('Failed to refresh user info:', error)
    }
  }

  // 手动刷新token
  async refreshToken(): Promise<boolean> {
    try {
      const success = await apiClient.refreshToken()
      if (!success) {
        // Token刷新失败，登出用户
        this.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Session expired, please login again',
        })
      }
      return success
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Token刷新失败，登出用户
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired, please login again',
      })
      return false
    }
  }

  // 检查token是否即将过期并自动刷新
  async checkAndRefreshToken(): Promise<void> {
    if (!this.state.isAuthenticated) return

    const isExpiringSoon = this.isTokenExpiringSoon()
    if (isExpiringSoon) {
      console.log('Access token is expiring soon, attempting refresh...')
      await this.refreshToken()
    }
  }

  // 检查access token是否即将过期
  private isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const accessToken = apiClient['getAccessToken']()
    if (!accessToken) return true

    try {
      // 简单解析JWT payload (不验证签名)
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const exp = payload.exp * 1000 // 转换为毫秒
      const now = Date.now()
      const threshold = thresholdMinutes * 60 * 1000 // 转换为毫秒

      return (exp - now) <= threshold
    } catch (error) {
      console.error('Error parsing access token:', error)
      return true // 解析失败时认为token无效
    }
  }
}

// 导出单例实例
export const authService = AuthService.getInstance()
export default authService
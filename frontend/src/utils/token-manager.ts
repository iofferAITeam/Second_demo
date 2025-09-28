export interface TokenData {
  accessToken: string
  refreshToken: string
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private static readonly LEGACY_TOKEN_KEY = 'auth_token'

  // 获取access token
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  // 获取refresh token
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  // 设置access token
  static setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token)
    }
  }

  // 设置refresh token
  static setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
    }
  }

  // 设置双token
  static setTokens(tokenData: TokenData): void {
    this.setAccessToken(tokenData.accessToken)
    this.setRefreshToken(tokenData.refreshToken)
  }

  // 获取双token
  static getTokens(): TokenData | null {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()

    if (!accessToken || !refreshToken) {
      return null
    }

    return { accessToken, refreshToken }
  }

  // 清除所有token
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
      // 清除旧的legacy token
      localStorage.removeItem(this.LEGACY_TOKEN_KEY)
    }
  }

  // 检查用户是否已登录
  static isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }

  // 检查access token是否即将过期 (JWT decode without verification)
  static isAccessTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const token = this.getAccessToken()
    if (!token) return true

    try {
      // 简单解析JWT payload (不验证签名)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000 // 转换为毫秒
      const now = Date.now()
      const threshold = thresholdMinutes * 60 * 1000 // 转换为毫秒

      return (exp - now) <= threshold
    } catch (error) {
      console.error('Error parsing access token:', error)
      return true // 解析失败时认为token无效
    }
  }

  // 迁移旧token到新系统 (向后兼容性)
  static migrateLegacyToken(): boolean {
    if (typeof window === 'undefined') return false

    const legacyToken = localStorage.getItem(this.LEGACY_TOKEN_KEY)
    if (legacyToken && !this.getAccessToken()) {
      // 将旧token作为access token保存
      this.setAccessToken(legacyToken)
      localStorage.removeItem(this.LEGACY_TOKEN_KEY)
      console.log('Migrated legacy token to new token system')
      return true
    }

    return false
  }

  // Token事件监听器 (跨标签页同步)
  static onTokenChange(callback: (tokens: TokenData | null) => void): () => void {
    if (typeof window === 'undefined') return () => {}

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === this.ACCESS_TOKEN_KEY ||
        event.key === this.REFRESH_TOKEN_KEY
      ) {
        const tokens = this.getTokens()
        callback(tokens)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // 返回清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }
}

export default TokenManager
// Token storage keys
const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

// Get access token from localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

// Set access token in localStorage
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
}

// Remove access token from localStorage
export const removeToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
}

// Get refresh token from localStorage
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// Set refresh token in localStorage
export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

// Remove refresh token from localStorage
export const removeRefreshToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Clear all authentication tokens
export const clearAuthTokens = (): void => {
  removeToken()
  removeRefreshToken()
}

// Check if user is authenticated
// NOTE: This only checks if an access token EXISTS, not if it's expired
// Token refresh is handled automatically by the API client on 401 responses
export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) return false

  try {
    // Validate token format (but don't check expiry - refresh handles that)
    const payload = JSON.parse(atob(token.split('.')[1]))
    return !!payload && !!payload.userId
  } catch (error) {
    // Invalid token format
    return false
  }
}

// Check if token is expired (for display purposes only)
export const isTokenExpired = (): boolean => {
  const token = getToken()
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp <= currentTime
  } catch (error) {
    return true
  }
}

// Get user ID from token
export const getUserIdFromToken = (): string | null => {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.sub || null
  } catch (error) {
    return null
  }
}

// Get user data from token
export const getUserDataFromToken = (): any | null => {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.userId || payload.sub,
      email: payload.email,
      name: payload.name,
      exp: payload.exp,
      iat: payload.iat
    }
  } catch (error) {
    return null
  }
}
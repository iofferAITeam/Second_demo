/**
 * Redirect utilities for handling post-authentication navigation
 */

export const REDIRECT_STORAGE_KEY = 'auth_redirect_url'

/**
 * Stores the current URL for redirect after authentication
 * @param url - The URL to redirect to after login/signup
 */
export function storeRedirectUrl(url: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(REDIRECT_STORAGE_KEY, url)
  }
}

/**
 * Gets the stored redirect URL and clears it from storage
 * @param fallback - Default URL if no redirect URL is stored
 * @returns The redirect URL or fallback
 */
export function getAndClearRedirectUrl(fallback: string = '/dashboard'): string {
  if (typeof window === 'undefined') {
    return fallback
  }

  const url = sessionStorage.getItem(REDIRECT_STORAGE_KEY)
  if (url) {
    sessionStorage.removeItem(REDIRECT_STORAGE_KEY)
    return url
  }

  return fallback
}

/**
 * Creates a login URL with redirect parameter
 * @param redirectUrl - URL to redirect to after login
 * @returns Login URL with redirect parameter
 */
export function createLoginUrl(redirectUrl: string): string {
  const loginUrl = new URL('/auth', window.location.origin)
  loginUrl.searchParams.set('redirect', redirectUrl)
  return loginUrl.toString()
}

/**
 * Redirects to login page with current URL as redirect parameter
 */
export function redirectToLogin(): void {
  if (typeof window !== 'undefined') {
    const currentUrl = window.location.pathname + window.location.search
    window.location.href = createLoginUrl(currentUrl)
  }
}
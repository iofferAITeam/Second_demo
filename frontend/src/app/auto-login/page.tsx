'use client'

import { useEffect, useState } from 'react'
import { setupTestAuth } from '@/utils/auth-setup'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AutoLoginPage() {
  const router = useRouter()
  const { isAuthenticated, user, checkAuth } = useAuth()
  const [authStatus, setAuthStatus] = useState<string>('checking')

  useEffect(() => {
    // 检查当前认证状态
    if (isAuthenticated && user) {
      setAuthStatus(`已登录为: ${user.email}`)
      // 已经认证，直接跳转
      const timer = setTimeout(() => {
        router.push('/recommendations')
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      // 未认证，设置测试认证令牌
      setAuthStatus('未登录，正在设置测试令牌...')
      setupTestAuth()

      // 重新检查认证状态
      setTimeout(() => {
        checkAuth()
      }, 1000)

      // 3秒后跳转到 recommendations 页面
      const timer = setTimeout(() => {
        router.push('/recommendations')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [router, isAuthenticated, user, checkAuth])

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'monospace' }}>
      <h1>🔧 认证状态检查</h1>
      <p>{authStatus}</p>
      <p>即将自动跳转到推荐页面</p>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => router.push('/recommendations')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          立即跳转到推荐页面
        </button>
      </div>
    </div>
  )
}
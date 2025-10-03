'use client'

import { useState } from 'react'
import { apiClient } from '@/utils/api-client'

export default function TestLoginPage() {
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🔍 Attempting login with:', { email, password })
      const response = await apiClient.login(email, password)
      console.log('✅ Login response:', response)
      setResult(response)

      // 如果登录成功，测试 API 调用
      if (response.success) {
        console.log('🔍 Testing authenticated API call...')
        const apiResponse = await apiClient.get('/api/recommendations/latest')
        console.log('✅ API test successful:', apiResponse)
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectLogin = () => {
    // 直接设置测试令牌
    apiClient.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDU3NjQ1LCJleHAiOjE3NjAwNjI0NDV9.t8k8SwQia_CNG2AmWf1otS45wOJ0MzH5bvXub-zHlxg')
    setResult({ success: true, message: 'Direct token set successfully' })
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🧪 登录测试页面</h1>

      <div style={{ marginBottom: '20px' }}>
        <h3>方法 1: 正常登录流程</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>邮箱:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>密码:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>方法 2: 直接设置测试令牌</h3>
        <button
          onClick={handleDirectLogin}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          直接设置测试令牌
        </button>
      </div>

      {error && (
        <div style={{
          color: 'red',
          padding: '10px',
          border: '1px solid red',
          borderRadius: '4px',
          marginBottom: '20px',
          backgroundColor: '#ffebee'
        }}>
          <strong>错误:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          padding: '10px',
          border: '1px solid green',
          borderRadius: '4px',
          backgroundColor: '#e8f5e8'
        }}>
          <h3>结果:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>快捷链接:</h3>
        <a
          href="/auto-login"
          style={{
            display: 'inline-block',
            padding: '10px 15px',
            backgroundColor: '#ffc107',
            color: 'black',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          自动登录页面
        </a>
        <a
          href="/recommendations"
          style={{
            display: 'inline-block',
            padding: '10px 15px',
            backgroundColor: '#17a2b8',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          推荐页面
        </a>
      </div>
    </div>
  )
}
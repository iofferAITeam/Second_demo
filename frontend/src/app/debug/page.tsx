'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [apiConfig, setApiConfig] = useState<any>({})
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    // 动态导入 API 客户端以获取配置
    import('@/utils/api-client').then((module) => {
      const apiClient = module.apiClient
      setApiConfig({
        isAuthenticated: apiClient.isAuthenticated(),
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
        accessToken: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      })
    })
  }, [])

  const testBasicFetch = async () => {
    setTestResult('正在测试...')

    try {
      console.log('🔍 Starting basic fetch test...')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/health`)
      console.log('🔍 Health check response:', response)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Health check data:', data)
        setTestResult(`✅ 后端健康检查成功：${JSON.stringify(data, null, 2)}`)
      } else {
        setTestResult(`❌ 健康检查失败：状态 ${response.status}`)
      }
    } catch (error: any) {
      console.error('❌ 健康检查错误:', error)
      setTestResult(`❌ 健康检查错误：${error.message}`)
    }
  }

  const testLoginAPI = async () => {
    setTestResult('正在测试登录 API...')

    try {
      console.log('🔍 Testing login API...')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      console.log('🔍 Login response:', response)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Login successful:', data)

        // 保存令牌
        if (data.accessToken) {
          localStorage.setItem('access_token', data.accessToken)
          localStorage.setItem('refresh_token', data.refreshToken)
        }

        setTestResult(`✅ 登录成功：${JSON.stringify(data, null, 2)}`)
      } else {
        const errorData = await response.text()
        setTestResult(`❌ 登录失败：状态 ${response.status} - ${errorData}`)
      }
    } catch (error: any) {
      console.error('❌ 登录错误:', error)
      setTestResult(`❌ 登录错误：${error.message}`)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🔍 系统诊断页面</h1>

      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>📊 配置信息</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '3px' }}>
          {JSON.stringify(apiConfig, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>🧪 测试功能</h2>
        <button
          onClick={testBasicFetch}
          style={{
            padding: '10px 20px',
            margin: '5px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px'
          }}
        >
          测试后端健康检查
        </button>
        <button
          onClick={testLoginAPI}
          style={{
            padding: '10px 20px',
            margin: '5px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px'
          }}
        >
          测试登录 API
        </button>
      </div>

      {testResult && (
        <div style={{
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3>测试结果:</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{testResult}</pre>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
        <p><strong>调试说明:</strong></p>
        <ul>
          <li>检查浏览器开发者工具的 Console 和 Network 标签</li>
          <li>确认后端服务运行在 http://localhost:8001</li>
          <li>确认前端服务运行在 http://localhost:3005</li>
          <li>检查 CORS 配置是否正确</li>
        </ul>
      </div>
    </div>
  )
}
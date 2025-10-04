'use client'

import { useState } from 'react'

export default function SimpleTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDirectFetch = async () => {
    setLoading(true)
    setResult('')

    try {
      console.log('🔍 Testing direct fetch to backend...')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Login successful:', data)
        setResult('✅ 登录成功！' + JSON.stringify(data, null, 2))
      } else {
        const errorText = await response.text()
        console.error('❌ Login failed:', errorText)
        setResult('❌ 登录失败：' + errorText)
      }
    } catch (error: any) {
      console.error('❌ Fetch error:', error)
      setResult('❌ 网络错误：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testApiConnection = async () => {
    setLoading(true)
    setResult('')

    try {
      console.log('🔍 Testing basic API connection...')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/recommendations/latest`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDU3NjQ1LCJleHAiOjE3NjAwNjI0NDV9.t8k8SwQia_CNG2AmWf1otS45wOJ0MzH5bvXub-zHlxg',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ API call successful:', data)
        setResult('✅ API 连接成功！获取到推荐数据')
      } else {
        const errorText = await response.text()
        console.error('❌ API call failed:', errorText)
        setResult('❌ API 调用失败：' + errorText)
      }
    } catch (error: any) {
      console.error('❌ API error:', error)
      setResult('❌ API 错误：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 简化测试页面</h1>
      <p>这个页面用于测试基本的 API 连接，不依赖任何复杂的组件。</p>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testDirectFetch}
          disabled={loading}
          style={{
            padding: '15px 25px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px',
            fontSize: '16px'
          }}
        >
          {loading ? '测试中...' : '测试直接登录'}
        </button>

        <button
          onClick={testApiConnection}
          disabled={loading}
          style={{
            padding: '15px 25px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? '测试中...' : '测试 API 连接'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '20px',
          border: '2px solid #007bff',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          marginTop: '20px'
        }}>
          <h3>测试结果:</h3>
          <pre style={{
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            backgroundColor: '#e9ecef',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {result}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p><strong>说明:</strong></p>
        <ul>
          <li>"测试直接登录" - 直接调用后端登录 API (POST /api/auth/login)</li>
          <li>"测试 API 连接" - 使用有效令牌测试推荐 API (GET /api/recommendations/latest)</li>
          <li>打开浏览器开发者工具查看详细的网络请求和控制台日志</li>
        </ul>
      </div>
    </div>
  )
}
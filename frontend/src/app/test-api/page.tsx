'use client'

import { useState, useEffect } from 'react'

export default function TestApiPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setLoading(true)
    setError(null)

    try {
      // 使用测试token
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzU5NDU1MDQyLCJleHAiOjE3NjAwNTk4NDJ9.LB-jMlnLQcdsNhAzz8YX_bPf3YxZdoST7pJsyJxCxyg'

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}/api/recommendations/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
      console.log('API Response:', result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 自动测试API
    testApi()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Test Page</h1>

      <button onClick={testApi} disabled={loading}>
        {loading ? 'Loading...' : 'Test API'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px', padding: '10px', border: '1px solid red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div style={{ marginTop: '20px' }}>
          <h2>API Response:</h2>
          <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>

          {data.userProfile && (
            <div style={{ marginTop: '15px', border: '1px solid #ddd', padding: '10px' }}>
              <h3>User Profile:</h3>
              <p><strong>Email:</strong> {data.userProfile.email}</p>
              <p><strong>GPA:</strong> {data.userProfile.gpa}</p>
              <p><strong>Major:</strong> {data.userProfile.major}</p>
              <p><strong>TOEFL:</strong> {data.userProfile.toefl}</p>
              <p><strong>GRE:</strong> {data.userProfile.gre}</p>
            </div>
          )}

          {data.recommendation && data.recommendation.schools && (
            <div style={{ marginTop: '15px', border: '1px solid #ddd', padding: '10px' }}>
              <h3>School Recommendations ({data.recommendation.schools.length}):</h3>
              {data.recommendation.schools.map((school: any, index: number) => (
                <div key={index} style={{ marginBottom: '10px', padding: '8px', background: '#f9f9f9' }}>
                  <h4>{school.name}</h4>
                  <p><strong>Program:</strong> {school.program}</p>
                  <p><strong>Location:</strong> {school.location}</p>
                  <p><strong>Tuition:</strong> {school.tuition}</p>
                  <p><strong>Fit Score:</strong> {school.fit}/5 ({school.fitLabel})</p>
                  <p><strong>Note:</strong> {school.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
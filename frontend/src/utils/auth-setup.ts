// Auth setup utility for testing
// This sets the test token in localStorage so the frontend can authenticate with the backend

import { setToken } from '@/lib/auth'

// Token for Ella's real account (valid for 7 days)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZDg1MjljYy0zN2Y1LTQyMjItOWNlYi1lNDdjZDdmMzFkMWIiLCJlbWFpbCI6ImlzbGVuZV96aGFvQG91dGxvb2suY29tIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1OTUxNjA4MSwiZXhwIjoxNzYwMTIwODgxfQ.2g2_XT0VFrxFh19KtXSunw-sJGA0QBmJ-XJ0apFQwRk'

export const setupTestAuth = () => {
  if (typeof window !== 'undefined') {
    setToken(TEST_TOKEN)
    console.log('✅ Test authentication token set')
  }
}

export const clearTestAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    console.log('🗑️ Test authentication token cleared')
  }
}
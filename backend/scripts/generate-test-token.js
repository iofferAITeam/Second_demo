const jwt = require('jsonwebtoken')

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production'

const testUser = {
  userId: 'test-user-id',
  email: 'test@example.com',
  type: 'access'
}

const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '7d' })

console.log('🔐 测试JWT Token:')
console.log(token)
console.log('\n📋 使用方法:')
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:8000/api/recommendations/latest`)
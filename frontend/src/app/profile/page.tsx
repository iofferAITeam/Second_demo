// 🛣️ 用户资料页路由 - 使用ProfilePage组件
'use client'
import ProfilePage from '@/pages/profile/ProfilePage'

// 强制动态渲染，禁用静态生成
export const dynamic = 'force-dynamic'

export default function Profile() {
  return <ProfilePage />
}
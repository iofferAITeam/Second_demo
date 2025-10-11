// 🛣️ 用户资料页面组件
'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import Navbar from '@/components/shared/Navbar'

// 强制动态渲染，禁用静态生成
export const dynamic = 'force-dynamic'

export default function Profile() {
  const { user, formData, isLoading, error } = useProfile()
  const [activeTab, setActiveTab] = useState('academic')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">加载失败</h3>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-foreground">
                  {user?.username || '用户'}
                </h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="border-b border-border mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('academic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'academic'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  学术信息
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'personal'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  个人信息
                </button>
              </nav>
            </div>

            <div className="space-y-6">
              {activeTab === 'academic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      GPA
                    </label>
                    <p className="text-lg text-muted-foreground">
                      {formData?.gpa || '未填写'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      专业
                    </label>
                    <p className="text-lg text-muted-foreground">
                      {formData?.major || '未填写'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      托福成绩
                    </label>
                    <p className="text-lg text-muted-foreground">
                      {formData?.toefl || '未填写'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      目标
                    </label>
                    <p className="text-lg text-muted-foreground">
                      {formData?.goals || '未填写'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      用户名
                    </label>
                    <p className="text-lg text-muted-foreground">
                      {user?.username || '未设置'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      邮箱
                    </label>
                    <p className="text-lg text-muted-foreground">
                      {user?.email || '未设置'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
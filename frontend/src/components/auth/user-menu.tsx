'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface UserMenuProps {
  onAuthModalOpen: () => void
}

export function UserMenu({ onAuthModalOpen }: UserMenuProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={onAuthModalOpen}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200"
      >
        登录/注册
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-6 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <span>{user?.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200" style={{right: '20px'}}>
          <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
            <div className="font-medium">{user?.name}</div>
            <div className="text-gray-500">{user?.email}</div>
          </div>

          <a
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            个人资料
          </a>

          <a
            href="/applications"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            申请管理
          </a>

          <a
            href="/essays"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            文书管理
          </a>

          <div className="border-t border-gray-200"></div>

          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            退出登录
          </button>
        </div>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, memo } from 'react'
import { Dropdown, Avatar, Space } from 'antd'
import { UserOutlined, SettingOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  // 处理登出
  const handleSignOut = () => {
    logout()
    router.push('/auth')
  }

  // 用户菜单配置
  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <Link href="/profile">
          Profile
        </Link>
      ),
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <span className="text-red-500">
          Sign Out
        </span>
      ),
      icon: <LogoutOutlined />,
      onClick: handleSignOut,
    },
  ]

  return (
    <header className="header">
      <nav className="nav">
        <div className="logo">
          <Link href="/home">
            <Image src="/images/logo.png" alt="iOffer" width={120} height={32} />
          </Link>
        </div>

        <ul className="nav-links">
          <li><Link href="/home">Home</Link></li>
          <li><Link href="/chat" className="active">Chat</Link></li>
          <li><Link href="/profile">Features</Link></li>
          <li><Link href="/recommendations">Recommendation</Link></li>
          <li><a href="#">FAQ</a></li>
          <li><a href="#">Contact</a></li>
        </ul>

        <div className="nav-right">
          {!mounted ? (
            // During SSR hydration, show nothing briefly
            <div style={{ width: '120px', height: '40px' }}></div>
          ) : isAuthenticated ? (
            <Dropdown
              menu={{ items: menuItems }}
              placement="bottomRight"
              arrow={{ pointAtCenter: false }}
              trigger={['click']}
              overlayStyle={{
                minWidth: '160px',
              }}
              overlayClassName="user-dropdown"
            >
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" style={{gap: '15px'}}>
                <Avatar
                  size={40}
                  style={{
                    backgroundColor: '#1677ff',
                    color: 'white',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  icon={<UserOutlined />}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                </Avatar>
                <Space className="hidden md:flex" size="large">
                  <span className="text-gray-700 font-medium">
                    {user?.name || user?.email}
                  </span>
                  <DownOutlined className="text-gray-500 text-xs" />
                </Space>
              </div>
            </Dropdown>
          ) : (
            <Link href="/auth" className="signup-button">Sign up / Log in</Link>
          )}
        </div>
      </nav>
    </header>
  )
}

export default memo(Navbar)
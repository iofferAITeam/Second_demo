'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef, memo } from 'react'
import { Dropdown, Avatar, Space } from 'antd'
import { UserOutlined, SettingOutlined, LogoutOutlined, DownOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAuth } from '@/hooks/useAuth'

function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth()


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
      onClick: signOut,
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
          <li><a href="#">Features</a></li>
          <li><a href="#">FAQ</a></li>
          <li><a href="#">Contact</a></li>
        </ul>

        <div className="nav-right">

          {isAuthenticated ? (
            <Dropdown
              menu={{ items: menuItems }}
              placement="bottomRight"
              arrow={{ pointAtCenter: false }}
              trigger={['click']}
              overlayStyle={{
                minWidth: '160px',
              }}
              overlayClassName="user-dropdown"
              onOpenChange={(open: any) => {
                if (open) {
                  // 延迟执行，等待下拉菜单渲染
                  setTimeout(() => {
                    const dropdown = document.querySelector('.ant-dropdown:not([style*="display: none"])');
                    if (dropdown) {
                      const dropdownElement = dropdown as HTMLElement;
                      dropdownElement.style.position = 'fixed';
                      dropdownElement.style.top = '70px';
                      dropdownElement.style.right = '20px';
                      dropdownElement.style.left = 'auto';
                      dropdownElement.style.transform = 'none';
                      dropdownElement.style.zIndex = '9999';
                    }
                  }, 10);
                }
              }}
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
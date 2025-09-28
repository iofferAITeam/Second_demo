'use client'

import React, { useRef } from 'react'

interface ProfileAvatarProps {
  avatar?: string
  name?: string
  email?: string
  onAvatarChange?: (file: File) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProfileAvatar({ 
  avatar, 
  name, 
  email, 
  onAvatarChange,
  size = 'md',
  className = ''
}: ProfileAvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-20 h-20 text-xl',
    lg: 'w-24 h-24 text-2xl'
  }

  const handleAvatarClick = () => {
    if (onAvatarChange) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onAvatarChange) {
      onAvatarChange(file)
    }
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div 
        className={`cursor-pointer hover:opacity-80 transition-opacity relative group ${onAvatarChange ? '' : 'cursor-default'}`}
        onClick={handleAvatarClick}
      >
        <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${onAvatarChange ? 'hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50' : ''} ${className}`}>
          {avatar ? (
            <img
              key={avatar}
              src={avatar}
              alt="Profile Avatar"
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              style={{ zIndex: 10, position: 'relative' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
          <div 
            className="absolute inset-0 flex items-center justify-center text-white font-semibold pointer-events-none"
            style={{ zIndex: 5 }}
          >
            {name ? name.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        
        {onAvatarChange && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all rounded-full">
            <span className="text-white text-xs opacity-0 group-hover:opacity-100">Change</span>
          </div>
        )}
      </div>
    </div>
  )
}

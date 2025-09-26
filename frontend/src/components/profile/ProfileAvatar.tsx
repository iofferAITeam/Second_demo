'use client'

import React, { useRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

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
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl'
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
        <Avatar className={`${sizeClasses[size]} ${onAvatarChange ? 'hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50' : ''}`}>
          <AvatarImage 
            src={avatar} 
            alt="Profile Avatar"
            className="object-cover"
          />
          <AvatarFallback className={`bg-gradient-to-br from-blue-500 to-purple-600 ${textSizeClasses[size]} text-white font-semibold`}>
            {name ? name.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {onAvatarChange && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all rounded-full">
            <span className="text-white text-xs opacity-0 group-hover:opacity-100">Change</span>
          </div>
        )}
      </div>
    </div>
  )
}

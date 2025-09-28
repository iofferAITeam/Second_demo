'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface CustomAvatarProps {
  src?: string
  alt?: string
  name?: string
  email?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fallbackClassName?: string
}

const sizeClasses = {
  sm: 'w-12 h-12 text-sm',
  md: 'w-20 h-20 text-xl',
  lg: 'w-24 h-24 text-2xl'
}

export function CustomAvatar({
  src,
  alt = 'Avatar',
  name,
  email,
  size = 'md',
  className = '',
  fallbackClassName = ''
}: CustomAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Reset error state when src changes
  React.useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
  }, [src])

  const getInitials = () => {
    if (name) {
      return name.charAt(0).toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600',
        sizeClasses[size],
        className
      )}
    >
      {src && !imageError && (
        <img
          key={src} // Force re-render when src changes
          src={src}
          alt={alt}
          className={cn(
            'aspect-square size-full object-cover',
            !imageLoaded && 'opacity-0'
          )}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      {/* Fallback - always render but hide when image is loaded */}
      <div
        className={cn(
          'flex size-full items-center justify-center text-white font-semibold',
          imageLoaded && !imageError && 'opacity-0',
          fallbackClassName
        )}
      >
        {getInitials()}
      </div>
    </div>
  )
}

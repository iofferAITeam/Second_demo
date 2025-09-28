'use client'

import Image from 'next/image'

interface UserProfileProps {
  user: {
    name: string
    avatar: string
  }
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
      </div>
    </div>
  )
}
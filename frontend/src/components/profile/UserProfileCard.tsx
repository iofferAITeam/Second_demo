'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Edit, Check, X } from 'lucide-react'

interface UserProfileCardProps {
  user: {
    name: string
    email: string
    phone?: string
    avatar?: string
    createdAt: string
  }
  subscription: {
    plan: string
    status: string
  }
  onEdit: () => void
  onAvatarUpdate?: (file: File) => void
  onPhoneUpdate?: (phone: string) => void
}

export default function UserProfileCard({ 
  user, 
  subscription, 
  onEdit, 
  onAvatarUpdate,
  onPhoneUpdate 
}: UserProfileCardProps) {
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState(user.phone || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Mask email for privacy (show first few chars and domain)
  const maskedEmail = user.email.replace(/(.{3})(.*)(@.*)/, '$1******$3')
  
  // Mask phone for privacy (show first 3 and last 4 digits)
  const maskedPhone = user.phone ? user.phone.replace(/(\+\d{2}-\d{3})(.*)(\d{4})/, '$1****$3') : ''

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onAvatarUpdate) {
      onAvatarUpdate(file)
    }
  }

  const handlePhoneEdit = () => {
    setIsEditingPhone(true)
  }

  const handlePhoneSave = () => {
    if (onPhoneUpdate) {
      onPhoneUpdate(phoneValue)
    }
    setIsEditingPhone(false)
  }

  const handlePhoneCancel = () => {
    setPhoneValue(user.phone || '')
    setIsEditingPhone(false)
  }

  return (
    <Card className="w-full max-w-[450px] h-full min-h-[320px] shadow-[0px_0px_100px_0px_rgba(28,93,255,0.16)] border-0 bg-white rounded-[20px] overflow-hidden flex flex-col">
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />
      
      <CardContent className="p-5 py-[30px] space-y-6 flex-1 flex flex-col">
        {/* User Info Section */}
        <div className="flex gap-3 items-center w-full">
          {/* Avatar */}
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity relative group"
            onClick={(e) => {
              e.stopPropagation()
              handleAvatarClick()
            }}
          >
            <Avatar className="w-20 h-20" key={user.avatar}>
              <AvatarImage 
                src={user.avatar} 
                alt="Profile Avatar"
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xl text-white font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all rounded-full">
              <span className="text-white text-xs opacity-0 group-hover:opacity-100">Change</span>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Name and Edit Button */}
            <div className="flex items-center justify-between w-full">
              <h2 className="text-[20px] font-semibold text-black leading-none font-['PingFang_SC'] truncate">
                {user.name || 'User'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="text-[#1c5dff] hover:text-blue-700 hover:bg-blue-50 p-1 h-auto font-normal"
              >
                <Edit className="w-4 h-4 mr-1" />
                <span className="font-['Inter']">Edit</span>
              </Button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col gap-2 text-[14px] text-[#96a3c2] font-['PingFang_SC'] leading-none">
              <a 
                href={`mailto:${user.email}`}
                className="hover:text-blue-600 transition-colors cursor-pointer truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {maskedEmail}
              </a>
              {isEditingPhone ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="tel"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    className="flex-1 text-sm h-8"
                    placeholder="+86-188****6666"
                  />
                  <Button
                    size="sm"
                    onClick={handlePhoneSave}
                    className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handlePhoneCancel}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="cursor-pointer hover:text-blue-600 transition-colors truncate"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePhoneEdit()
                  }}
                >
                  {maskedPhone || '+86-188****6666'}
                </div>
              )}
            </div>
          </div>
        </div>

               {/* Subscription Card */}
               <Card 
                 className="h-[120px] rounded-[20px] relative overflow-hidden flex items-center justify-center w-full border-0 mt-auto"
                 style={{
                   background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgb(28, 93, 255) 0%, rgb(28, 93, 255) 100%)'
                 }}
               >
                 <CardContent className="p-0 h-full flex items-center justify-center relative">
                   {/* "NOW" badge with trapezoid shape */}
                   <div className="absolute left-1/2 transform -translate-x-1/2" style={{ top: '-30px' }}>
                     <div className="relative">
                       {/* Upside-down trapezoid background */}
                       <div className="bg-white px-4 py-2 relative" style={{
                         clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)'
                       }}>
                         <div className="text-black text-[14px] font-normal font-['Inter'] text-center">NOW</div>
                       </div>
                     </div>
                   </div>

                   {/* Plan Name */}
                   <div className="text-[24px] font-semibold text-[#1c5dff] text-center font-['Inter'] leading-none">
                     iOffer {subscription.plan.toUpperCase()}
                   </div>
                 </CardContent>
               </Card>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import UserProfileCard from '@/components/profile/UserProfileCard'
import AccountStatusTable from '@/components/profile/AccountStatusTable'
import UpgradeBanner from '@/components/profile/UpgradeBanner'
import EditProfileModal from '@/components/profile/EditProfileModal'
import Navbar from '@/components/shared/Navbar'

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { user, profile, isLoading, error } = useProfile()

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleAvatarUpdate = (file: File) => {
    // TODO: Implement avatar upload functionality
    console.log('Avatar update:', file.name)
    // You can implement the avatar upload logic here
    // For example: uploadAvatar(file) and update user state
  }

  const handlePhoneUpdate = (phone: string) => {
    // TODO: Implement phone update functionality
    console.log('Phone update:', phone)
    // You can implement the phone update logic here
    // For example: updateUserPhone(phone)
  }

  const handlePricingClick = () => {
    // TODO: Implement pricing page navigation
    console.log('Pricing clicked')
    // Navigate to pricing page or open pricing modal
  }

  const handleUpgradeClick = () => {
    // TODO: Implement upgrade functionality
    console.log('Upgrade clicked')
    // Navigate to upgrade page or open upgrade modal
  }

  const handleSaveProfile = (data: any) => {
    // TODO: Implement save functionality
    console.log('Profile data saved:', data)
    // Here you would typically send the data to your backend API
    // For now, just close the modal
    setIsEditModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    )
  }

  // Sample data for AccountStatusTable
  const usageData = [
    {
      service: 'School Selection AI',
      conversationsTimes: 'X',
      timesUsed: 9,
      remainingUses: 1
    }
  ]

  return (
    <div className="h-screen bg-[#f5f9ff] overflow-hidden">
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="h-full flex justify-center items-center">
        <div className="max-w-[1200px] px-4">
          {/* Main Content Layout */}
          <div className="space-y-8">
            {/* Top Row - User Profile Card and Account Status */}
            <div className="flex flex-col lg:flex-row gap-3 h-[320px]">
              {/* User Profile Card */}
              <div className="flex-1 h-full">
                <UserProfileCard
                  user={{
                    name: user.name || 'User',
                    email: user.email,
                    phone: profile?.phone || undefined,
                    avatar: user.avatar ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}` : undefined,
                    createdAt: user.createdAt.toString()
                  }}
                  subscription={{
                    plan: 'FREE', // This could come from user data
                    status: 'active'
                  }}
                  onEdit={handleEdit}
                  onAvatarUpdate={handleAvatarUpdate}
                  onPhoneUpdate={handlePhoneUpdate}
                />
              </div>

              {/* Account Status Table */}
              <div className="flex-1 h-full">
                <AccountStatusTable
                  usageData={usageData}
                  onPricingClick={handlePricingClick}
                />
              </div>
            </div>

            {/* Bottom Row - Upgrade Banner */}
            <div className="!mt-6">
              <UpgradeBanner onUpgradeClick={handleUpgradeClick} />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={{
            name: user.name || 'User',
            email: user.email,
            phone: profile?.phone || undefined,
            avatar: user.avatar ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}` : undefined,
            createdAt: user.createdAt.toString()
          }}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}
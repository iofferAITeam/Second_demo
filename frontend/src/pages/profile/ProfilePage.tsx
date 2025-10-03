'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import UserProfileCard from '@/components/profile/UserProfileCard'
import AccountStatusTable from '@/components/profile/AccountStatusTable'
import UpgradeBanner from '@/components/profile/UpgradeBanner'
import EditProfileModal from '@/components/profile/EditProfileModal'
import Navbar from '@/components/shared/Navbar'
import PaymentModalContainer from '@/components/payments/Payment'

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [avatarCacheBuster, setAvatarCacheBuster] = useState(0)
  const { user, formData, isLoading, error, saveProfile, uploadAvatar } = useProfile()
  const { refreshUser } = useAuth()

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'
  const avatarUrl = user?.avatar ? `${API_BASE_URL}${user.avatar}?v=${avatarCacheBuster}&t=${Date.now()}&bust=${Math.random()}` : undefined

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleAvatarUpdate = async (file: File) => {
    try {
      await uploadAvatar(file)
      // Force avatar refresh by incrementing cache buster after a short delay
      // to ensure the profile data has been updated
      setTimeout(() => {
        setAvatarCacheBuster(prev => prev + 1)
      }, 100)
    } catch (error) {
      console.error('Avatar upload failed:', error)
    }
  }

  const handlePhoneUpdate = (phone: string) => {
    // TODO: Implement phone update functionality
    console.log('Phone update:', phone)
    // You can implement the phone update logic here
    // For example: updateUserPhone(phone)
  }

  const handlePricingClick = () => {
    console.log('Pricing clicked')
    setIsPaymentModalOpen(true)
  }

  const handleUpgradeClick = () => {
    console.log('Upgrade clicked')
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = async () => {
    console.log('Payment success - refreshing user data')
    try {
      await refreshUser()
      console.log('User data refreshed successfully')
      // No need to reload the page - React will re-render with updated data
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      // Fallback: reload page if refresh fails
      window.location.reload()
    }
  }

  const handleSaveProfile = async (data: any) => {
    try {
      await saveProfile(data)
      setIsEditModalOpen(false)
      console.log('Profile data saved successfully:', data)
    } catch (error) {
      console.error('Failed to save profile:', error)
      // Error handling is done in the useProfile hook
    }
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

  if (!user) {
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
                    phone: formData?.basicInfo.phone || undefined,
                    avatar: avatarUrl,
                    createdAt: user.createdAt.toString()
                  }}
                  subscription={{
                    plan: user.isPremium ? 'Pro-AI' : 'Free',
                    status: user.isPremium ? 'premium' : 'free'
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
                  isPremium={user.isPremium}
                />
              </div>
            </div>

            {/* Bottom Row - Upgrade Banner (only for free users) */}
            {!user.isPremium && (
              <div className="!mt-6">
                <UpgradeBanner onUpgradeClick={handleUpgradeClick} />
              </div>
            )}
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
                phone: formData?.basicInfo.phone || undefined,
                avatar: avatarUrl,
                createdAt: user.createdAt.toString()
              }}
              profileData={formData}
              onSave={handleSaveProfile}
              onAvatarUpload={handleAvatarUpdate}
            />
      )}

      {/* Payment Modal */}
      <PaymentModalContainer
        key={isPaymentModalOpen ? 'open' : 'closed'}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          console.log('PaymentModal onClose called - closing modal');
          console.log('Current isPaymentModalOpen:', isPaymentModalOpen);
          setIsPaymentModalOpen(false);
          console.log('Set isPaymentModalOpen to false');
        }}
        onPayment={() => {
          console.log("Payment processing completed!");
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
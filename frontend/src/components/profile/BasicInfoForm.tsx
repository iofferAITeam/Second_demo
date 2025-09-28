import { useState } from 'react'
import { UpdateProfileRequest, User, UserProfile } from '@/types/profile'

interface BasicInfoFormProps {
  user: User | null
  profile: UserProfile | null
  formData: UpdateProfileRequest
  isEditing: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export default function BasicInfoForm({ user, profile, formData, isEditing, onChange }: BasicInfoFormProps) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size cannot exceed 5MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      })

      if (response.ok) {
        const { avatarUrl } = await response.json()
        // Reload the page to reflect avatar changes
        window.location.reload()
      } else {
        alert('Avatar upload failed, please try again')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert('Avatar upload failed, please try again')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  if (!user || !profile) return null

  return (
    <div className="space-y-6">
      {/* Personal Information Section */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900">{user.name || 'Not provided'}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
            )}
          </div>

          {/* WeChat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WeChat ID</label>
            {isEditing ? (
              <input
                type="text"
                name="wechat"
                value={formData.wechat || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your WeChat ID"
              />
            ) : (
              <p className="text-gray-900">{profile.wechat || 'Not provided'}</p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                name="birthDate"
                value={
                  formData.birthDate ||
                  (profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '')
                }
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-900">
                {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : 'Not provided'}
              </p>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
            {isEditing ? (
              <input
                type="text"
                name="nationality"
                value={formData.nationality || ''}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., American, Chinese, Canadian"
              />
            ) : (
              <p className="text-gray-900">{profile.nationality || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Avatar</h3>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl text-white font-semibold">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
            />
            <button
              type="button"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={isUploadingAvatar}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Upload an image (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic & Career Goals</h3>
        {isEditing ? (
          <textarea
            name="goals"
            value={formData.goals || ''}
            onChange={onChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your academic and career goals, what you hope to achieve..."
          />
        ) : (
          <p className="text-gray-900 whitespace-pre-wrap">
            {profile.goals || 'No goals specified yet. Share your academic and career aspirations to help us provide better recommendations.'}
          </p>
        )}
      </div>
    </div>
  )
}
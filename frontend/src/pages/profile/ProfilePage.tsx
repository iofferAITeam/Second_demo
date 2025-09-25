'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { UpdateProfileRequest } from '@/types/profile'
import BasicInfoForm from '@/components/profile/BasicInfoForm'
import AcademicInfoForm from '@/components/profile/AcademicInfoForm'
import DocumentManager from '@/components/profile/DocumentManager'

export default function ProfilePage() {
  const { user, profile, isLoading, error, saveProfile, clearError, profileCompletion } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState<UpdateProfileRequest>({})
  const [saving, setSaving] = useState(false)

  const handleEdit = () => {
    // 预填充表单数据
    setFormData({
      name: user?.name || '',
      phone: profile?.phone || '',
      wechat: profile?.wechat || '',
      birthDate: profile?.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
      nationality: profile?.nationality || '',
      currentEducation: profile?.currentEducation || '',
      gpa: profile?.gpa || undefined,
      major: profile?.major || '',
      graduationDate: profile?.graduationDate ? new Date(profile.graduationDate).toISOString().split('T')[0] : '',
      toefl: profile?.toefl || undefined,
      ielts: profile?.ielts || undefined,
      gre: profile?.gre || undefined,
      gmat: profile?.gmat || undefined,
      goals: profile?.goals || ''
    })
    setIsEditing(true)
    clearError()
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await saveProfile(formData)
      setIsEditing(false)
      alert('Profile saved successfully!')
    } catch (error) {
      alert('Failed to save profile: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
    clearError()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gpa' || name === 'toefl' || name === 'ielts' || name === 'gre' || name === 'gmat'
        ? (value ? parseFloat(value) : undefined)
        : value
    }))
  }

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: '👤' },
    { id: 'academic', name: 'Academic', icon: '🎓' },
    { id: 'documents', name: 'Documents', icon: '📄' },
  ]

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                      alt="Profile Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl text-white font-semibold">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name || user.email}</h1>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Profile Completion */}
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Profile Completion</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${profileCompletion.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{profileCompletion.percentage}%</span>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {activeTab === 'basic' && (
              <BasicInfoForm
                user={user}
                profile={profile}
                formData={formData}
                isEditing={isEditing}
                onChange={handleChange}
              />
            )}

            {activeTab === 'academic' && (
              <AcademicInfoForm
                profile={profile}
                formData={formData}
                isEditing={isEditing}
                onChange={handleChange}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentManager />
            )}

            {/* Action Buttons */}
            {isEditing ? (
              <div className="mt-8 flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {profileCompletion.missingFields.length > 0 ? (
                      <p>Complete missing fields to improve your profile: <strong>{profileCompletion.missingFields.join(', ')}</strong></p>
                    ) : (
                      <p className="text-green-600">🎉 Your profile is complete!</p>
                    )}
                  </div>
                  <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    View Applications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
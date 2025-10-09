'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import ProfileAvatar from './ProfileAvatar'
import ProfileTabs from './ProfileTabs'
import BasicInfoForm from './BasicInfoForm'
import AcademicPerformanceForm from './AcademicPerformanceForm'
import ApplicationIntentionsForm from './ApplicationIntentionsForm'
import { ProfileFormData, BasicInfoData, AcademicPerformanceData, ApplicationIntentionsData } from '@/types/profile-form'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name: string
    email: string
    phone?: string
    avatar?: string
    createdAt: string
  }
  profileData?: ProfileFormData | null  // Preloaded profile data
  onSave: (data: ProfileFormData) => void
  onAvatarUpload?: (file: File) => Promise<void>  // Avatar upload handler
}

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  profileData: preloadedData,
  onSave,
  onAvatarUpload
}: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  
  // Parse name correctly for different name formats
  const parseUserName = (fullName: string) => {
    const nameParts = fullName?.split(' ').filter(Boolean) || []
    let firstName = ''
    let middleName = ''
    let lastName = ''

    if (nameParts.length === 1) {
      firstName = nameParts[0]
    } else if (nameParts.length === 2) {
      firstName = nameParts[0]
      lastName = nameParts[1]
    } else if (nameParts.length >= 3) {
      firstName = nameParts[0]
      middleName = nameParts[1]
      lastName = nameParts.slice(2).join(' ')
    }

    return { firstName, middleName, lastName }
  }

  // Form state using proper types - use preloaded data if available
  const [formData, setFormData] = useState<ProfileFormData>(
    preloadedData || (() => {
      const { firstName, middleName, lastName } = parseUserName(user.name || '')
      return {
        basicInfo: {
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          phone: user.phone || '',
          email: user.email || '',
          nationality: '',
          visaRequired: false
        },
        academicPerformance: {
          gpa: '',
          majorGpa: '',
          major: '',
          languageTestsData: [],
          standardizedTestsData: []
        },
        applicationIntentions: {
          intendedDegree: '',
          intendedIntakeTerm: '',
          intendedMajor: '',
          intendedCountries: [],
          intendedBudgets: '',
          scholarshipRequirements: '',
          otherFinancialAidsRequired: false,
          otherPreference: '',
          careerIntentions: '',
          internshipExperience: '',
          volunteerExperience: ''
        }
      }
    })
  )

  // Update form data when preloaded data changes
  useEffect(() => {
    if (preloadedData) {
      setFormData(preloadedData)
    }
  }, [preloadedData])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Basic validation
      const newErrors: Record<string, string> = {}
      
      if (!formData.basicInfo.firstName.trim()) {
        newErrors['basicInfo.firstName'] = 'First name is required'
      }
      if (!formData.basicInfo.lastName.trim()) {
        newErrors['basicInfo.lastName'] = 'Last name is required'
      }
      if (!formData.basicInfo.email.trim()) {
        newErrors['basicInfo.email'] = 'Email is required'
      }
      
      setErrors(newErrors)
      
      if (Object.keys(newErrors).length === 0) {
        await onSave(formData)
        onClose()
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (section: keyof ProfileFormData, field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    
    // Clear error when user starts typing
    const errorKey = `${section}.${field}`
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  const handleAvatarChange = async (file: File) => {
    if (onAvatarUpload) {
      try {
        await onAvatarUpload(file)
      } catch (error) {
        console.error('Avatar upload failed:', error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent 
        className="w-[90%] h-[80%] mt-32 bg-white rounded-[20px] p-0 border-0 shadow-[0px_0px_100px_0px_rgba(28,93,255,0.16)] flex flex-col items-center gap-[28px] flex-shrink-0 !top-0 !translate-y-0 !max-w-none"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="w-full px-[48px] py-[32px] border-b border-[#e8efff] flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-black font-inter text-[24px] font-semibold leading-[100%]">My Profile</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-5 w-5 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Avatar Section */}
        <ProfileAvatar
          avatar={user.avatar}
          name={user.name}
          email={user.email}
          onAvatarChange={handleAvatarChange}
          size="md"
        />

        {/* Custom Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />


        {/* Form Content */}
        <div className="flex-1 overflow-y-auto w-full bg-white rounded-[20px] px-[48px] py-[20px]">
            {activeTab === 'basic' && (
              <BasicInfoForm
                data={formData.basicInfo}
                errors={errors}
                onChange={(field, value) => handleFormChange('basicInfo', field, value)}
              />
            )}

            {activeTab === 'academic' && (
              <AcademicPerformanceForm
                data={formData.academicPerformance}
                errors={errors}
                onChange={(field, value) => handleFormChange('academicPerformance', field, value)}
              />
            )}
            
            {activeTab === 'application' && (
              <ApplicationIntentionsForm
                data={formData.applicationIntentions}
                errors={errors}
                onChange={(field, value) => handleFormChange('applicationIntentions', field, value)}
              />
            )}
        </div>

        {/* Footer with Save Button */}
        <DialogFooter className="w-full bg-white rounded-bl-[20px] rounded-br-[20px] shadow-[0px_-10px_20px_0px_rgba(28,93,255,0.08)] px-0 py-[20px] flex-shrink-0 !flex !justify-center">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-[16px] py-[8px] rounded-[20px] text-[14px] font-medium font-inter transition-all ${
              isLoading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'SAVING...' : 'SAVE'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

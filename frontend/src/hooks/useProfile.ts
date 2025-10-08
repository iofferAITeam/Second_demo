import { useState, useEffect, useMemo } from 'react'
import { StructuredProfileData, UpdateProfileRequest, ProfileResponse, ProfileCompletion } from '@/types/profile'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/utils/api-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export function useProfile() {
  const [profileData, setProfileData] = useState<StructuredProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  // 自动加载用户Profile数据
  const loadProfile = async () => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data: StructuredProfileData = await response.json()
      setProfileData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      console.error('Profile loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // 用户认证状态变化时自动加载Profile
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile()
    } else {
      setProfileData(null)
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // 保存Profile数据
  const saveProfile = async (updateData: UpdateProfileRequest): Promise<ProfileResponse | null> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      setIsLoading(true)
      setError(null)
      const token = localStorage.getItem('access_token')

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      const result: ProfileResponse = await response.json()

      // Refresh profile data after successful update
      await loadProfile()

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 清除错误
  const clearError = () => {
    setError(null)
  }

  // 刷新Profile数据
  const refreshProfile = async () => {
    await loadProfile()
  }

  // 上传头像
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      setIsLoading(true)
      setError(null)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('avatar', file)

      // Get fresh token
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      // Make direct fetch call with proper headers
      const response = await fetch(`${API_BASE_URL}/api/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Refresh profile data to get updated avatar
      await loadProfile()

      return result.avatarUrl || ''
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 计算Profile完成度
  const profileCompletion: ProfileCompletion = useMemo(() => {
    if (!profileData?.user || !profileData?.profileData) {
      return {
        percentage: 0,
        completedFields: [],
        missingFields: []
      }
    }

    const { user, profileData: formData } = profileData

    // 定义所有需要填写的字段 (基于新的结构化数据)
    const requiredFields = [
      { key: 'name', value: user.name, label: 'Name' },
      { key: 'firstName', value: formData.basicInfo.firstName, label: 'First Name' },
      { key: 'lastName', value: formData.basicInfo.lastName, label: 'Last Name' },
      { key: 'phone', value: formData.basicInfo.phone, label: 'Phone' },
      { key: 'nationality', value: formData.basicInfo.nationality, label: 'Nationality' },
      { key: 'intendedDegree', value: formData.applicationIntentions.intendedDegree, label: 'Intended Degree' },
      { key: 'intendedMajor', value: formData.applicationIntentions.intendedMajor, label: 'Intended Major' },
      { key: 'intendedCountries', value: formData.applicationIntentions.intendedCountries, label: 'Intended Countries' }
    ]

    // 可选字段（不计入必需完成度，但会显示）
    const optionalFields = [
      { key: 'gpa', value: formData.academicPerformance.gpa, label: 'GPA' },
      { key: 'toefl', value: formData.academicPerformance.toeflScore, label: 'TOEFL' },
      { key: 'sat', value: formData.academicPerformance.satScore, label: 'SAT' },
      { key: 'careerIntentions', value: formData.applicationIntentions.careerIntentions, label: 'Career Intentions' },
      { key: 'mbti', value: formData.basicInfo.mbti, label: 'MBTI' },
      { key: 'hobbies', value: formData.basicInfo.hobbies, label: 'Hobbies' }
    ]

    const allFields = [...requiredFields, ...optionalFields]

    const completedFields = allFields
      .filter(field => {
        if (Array.isArray(field.value)) {
          return field.value.length > 0
        }
        return field.value !== null && field.value !== undefined && field.value !== ''
      })
      .map(field => field.label)

    const missingFields = requiredFields
      .filter(field => {
        if (Array.isArray(field.value)) {
          return field.value.length === 0
        }
        return !field.value
      })
      .map(field => field.label)

    // 计算必需字段的完成百分比
    const requiredCompleted = requiredFields.filter(field => {
      if (Array.isArray(field.value)) {
        return field.value.length > 0
      }
      return field.value
    }).length
    const percentage = Math.round((requiredCompleted / requiredFields.length) * 100)

    return {
      percentage,
      completedFields,
      missingFields
    }
  }, [profileData])

  return {
    // 状态
    profileData,
    user: profileData?.user || null,
    formData: profileData?.profileData || null,
    isLoading,
    error,
    profileCompletion,

    // 操作
    saveProfile,
    uploadAvatar,
    clearError,
    refreshProfile
  }
}
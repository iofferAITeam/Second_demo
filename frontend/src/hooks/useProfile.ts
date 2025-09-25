import { useState, useEffect, useMemo } from 'react'
import { ProfileData, UpdateProfileRequest, ProfileResponse, ProfileCompletion } from '@/types/profile'
import { useAuth } from '@/hooks/useAuth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'

export function useProfile() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  // 自动加载用户Profile数据
  const loadProfile = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const token = localStorage.getItem('accessToken')

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data: ProfileData = await response.json()
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
      const token = localStorage.getItem('accessToken')

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

      // 更新本地状态
      setProfileData({
        user: result.user,
        profile: result.profile
      })

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

  // 计算Profile完成度
  const profileCompletion: ProfileCompletion = useMemo(() => {
    if (!profileData?.user || !profileData?.profile) {
      return {
        percentage: 0,
        completedFields: [],
        missingFields: []
      }
    }

    const { user, profile } = profileData

    // 定义所有需要填写的字段
    const requiredFields = [
      { key: 'name', value: user.name, label: 'Name' },
      { key: 'phone', value: profile.phone, label: 'Phone' },
      { key: 'nationality', value: profile.nationality, label: 'Nationality' },
      { key: 'birthDate', value: profile.birthDate, label: 'Birth Date' },
      { key: 'currentEducation', value: profile.currentEducation, label: 'Current Education' },
      { key: 'major', value: profile.major, label: 'Major' },
      { key: 'gpa', value: profile.gpa, label: 'GPA' },
      { key: 'goals', value: profile.goals, label: 'Goals' }
    ]

    // 可选字段（不计入必需完成度，但会显示）
    const optionalFields = [
      { key: 'wechat', value: profile.wechat, label: 'WeChat' },
      { key: 'toefl', value: profile.toefl, label: 'TOEFL' },
      { key: 'ielts', value: profile.ielts, label: 'IELTS' },
      { key: 'gre', value: profile.gre, label: 'GRE' },
      { key: 'gmat', value: profile.gmat, label: 'GMAT' },
      { key: 'graduationDate', value: profile.graduationDate, label: 'Graduation Date' }
    ]

    const allFields = [...requiredFields, ...optionalFields]

    const completedFields = allFields
      .filter(field => field.value !== null && field.value !== undefined && field.value !== '')
      .map(field => field.label)

    const missingFields = requiredFields
      .filter(field => !field.value)
      .map(field => field.label)

    // 计算必需字段的完成百分比
    const requiredCompleted = requiredFields.filter(field => field.value).length
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
    profile: profileData?.profile || null,
    isLoading,
    error,
    profileCompletion,

    // 操作
    saveProfile,
    clearError,
    refreshProfile
  }
}
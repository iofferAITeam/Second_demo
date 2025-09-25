export interface UserProfile {
  id: string
  userId: string
  phone: string | null
  wechat: string | null
  birthDate: Date | null
  nationality: string | null
  currentEducation: string | null
  gpa: number | null
  major: string | null
  graduationDate: Date | null
  toefl: number | null
  ielts: number | null
  gre: number | null
  gmat: number | null
  experiences: any | null  // JSON field for experiences
  goals: string | null
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  createdAt: Date
  language: string
  notifications: boolean
  theme: string
}

export interface ProfileData {
  user: User
  profile: UserProfile
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  wechat?: string
  birthDate?: string
  nationality?: string
  currentEducation?: string
  gpa?: number
  major?: string
  graduationDate?: string
  toefl?: number
  ielts?: number
  gre?: number
  gmat?: number
  experiences?: any
  goals?: string
}

export interface ProfileFormData extends UpdateProfileRequest {
  // 扩展字段用于表单处理
}

// Profile完成度计算
export interface ProfileCompletion {
  percentage: number
  completedFields: string[]
  missingFields: string[]
}

export interface ProfileResponse {
  message: string
  user: User
  profile: UserProfile
}
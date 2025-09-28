// 用户资料相关类型定义

export interface UserProfile {
  id: string
  userId: string
  name?: string
  phone?: string
  gender?: string
  birthDate?: string
  nationality?: string
  currentLocation?: string
  targetCountries?: string
  bio?: string

  // 学术信息
  currentEducation?: string
  school?: string
  major?: string
  gpa?: string
  gpaScale?: string
  graduationDate?: string
  targetDegree?: string
  targetMajor?: string

  // 复杂数据
  educationHistory?: EducationHistory[]
  languageTests?: LanguageTest[]
  experiences?: Experience[]

  createdAt: Date
  updatedAt: Date
}

export interface EducationHistory {
  level: string
  institution: string
  major: string
  gpa: string
  gpaScale: string
  status: 'completed' | 'in-progress'
  startDate?: string
  endDate?: string
}

export interface LanguageTest {
  type: string
  score: string
  date: string
}

export interface Experience {
  company: string
  title: string
  duration: string
  industry: string
  companySize: string
  startDate: string
  endDate: string
  description?: string
}

export interface ProfileUpdateRequest {
  basicInfo?: Partial<UserProfile>
  academicInfo?: Partial<UserProfile>
  educationHistory?: EducationHistory[]
  languageTests?: LanguageTest[]
  experiences?: Experience[]
}
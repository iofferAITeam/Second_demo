// Backend Profile Types - Matches Frontend ProfileFormData Structure

export interface BasicInfoData {
  firstName: string
  middleName?: string
  lastName: string
  phone: string
  email: string
  nationality: string
  visaRequired: boolean
  mbti?: string
  extracurricular?: string
  personalStrengths?: string
  hobbies?: string
}

export interface AcademicPerformanceData {
  gpa?: string
  majorGpa?: string
  satScore?: string
  actScore?: string
  toeflScore?: string
  ieltsScore?: string
  greScore?: string
  gmatScore?: string
  highestDegree?: string
  highSchoolName?: string
  universityName?: string
  graduationYear?: string
  majorSubjects?: string[]
  languageTestType?: string
  languageTestScore?: string
  languageTestDate?: string
  standardizedTestType?: string
  standardizedTestScore?: string
  standardizedTestDate?: string
  researchExperience?: string
  publications?: string
}

export interface ApplicationIntentionsData {
  intendedDegree: string
  intendedIntakeTerm: string
  intendedMajor: string
  intendedCountries: string[]
  intendedBudgets: string
  scholarshipRequirements: string
  otherFinancialAidsRequired: boolean
  otherPreference: string
  careerIntentions: string
  internshipExperience: string
  volunteerExperience: string
}

export interface ProfileFormData {
  basicInfo: BasicInfoData
  academicPerformance: AcademicPerformanceData
  applicationIntentions: ApplicationIntentionsData
}

// Database update structure
export interface UserUpdateData {
  name?: string
}

export interface ProfileUpdateData {
  // Basic Information
  phone?: string
  wechat?: string
  birthDate?: Date
  nationality?: string
  visaRequired?: boolean
  mbti?: string
  extracurricular?: string
  personalStrengths?: string
  hobbies?: string
  
  // Academic Performance
  currentEducation?: string
  gpa?: number
  majorGpa?: number
  major?: string
  graduationDate?: Date
  highestDegree?: string
  highSchoolName?: string
  universityName?: string
  graduationYear?: string
  majorSubjects?: string[]
  
  // Test Scores
  satScore?: number
  actScore?: number
  toefl?: number
  ielts?: number
  gre?: number
  gmat?: number
  languageTestType?: string
  languageTestScore?: string
  languageTestDate?: string
  standardizedTestType?: string
  standardizedTestScore?: string
  standardizedTestDate?: string
  
  // Research & Publications
  researchExperience?: string
  publications?: string
  
  // Application Intentions
  intendedDegree?: string
  intendedIntakeTerm?: string
  intendedMajor?: string
  intendedCountries?: string[]
  intendedBudgets?: string
  scholarshipRequirements?: string
  otherFinancialAidsRequired?: boolean
  otherPreference?: string
  careerIntentions?: string
  internshipExperience?: string
  volunteerExperience?: string
  
  // Legacy fields
  experiences?: any
  goals?: string
}

// Response types
export interface ProfileResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
    avatar?: string
    createdAt: Date
    language: string
    notifications: boolean
    theme: string
  }
  profile: {
    id: string
    userId: string
    phone?: string
    wechat?: string
    birthDate?: Date
    nationality?: string
    visaRequired?: boolean
    mbti?: string
    extracurricular?: string
    personalStrengths?: string
    hobbies?: string
    currentEducation?: string
    gpa?: number
    majorGpa?: number
    major?: string
    graduationDate?: Date
    highestDegree?: string
    highSchoolName?: string
    universityName?: string
    graduationYear?: string
    majorSubjects?: string[]
    satScore?: number
    actScore?: number
    toefl?: number
    ielts?: number
    gre?: number
    gmat?: number
    languageTestType?: string
    languageTestScore?: string
    languageTestDate?: string
    standardizedTestType?: string
    standardizedTestScore?: string
    standardizedTestDate?: string
    researchExperience?: string
    publications?: string
    intendedDegree?: string
    intendedIntakeTerm?: string
    intendedMajor?: string
    intendedCountries?: string[]
    intendedBudgets?: string
    scholarshipRequirements?: string
    otherFinancialAidsRequired?: boolean
    otherPreference?: string
    careerIntentions?: string
    internshipExperience?: string
    volunteerExperience?: string
    experiences?: any
    goals?: string
    createdAt: Date
    updatedAt: Date
  }
}

// Structured response for frontend form preloading
export interface StructuredProfileResponse {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
    createdAt: Date
    language: string
    notifications: boolean
    theme: string
  }
  profileData: ProfileFormData
}

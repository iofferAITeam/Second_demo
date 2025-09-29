export interface UserProfile {
  id: string
  userId: string
  // Basic Information
  phone: string | null
  wechat: string | null
  birthDate: Date | null
  nationality: string | null
  visaRequired: boolean | null
  mbti: string | null
  extracurricular: string | null
  personalStrengths: string | null
  hobbies: string | null
  
  // Academic Performance
  currentEducation: string | null
  gpa: number | null
  majorGpa: number | null
  major: string | null
  graduationDate: Date | null
  highestDegree: string | null
  highSchoolName: string | null
  universityName: string | null
  graduationYear: string | null
  majorSubjects: string[]
  
  // Test Scores
  satScore: number | null
  actScore: number | null
  toefl: number | null
  ielts: number | null
  gre: number | null
  gmat: number | null
  languageTestType: string | null
  languageTestScore: string | null
  languageTestDate: string | null
  standardizedTestType: string | null
  standardizedTestScore: string | null
  standardizedTestDate: string | null
  
  // Research & Publications
  researchExperience: string | null
  publications: string | null
  
  // Application Intentions
  intendedDegree: string | null
  intendedIntakeTerm: string | null
  intendedMajor: string | null
  intendedCountries: string[]
  intendedBudgets: string | null
  scholarshipRequirements: string | null
  otherFinancialAidsRequired: boolean | null
  otherPreference: string | null
  careerIntentions: string | null
  internshipExperience: string | null
  volunteerExperience: string | null
  
  // Legacy fields
  experiences: any | null
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

// New structured response from backend
export interface StructuredProfileData {
  user: User
  profileData: {
    basicInfo: {
      firstName: string
      middleName: string
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
    academicPerformance: {
      gpa: string
      majorGpa: string
      satScore: string
      actScore: string
      toeflScore: string
      ieltsScore: string
      greScore: string
      gmatScore: string
      highestDegree: string
      highSchoolName: string
      universityName: string
      graduationYear: string
      majorSubjects: string[]
      languageTestType: string
      languageTestScore: string
      languageTestDate: string
      standardizedTestType: string
      standardizedTestScore: string
      standardizedTestDate: string
      researchExperience: string
      publications: string
    }
    applicationIntentions: {
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
  }
}

// Legacy interface for backward compatibility
export interface ProfileData {
  user: User
  profile: UserProfile
}

// Update profile request now uses structured form data
export interface UpdateProfileRequest {
  basicInfo: {
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
  academicPerformance: {
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
  applicationIntentions: {
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